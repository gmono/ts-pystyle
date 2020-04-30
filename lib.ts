


export async function delay(mis){
    return new Promise<void>((resolve)=>{
        setTimeout(() => {
            resolve();
        }, mis);
    })   
}


//仿python基础设施
export function *range(start:number,space?:number,end?:number){
    //允许 range(a,c,b) range(b) range(a,b)
    if(space==null&&end==null){
        //1
        yield* range(0,1,start);
    }
    else if(end==null){
        //2
        yield* range(start,1,space);
    }
    else{
        //3
        for(let i=start;i<end;i+=space){
            yield i;
        }
    }
}

export function* enumerate(arraylike:Iterable<any>){
    let now=0;
    for(let a of arraylike){
        yield [now++,a]
    }
}

export function any(arraylike:Iterable<any>)
{
    for(let a of arraylike){
        if(a) return true;
    }
    return false;
}
export function all(arraylike:Iterable<any>)
{
}
export function *zip(...arraylikes:Iterable<any>[]){
    let itors=arraylikes.map(v=>v[Symbol.iterator]());
    for(;;){
        //对所有itor取next 如果全部成功则yield 否则返回
        let ress=itors.map(v=>v.next());
        //not any false
        if(!any(ress.map(v=>!v.done))){
            //返回
            yield ress.map(v=>v.value);
        }
        else return undefined;
    }
}

zip([1,2,3])