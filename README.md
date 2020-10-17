
# 中文说明在下方

# Description
Implementing a Python style turn in Typescript
**This package is large, mainly because the main reason for including the debugging with the sourcemap and source files, packaging will not be packed into the actual source file size 13.6KB**
```ts
import { iter, all, any, call, cartesian, delay, enumerate, input, int, list, print, range, zip } from '. /lib';

//support cutoff
let p=iter(zip([1,2,3],range(1000)])))
p.map(v=>v[0]*2).forEach(v=>print(v));
iter(range(10)).map(v=>v*2).forEach(v=>print(v)).



call(async ()=>{
    let a=zip(zip([1,2,3],[2,3,4])))
    let lst=list(a)
    for(let [i,ii,c] of cartesian(range(10),range(10),range(3),range(3))){
      print([i,ii,c])
    }
    for(;;){
      await delay(1000);
      let test=int(await input("Enter number:")))
      for(let [a,b] of enumerate(zip(zip(range(test),range(test,test*2)))) ){
        print(a,b)
      }
    }

})

```
  
# Content
* Some common functions like enumerate,range,print,input,select,len,zip
* data type related, such as list set map,data type capture str json int float etc.
* Some general convenience functions such as: shuffle randint 
* Special functions.
  * delay function, asynchronous wait function via callback, combined with async await for pseudo-multi-threading.
  * cartesian, a Cartesian product that can be used to omit multiple loops, supports multiple iterators, and can be combined with zip for many effects
* Set operation functions: any all, etc.
* Type judgment function:
  1. assert, exception thrown on false
  2. assertType supports the judgment of types, the types that can be judged are Raw types, i.e., native types and Class types, type aliases, generic interfaces, etc. can not be judged.
* Extension of the Iterable class to allow iterator wrapping without losing types, support for chain calls, use of iter functions to get
# Platform requirements
Test platform.
* node v14.13.0
* typescript 4.0.3
Other platforms, please test on your own.
# Next steps
1. Adding a large number of type determination functions
2. Rich extension iterator, including the introduction of external packages





# 说明
在Typescript中实现Python风格的变成，如
**本包体积较大，主要原因为包括了调试用的sourcemap和源文件，打包时不会打包进去，实际源文件大小13.6KB**
```ts
import { iter, all, any, call, cartesian, delay, enumerate, input, int, list, print, range, zip } from './lib';

//支持切断
let p=iter(zip([[1,2,3],range(1000)]))
p.map(v=>v[0]*2).forEach(v=>print(v));
iter(range(10)).map(v=>v*2).forEach(v=>print(v))



call(async ()=>{
    let a=zip(zip([[1,2,3],[2,3,4]]))
    let lst=list(a)
    for(let [i,ii,c] of cartesian(range(10),range(10),range(3),range(3))){
      print([i,ii,c])
    }
    for(;;){
      await delay(1000);
      let test=int(await input("输入数字:"))
      for(let [a,b] of enumerate(zip(zip(range(test),range(test,test*2)))) ){
        print(a,b)
      }
    }

})

```
  
# 内容
* 一些常用函数如 enumerate,range,print,input,select,len,zip
* 数据类型相关，如 list set map,数据类型抓换 str json int float 等
* 一些通用便利函数如: shuffle randint 
* 特殊函数：
  * delay函数，通过回调实现的异步等待函数，结合async await可实现伪多线程
  * cartesian,笛卡尔积，可用于省略多重循环,支持多个迭代器,结合zip可实现很多效果
  * error 函数，可抛出一个特定消息的错误，简化书写
* 集合操作函数: any all 等
* 类型判断函数:
  1. assert，false时抛出异常
  2. assertType 支持对类型进行判断，可判断的类型有 Raw类型即原生类型和Class类型，类型别名 泛型 接口等不能判断
* 扩展Iterable类，可实现不丢失类型的迭代器包装，支持链式调用，使用iter函数得到
# 平台要求
测试平台：
* node v14.13.0
* typescript 4.0.3
其他平台请自行测试

# 新增功能说明(1.0)
```ts
  let a=await iter(test()).map(async v=>v+1).map(async v=>v*2).sync().then(v=>{
      return v.forEach(v=>print(v)).map(v=>v*3).map((v,i)=>v+i).forEach(v=>print(v))
  });
  let b=a.collect().length;
  print(b);
```
![](res/2020-10-18-04-47-54.png)
如上代码演示了统一异步和同步迭代器的扩展迭代器类的使用，未来将添加更多功能，也可自己继承来支持更多函数

# 下一步计划
1. 添加大量类型判断函数
2. 整理各种工具Type并加入ts-metacode 的generic.ts中