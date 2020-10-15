import {all,any,delay,enumerate,range,zip} from "./lib"


//要解决zip丢失类型问题
for(let s of zip(zip(range(1,10),range(3,12)))){
    console.log(s)
}
