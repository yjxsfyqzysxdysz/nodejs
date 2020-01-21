console.log('hello ts')

/*
  typeScript中的数据类型
  typescript中为了使编写的代码更规范，更有利于维护，增加了类型校验，在typescript中主要给我们提供了以下数据类型
    布尔类型（boolean）
    数字类型（number）
    字符串类型(string)
    数组类型（array）
    元组类型（tuple）
    枚举类型（enum）
    任意类型（any）
    null 和 undefined
    非原始类型（object）
    void类型
    never类型
*/

//布尔类型（boolean）

// es5的写法 （正确写法）  ts中（错误写法）
// var flag = true
// flag = 456

// typescript中为了使编写的代码更规范，更有利于维护，增加了类型校验
// 写ts代码必须指定类型
var a: boolean = true
// a=123 // 错误
a = false // 正确

// 数字类型（number）
var b: number = 123
b = 456  //  正确
// b = 'str' //  错误
        
// 字符串类型(string)
var c: string = 'this is ts'
c = 'haha'  //正确
// c = true  //错误

// 数组类型（array）  ts中定义数组有两种方式
// var d = ['1', '2'] // es5定义数组
// 1.第一种定义数组的方式
var d1: number[] = [11, 22, 33]
//2.第二种定义数组的方式
var d2: Array<number> = [11, 22, 33]

// 元组类型（tuple）  属于数组的一种
var d3: Array<number> = [11, 22, 33]
var d4: [number, string] = [123, 'this is ts']
/*
枚举类型（enum）
  随着计算机的不断普及，程序不仅只用于数值计算，还更广泛地用于处理非数值的数据。
  例如：性别、月份、星期几、颜色、单位名、学历、职业等，都不是数值数据。  
  在其它程序设计语言中，一般用一个数值来代表某一状态，这种处理方法不直观，易读性差。
  如果能在程序中用自然语言中有相应含义的单词来代表某一状态，则程序就很容易阅读和理解。
  也就是说，事先考虑到某一变量可能取的值，尽量用自然语言中含义清楚的单词来表示它的每一个值，
  这种方法称为枚举方法，用这种方法定义的类型称枚举类型。
    enum 枚举名{ 
        标识符[=整型常数], 
        标识符[=整型常数], 
        ... 
        标识符[=整型常数], 
    }      
 */
enum Color { blue, red = 3, 'orange' }
var e: Color = Color.red
// console.log(e) // 1 如果标识符没有赋值 它的值就是下标

enum Flag { success, error }
var f: Flag = Flag.success
// console.log(f)

enum Err { 'undefined' = -1, 'null' = -2, 'success' = 1 }
var g: Err = Err.undefined
// console.log(g)

// 任意类型（any）
var h: any = 123
h = true
// console.log(h)
var i: any[] = ['2312', 22, true]
// console.log(i)


// null 和 undefined
var j: number | undefined;
// console.log(j)
var k: null
k = null

// 一个元素可能是number类型、null、undefined
var l: number | null | undefined
l = 132
// console.log(l)

// void类型 :typescript中的void表示没有任何类型，一般用于定义方法的时候方法没有返回值。
// es5 方法
// function m() {
//   console.log('m')
// }
function m(): void {
  console.log('m')
}
// m()

// never类型:是其他类型 （包括 null 和 undefined）的子类型，代表从不会出现的值
// 这意味着声明never的变量只能被never类型所赋值
var n: undefined
n = undefined
var o: null
o = null
var p: never
p = () => {
  throw new Error('error')
}
// p()














