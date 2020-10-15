import {all,any,call,delay,enumerate,input,int,list,print,range,zip} from "./lib"


//要解决zip丢失类型问题
for(let [i,s] of enumerate(zip(zip(range(1,10),range(3,12))))){
    console.log(i,s)
}
call(async ()=>{
    let a=zip(zip([[1,2,3],[2,3,4]]))
    let lst=list(a)
    for(;;){
      await delay(1000);
      let test=int(await input("输入数字:"))
      for(let [a,b] of enumerate(zip(zip(range(test),range(test,test*2)))) ){
        print(a,b)
      }
    }
})


