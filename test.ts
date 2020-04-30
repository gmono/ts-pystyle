import {all,any,delay,enumerate,range,zip} from "./lib"


for(let [a,b] of zip(range(1,10),range(3,12))){
    console.log(a,b)
}