import { iter, all, any, call, cartesian, delay, enumerate, input, int, list, print, range, zip } from './lib';

//支持切断
// let p=iter(zip([[1,2,3],range(1000)]))
// p.map(v=>v[0]*2).forEach(v=>print(v));
// iter(range(10)).map(v=>v*2).forEach(v=>print(v))



call(async ()=>{
  let a=await iter(test()).map(async v=>v+1).map(async v=>v*2).sync().then(v=>{
      return v.forEach(v=>print(v)).map(v=>v*3).map((v,i)=>v+i).forEach(v=>print(v))
  });
  let b=a.collect().length;
  print(b);
    // let a=zip(zip([[1,2,3],[2,3,4]]))
    // let lst=list(a)
    // for(let [i,ii,c] of cartesian(range(10),range(10),range(3),range(3))){
    //   print([i,ii,c])
    // }
    // for(;;){
    //   await delay(1000);
    //   let test=int(await input("输入数字:"))
    //   for(let [a,b] of enumerate(zip(zip(range(test),range(test,test*2)))) ){
    //     print(a,b)
    //   }
    // }

})


async function * test(){
  yield *[1,2,3]
}

