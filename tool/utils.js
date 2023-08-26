const fs = require('fs')
const _path = require('path')
const download = require('download')

const {
  ROOT_PATH,
  PREFIX_PATH,
  SUFFIX_PATH,
  LOCAL_DATA_PATH,
  LOCAL_TMP_DATA_PATH,
  LOOP_NUM,
  MEITU_PATH,
  MEITU_MIDPATH,
  IS_ONLEY_ONE,
  REGEXP_RUL,
  LOG_COLOR,
  DEFINE_URL
} = require('./config')
const { html } = require(LOCAL_TMP_DATA_PATH)
const jsonData = require(_path.resolve(LOCAL_DATA_PATH))
const { LIST } = jsonData

function downloadFun(url, filePath, option) {
  const options = {
    rejectUnauthorized: false,
    // filename
    ...option
  }
  return download(url, filePath, options)
}

/**
 * 过滤 path
 * @param {String} path
 */
const filterPath = path => {
  return path
    .replace(/[-–]/g, '-')
    .replace(/[/\\]/g, '_')
    .replace(/[（（]/g, '(')
    .replace(/[））]/g, ')')
    .replace(/[】］]/g, ']')
    .replace(/[［【]/g, '[')
    .replace(/\.{2,}/g, '.')
    .replace(/[，，,。“”'"‘’？?!！～：:、；;|~\s]|&nbsp;|\s{2,}/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.+$/, '')
    .trim()
}

/**
 * 设置 log 颜色
 * @param {String} color 参见LOG_COLOR keys
 * @param {String} text 需要变色的词条 %s - log 第二个入参值
 * @param {Boolean} isEnd 是否结束,若不结束 后续结尾次颜色
 */
function setLogColor(color, text = '%s', isEnd = true) {
  return `${LOG_COLOR[color]}${text}${isEnd ? LOG_COLOR.end : ''}`
}

/**
 * log
 * @param {JSON} data
 * @description 返回 String 的 data 及 length
 */
function log(data) {
  console.log(JSON.stringify(data, null, 1), data.length)
}

/**
 * 获取详细文件名,回调返回文件名及路径
 * @param {String} path 路径
 * @param {Boolean} status 是否创建文件夹
 * @returns {Array} 从文件夹中查找的项
 * @description
 * 过滤不符合要求的文件夹名称,
 * 默认不加后缀查找，若不存在则添加后缀
 *
 * 默认如果不存在就新建
 */
function FSsearchDir(path, status = false) {
  if (!path) {
    console.log('path is empty')
    return []
  }
  path = filterPath(path)
  // 同步读取文件
  let add = `${ROOT_PATH}${path}${SUFFIX_PATH}`
  if (!fs.existsSync(add)) {
    add = `${ROOT_PATH}${path}`.trim()
    if (!fs.existsSync(add)) {
      if (status) {
        return []
      }
      fs.mkdirSync(add)
    }
  }
  const files = fs.readdirSync(add)

  return files.filter(file => fs.statSync(add + '/' + file).isFile())
}

/**
 * 数据保存到本地
 * @returns Promise
 */
function FSsave(data = jsonData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(LOCAL_DATA_PATH, JSON.stringify(data, null, 2), err => {
      if (err) {
        console.log(setLogColor('red'), '[ERROR]', '保存到本地文件失败', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * 返回 论坛 页面 title
 */
function getTitleHTML2CL() {
  let [, res = ''] = html.match(/<h4 class="f16">(.+)<\/h4>/) || []
  if (res) {
    res = filterPath(res)
  }
  return res
}

/**
 * 返回 论坛 图片地址
 * @returns {Array} 带有 url 的 array
 */
function getHTML2CL() {
  const filterURLs = html.match(/ess-data="([\u4e00-\u9f5a0-9a-z:;?=/._\-–\\%~&\s]+)"/gi)
  let message = '没有过滤出 URL'
  if (filterURLs) {
    const list = [
      ...new Set(
        // filterURLs.map(e => e.replace(/^ess-data="|\s|"$/g, '').replace(/&amp;/g, '&')).filter(e => !/\.gif$/i.test(e))
        filterURLs
          .map(e => e.replace(/^ess-data="|"$/g, '').replace(/&amp;/g, '&'))
          .filter(e => !/\.gif$/i.test(e) && !DEFINE_URL.includes(e))
      )
    ]
    if (list.length) {
      return list
    }
    message = '没有滤出有效的 URL(如非 gif)'
  }
  console.log(message)
  return []
}

/**
 * 返回 tw 图片地址
 * @returns {Array} 带有 url 的 array
 */
function getHTML2TW() {
  const filterURLs = html
    .replace(/&amp;/g, '&')
    .replace(/\(&quot;([a-z0-9/:.&;=?_-]+)&quot;\)/gi, '')
    .replace(/(name=)[a-z0-9]*/gi, '$1large')
    .match(/http(s)?:\/{2}pbs\.twimg\.com\/media\/[a-z0-9?=_&*-]+/gi)
  if (!filterURLs) {
    console.log('没有过滤出 URL')
    return []
  }
  return filterURLs
}

/**
 * 创建 mt 图片地址
 * @param {String} fileName 文件名
 * @param {String} lastPath 本次画册key
 * @param {Number} num 该相册数量 从0开始计数
 * @returns {Array} 带有 url 的 array
 */
function getURL2MT({ fileName, lastPath, num }) {
  let midPath = ''
  for (const key in MEITU_MIDPATH) {
    if (fileName.includes(key)) {
      midPath = MEITU_MIDPATH[key]
      break
    }
  }
  if (!midPath) {
    console.log(`请在 config.js 的 MEITU_MIDPATH 中添加关键字 关于 ${fileName}`)
    return []
  }
  const PATH = `${MEITU_PATH}/${midPath}/${lastPath}/`
  const list = ['0.jpg']
  for (let i = 1; i <= num; i++) {
    list.push(`${PATH}${i.toString().padStart(3, '0')}.jpg`)
  }
  return list
}

/**
 * 保存到本地
 */
function saveLocal({ path = '', list = [], index = 0 }) {
  if (!list.length || !path) {
    console.log('saveLocal path or list is empty')
    return
  }
  const { path: everyPath } = LIST[index]
  path = filterPath(path)
  const isSameIndex = LIST.findIndex(({ path: curPath }) => curPath === path)
  // 查重 & 任意项
  if (isSameIndex !== -1) {
    const tmp = list.filter(e => !LIST[isSameIndex].list.includes(e))
    if (tmp.length) {
      LIST[isSameIndex].list.push(...tmp)
      // LIST.splice(index, 1, { path, list: [...new Set([...everyList, ...list])] })
    } else {
      console.log(setLogColor('red'), '[ERROR]', `第 ${setLogColor('yellow', isSameIndex + 1)} 项 path 重复\n${path}`)
      return
    }
  }
  // 首项
  else if (index === 0) {
    LIST.splice(index, 0, { path, list })
  }
  // 末项
  else if (index === LIST.length - 1 || everyPath === PREFIX_PATH) {
    LIST.splice(-1, 0, { path, list })
  }
  // 异常
  else {
    console.log(setLogColor('red'), '[ERROR]', `path 异常\n${index} 项 path 为 ${everyPath}\n解析 path 为 ${path}`)
    return
  }
  FSsave(jsonData).then(() => {
    console.log(setLogColor('green'), '[SUCCESS]', `${LIST.length} ${list.length} ${path} 保存到本地文件成功`)
  })
}

/**
 * 过滤出本地没有的 url
 * @param {Array} list 需要校验的 list
 * @param {Array} localList 本地文件夹中的 list
 * @returns {Array} 去重后的 array
 */
function filterURL({ list = [], localList = [] }) {
  if (!localList.length) {
    return list
  }
  return list.filter(e => {
    return !localList.some(f => {
      // return e.includes('/' + f) || e.includes('/' + f.replace(/-/g, '_'))
      return new RegExp(`/${f}(.[a-z]+)?$`, 'i').test(e)
    })
  })
}

/**
 * 整理本地数据
 * @description 去重，合并，补充 fileName
 */
function filterLocalData() {
  const tmp = new Map()
  let count = [0, 0] // 去重前, 去重后
  let emptyFileNameCount = 0 // 空文件名
  LIST.forEach(({ path, list }) => {
    // 补充 fileName
    if (!path) {
      path = '新建文件夹' + Date.now() + Math.trunc(Math.random() * 1e3)
      emptyFileNameCount++
    }
    if (!tmp.has(path)) {
      tmp.set(path, { path, list: [] })
    }
    // 去重
    const tmpData = tmp.get(path)
    const oldList = tmpData.list
    const newList = [...new Set([...oldList, ...list])]
    tmpData.list = newList
    // log
    count[0] += list.length
    count[1] += newList.length - oldList.length
    // 合并
    tmp.set(path, tmpData)
  })
  console.log(count)
  // return
  // 排序
  const oldList = Array.from(tmp.values())
  const newList = Array.from(tmp.values()).sort((a, b) => (a.path > b.path ? 1 : -1))
  const isSame =
    oldList.reduce((res, { path }) => res + path[0], '') === newList.reduce((res, { path }) => res + path[0], '')
  if (LIST.length == tmp.size && count[0] == count[1] && !emptyFileNameCount && isSame) {
    console.log(setLogColor('yellow'), '[WARN]', '没有可以 去重、合并、补充fileName、排序 的项')
    return
  }
  jsonData.LIST = newList
  FSsave(jsonData).then(() => {
    let message = '保存到本地文件成功'
    !isSame && (message += '\n已重新排序')
    LIST.length != tmp.size && (message += `\n合并文件夹 ${LIST.length - tmp.size} 个`)
    count[0] != count[1] && (message += `\n删除重复文件 ${count[0] - count[1]} 个`)
    emptyFileNameCount && (message += `\n补充 fileName ${emptyFileNameCount} 个`)
    message += '\n总计'
    message += `\n  现有文件夹 : ${tmp.size}`
    message += `\n  现有文件   : ${count[1]}`
    console.log(setLogColor('green'), '[SUCCESS]', message)
  })
}

/**
 * 过滤本地未下载的项
 * @param {Number} index LIST 的下标
 */
function filterDataAndLocal(list = [], path = '') {
  const localList = FSsearchDir(path)
  return filterURL({ list, localList })
}

// 下载
function downloadHandler({ list, path, toast = 0, index = 0 }) {
  if (!list.length) return console.log(setLogColor('yellow'), '[WARN]', 'the list is empty')
  const filePath = `${ROOT_PATH}${filterPath(path + SUFFIX_PATH)}`.trim()
  const message = `No.${toast * LOOP_NUM + 1} to NO.${(toast + 1) * LOOP_NUM}`
  const [, regImageproxyUrl, regFileNameEn, regFileNameCh] = REGEXP_RUL
  console.time(`to download ${message}`)
  return Promise.allSettled(
    list.splice(0, LOOP_NUM).map((url, i) => {
      let filename = undefined
      if (regImageproxyUrl.test(url)) {
        filename = decodeURIComponent(url.match(regFileNameEn)[2])
      } else {
        filename = decodeURIComponent(url.match(regFileNameCh)[2])
      }
      return downloadFun(encodeURI(url), filePath, { filename })
        .then(() => {
          console.log(`SUCCESS No.${toast * LOOP_NUM + 1 + i}`)
        })
        .catch(err => {
          console.log(setLogColor('red'), '[ERROR]', err.statusCode || err.code || err, url)
          return Promise.reject()
        })
    })
  )
    .then(res => {
      console.timeEnd(`to download ${message}`)
      if (res.find(({ status }) => status === 'rejected')) return Promise.reject()
    })
    .then(() => {
      if (!list.length) {
        console.log(setLogColor('green'), '[SUCCESS]', `${path} all finsh`)
        let newData = LIST[++index]
        if (newData && newData.list && newData.list.length) {
          if (IS_ONLEY_ONE) return
          const downloadList = filterDataAndLocal(newData.list, newData.path)
          console.log(`download ${index + 1} / ${LIST.length} ${newData.path} total: ${downloadList.length}`)
          downloadHandler({ list: downloadList, path: newData.path, index })
        } else {
          console.log(setLogColor('magenta'), '[ERROR]', 'all clear')
        }
        return
      }
      downloadHandler({ list, path, toast: ++toast, index })
    })
    .catch(() => {
      console.log(setLogColor('red'), '[ERROR]', index + 1, ' / ', LIST.length, path)
    })
}

// 下载 定制版
function downloadHandler2(data, index = 0) {
  const { list: listItem, path: pathItem } = data[index]
  LIST.splice(0, Number.MAX_SAFE_INTEGER, ...data)
  const list = filterDataAndLocal(listItem, pathItem)
  console.log(`download ${index + 1} / ${data.length} ${pathItem} total: ${list.length}`)
  downloadHandler({ list, path: pathItem, index })
}

module.exports = {
  log,
  FSsearchDir,
  getTitleHTML2CL,
  getHTML2CL,
  getHTML2TW,
  getURL2MT,
  saveLocal,
  filterURL,
  downloadHandler,
  downloadHandler2,
  filterDataAndLocal,
  filterLocalData,
  setLogColor
}
