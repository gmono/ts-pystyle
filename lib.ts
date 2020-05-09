

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

export function print<T extends any[]>(...data:T){
    console.log(...data);
}
export function *zip(...arraylikes:Iterable<any>[]){
    let itors=arraylikes.map(v=>v[Symbol.iterator]());
    for(;;){
        //对所有itor取next 如果全部成功则yield 否则返回
        let ress=itors.map(v=>v.next());
        // print(ress);
        //如果有一个结束
        if(any(ress.map(v=>v.done))){
            //返回
            return undefined;
        }
        else yield ress.map(v=>v.value);
    }
}


//数据容器构造区域

export function list(iter?:Iterable<any>){
    if(iter==null) return list([]);
    let ret=[]
    for(let a of iter){
        ret.push(a)
    }
    return ret;
}
export function dict<T1,T2>(iter?:Iterable<[T1,T2]>):Map<T1,T2>{
    //构造一个map容器
    let m=new Map<T1,T2>();
    for(let a of iter){
        m.set(a[0],a[1]);
    }
    return m;
}
export function set<T>(iter?:Iterable<T>):Set<T>
{
    let m=new Set<T>();
    for(let a of iter){
        m.add(a);
    }
    return m;
}

//数据操作
export function *keys<T extends object=any,K=any,V=any>(obj:T|Map<K,V>)
{
    //取对象的key或map的所有key 枚举
    if(obj instanceof Map){
        //枚举
        for(let a of obj.keys()){
            yield a;
        }
    }
    else if(typeof obj =="object"){
        for(let k in obj){
            yield k;
        }
    }
}

type HasLength={length:number}|{size:number}|{count:number}|{__len__():number};
//以下为调用协议
export function len(obj:Iterable<any>|HasLength|object){
    if("length" in obj){
        return obj.length
    }else if ("size" in obj){
        return obj.size;
    }else if("count" in obj){
        return obj.count;
    }else if("__len__" in obj){
        return obj.__len__()
    }else if(typeof obj=="object"){
        let s=0;
        for(let i in obj){
            s++;
        }
        return s;
    }
}

//把对象也转化为一个iterable


//以下为类型扩展部分

//扩展数组 和 有类型数组
//在map reduct filter基础上增加函数
//提供select函数，可支持使用 序号数组 bool数组 slice 和普通idx选取
//这里仿numpy实现

//实现 ndarray 和 ndarray<type>标识普通数组 ndarray<uint8> ndarray<int32> 等标识类型数组

//强类型支持部分
type uint8=void;
type uint16=void;
type uint32=void;
type int8=void;
type int16=void;
type int32=void;
type float32=void;
type float64=void;

type int=int32;
type uint=uint32;
type double=float64
type float=float32;

type integerType=uint8|uint16|uint32|int8|int16|int32;
type floatType=float|double;
type ForceType=integerType|floatType;

//兼容类型定义 未解决问题：dict是object还是Map
//答案：使用Proxy代理object访问并转发到Map
type list<T>=Array<T>;


//biaoshi多维数组
type ndarray<T=any>=T extends ForceType ? TypedNDArray<T>:NDArray<T>;





//标识有类型数组
type TypedNDArray<T>=T extends uint8? Uint8Array:
                    T extends uint16? Uint16Array:
                    T extends uint32? Uint32Array:
                    T extends int8? Int8Array:
                    T extends int16? Int16Array:
                    T extends int32? Int32Array:
                    T extends float32? Float32Array:
                    T extends float64? Float64Array:never;

type TypedArray=Uint8Array|
                Uint16Array|
                Uint32Array|
                Int8Array|
                Int16Array|
                Int32Array|
                Float32Array|
                Float64Array;


//标识普通数组
//原始列表未list 普通数组即弱类型数组 普通数组有的函数强类型数组一样有
//实际分开实现
//
interface NDArray<T=any> extends Array<T>{
    shape:list<number>;
    ndim:number;
    //基本函数
    reshape():NDArray<T>;
    transpose():NDArray<T>;
}
//这里实际扩展
Array.prototype["reshape"]=function(this:any[]){
    //flat并重新填充数组
    
}

//采用函数转换方法
function array<T>(arr:T[]){
    return arr as unknown as  ndarray<T>;
}

let a=array(["hello"])

