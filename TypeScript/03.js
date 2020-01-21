"use strict";
// 类
var consoleValue;
// es5中的类
// 1、最简单的类
function Fun1() {
    this.name = 'Wang';
    this.age = 20;
}
var class1 = new Fun1();
// consoleValue = class1.name
// 2、构造函数和原型链里面增加的方法
Fun2.prototype.sex = 'Man';
Fun2.prototype.work = function () {
    return this.name + ' - work';
};
function Fun2() {
    this.name = 'Wang';
    this.age = 20;
    this.run = function () {
        return this.name + ' - run';
    };
}
var class2 = new Fun2();
// consoleValue = class2.run()
// consoleValue = class2.sex
// consoleValue = class2.work()
// 原型链上的属性实例会被多个构造函数所共享，构造函数不会
// 3、类中的静态方法
function Fun3() {
    this.name = 'Wang';
    this.age = 20;
    this.run = function () {
        return this.name + ' - run';
    };
}
// 静态方法不需要实例化
Fun3.getInfo = function () {
    return '静态方法';
};
// consoleValue = Fun3.getInfo()
// 4、es5中的继承 对象冒充实现继承
// Fun4类继承Fun3类 原型链 + 对象冒充的组合模式
function Fun4() {
    Fun2.call(this); // 对象冒充实现继承
}
var class3 = new Fun4();
// consoleValue = class3.run() // 对象冒充可以继承构造函数里面的属性和方法
// consoleValue = class3.work() // 无法继承原型链上面的属性和方法
// 5、es5中的继承 原型链实现继承
function Fun5() {
    this.name = 'Wang';
    this.age = 20;
    this.run = function () {
        return this.name + ' - run';
    };
}
Fun5.prototype.sex = 'Man';
Fun5.prototype.work = function () {
    return this.name + ' - work';
};
// Fun6类 继承 Fun5类 原型链 + 对象冒充的组合继承模式
function Fun6() { }
Fun6.prototype = new Fun5(); // 原型链实现继承
var class4 = new Fun6();
// consoleValue = class4.work()
// 原型链实现继承：可以继承构造函数里的属性和方法 也可以继承原型链上的属性和方法
// 6、原型链实现继承 的问题
function Fun7(name, age) {
    this.name = name;
    this.age = age;
    this.run = function () {
        return this.name + ' - run';
    };
}
Fun7.prototype.sex = 'Man';
Fun7.prototype.work = function () {
    return this.name + ' - work';
};
function Fun8() { }
Fun8.prototype = new Fun7(); // 原型链实现继承
var class5 = new Fun8();
// consoleValue = class5.run('B', 20) // 实例化时，无法给父类传参
console.log(consoleValue);
