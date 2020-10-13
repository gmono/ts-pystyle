# 说明
在Typescript中实现Python风格的变成，如
```ts
print(data)
let a=list(zip(...list(zip(...[[1,2,3],[2,3,4]]))))
```
其中a的类型为[number,number][]    
# 内容
* 一些常用函数如 enumerate,range,print,input,select,len,zip
* 数据类型相关，如 list set map,数据类型抓换 str json int float 等
* 一些通用便利函数如: shuffle randint 
* 特殊函数：delay函数，通过回调实现的异步等待函数，结合async await可实现伪多线程
* 集合操作函数: any all 等
* 类型判断函数:
  1. assert，false时抛出异常
  2. assertType 支持对类型进行判断，可判断的类型有 Raw类型即原生类型和Class类型，类型别名 泛型 接口等不能判断
# 平台要求
测试平台：
* node v14.13.0
* typescript 4.0.3
其他平台请自行测试
