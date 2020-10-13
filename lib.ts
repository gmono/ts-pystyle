

export async function delay(mis){
    return new Promise<void>((resolve)=>{
        setTimeout(() => {
            resolve();
        }, mis);
    })   
}

//不包括max 从0开始
export function randint(max: number) {
    return Math.floor(Math.random() * max) % max;
}

//仿python基础设施
export function *range(start:number,space?:number,end?:number):Iterable<number>{
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

export function* enumerate<T>(arraylike:Iterable<T>):Iterable<[number,T]>{
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

type MapToIteratable<T extends any[]>={[R in keyof T]:Iterable<T[R]>};
//用作类型引用
type ZipType<T extends any[]>=Iterable<T>;
//将一个数组列表压缩为一个元组列表
export function *zip<T extends any[]>(...arraylikes:MapToIteratable<T>):Generator<T,void,void>{
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
        else yield ress.map(v=>v.value) as T;
    }
}

//两次zip还原
let a=list(zip(...list(zip(...[[1,2,3],[2,3,4]]))))

//基本操作
//打乱
//双向队列 支持中间删除
import Denque from "denque"
export function shuffle<T>(arl:Iterable<T>):T[]{
    //随机选择idx进行填空 建立idx表 填一个删一个
    let dq=new Denque<number>()
    let a=list(arl);
    let idxs=list(range(len(a)));
    idxs.forEach(v=>dq.push(v));
    //随机从dq中选择一个idx 然后把那个位置的idx删掉
    let r=new Array<T>(len(a))
    for(let t of a){
        //t为新得到的单词
        //选择一个idx
        let i=randint(len(dq));
        let idx=dq.get(i)
        dq.removeOne(i);
        //随机填空
        r[idx]=t;
    }
    return r;
}
//默认是升序
//排序函数 未来的array实现将省略list 这个扫描过程
export function sorted<T>(arl:Iterable<T>,key:(v:T)=>number=null,sorttype:"ASC"|"DESC"="ASC"){
    let ret=list(arl).sort((a,b)=>{
        let [k,kk]=[-key(a),-key(b)]
        return k-kk;
    })
    return ret;
}
//按索引表 在iterable中选择值
//通常基于迭代器的通用实现比较慢 基于可随机访问存储的数组实现比较快
//未来将转换到多重签名实现上
export function byIdx<T>(arl:Iterable<T>,idxs:number[]){
    let l=list(arl);
    let ret=idxs.map(v=>l[v]);
    return ret;
}
//不放回采样
export function extract<T>(arl:Iterable<T>,count:number):T[]{
    //从一个列表中采样 不放回
    let a=list(arl);
    let idx=shuffle(range(len(a))).slice(0,count);
    print(idx);
    return byIdx(a,idx);
}
//有放回采样
export function sample<T>(arl:Iterable<T>,count:number):T[]{
    //从一个列表中采样 有放回
    let a=list(arl);
    let idx=list(range(len(a))).map(v=>randint(len(a)));
    return byIdx(a,idx);
}
//数学
export let min=Math.min;
export let max=Math.max;

/**
 * 插入
 * @param arl 数组
 * @param point 插入位置 插入到这个位置的元素前面 为 0-len(arl) 的值
 * @param val 插入值
 */
export function insert<T>(arl:Iterable<T>,point:number,val:T):T[]{
    let newar=[]
    let a=list(arl);
    a.forEach((v,idx)=>{
        if(point==idx) newar.push(val);
        newar.push(v);
    });
    if(len(a)==point) newar.push(val);
    return newar;
}


//基本数据
interface AsInt{
    toInt():number;
}
interface AsFloat{
    toFloat():number;
}
export function int(other:string|number|AsInt){
    if(typeof other=="string") return parseInt(other);
    else if(typeof other=="number") return other|0;
    else if("toInt" in other){
        return other.toInt()
    }else return 0;
}
type AsString={toString:()=>string}|;
export function str(n:AsString){
    if(assertType(n,"object")){
        return n.toString();
    }else if(assertType(n,"string")) return n;

    return new Number(n).toString();
}
export function float(other:string|number|AsFloat){
    if(typeof other=="string") return parseFloat(other);
    else if(typeof other=="number") return other;
    else if("toFloat" in other){
        return other.toFloat()
    }else return 0;
}
//特殊工具函数
export function assert(n:boolean,msg:string){
    if(!n) throw new Error(msg);
    
}

type  TypeList= RawTypeList| "object" | "function";
type RawTypeList="string" | "number" | "bigint" | "boolean" | "symbol" | "undefined";
type TypeMap<name extends TypeList>=name extends "string"? string:
                    name extends "number"? number:
                    name extends "bigint"? bigint:
                    name extends "boolean"? boolean:
                    name extends "symbol"? symbol:
                    name extends "function"? Function:
                    name extends "undefined"? undefined:
                    name extends "object"? object:never;
type ClassType=new(...args)=>any;
//此为类型判断函数系列 可用于类型推导 
//用法: assertType(a,b) b为string时 判断原生类型 b为class时判断实例类型
//! 不可用于判断接口类型和类型别名type 
export function assertType<T extends TypeList>(obj:any,typename:T):obj is TypeMap<T>;
export function assertType<T extends object,S extends ClassType>(obj:T,cls:S):obj is InstanceType<S>;
export function assertType(a,b){
    if(typeof b=="string") return typeof a==b;
    else if(typeof b=="function")  return a instanceof b;
}
//!用于判断类型别名或接口，由于无法直接判断，这里直接“取信”即认为是如此 用于类型推导
//此函数让编辑器相信某对象是某个类型
//此函数对any使用时可实现自动类型提示转换 类似 as 关键字
export function trustType<T>(o:any):o is T{
    return true;
}

//数据容器构造区域

export function list<T>(iter?:Iterable<T>):Array<T>{
    if(iter==null) return list([]);
    let ret=[]
    for(let a of iter){
        ret.push(a)
    }
    return ret;
}
export function dict<K,V>(arl:Iterable<[K,V]>){
    return new Map<K,V>(arl);
}
export function zipToDict<K,V>(ks:Iterable<K>,vs:Iterable<V>){
    return dict(zip(ks,vs));
}
export function set<T>(arl:Iterable<T>)
{
    return new Set<T>(arl);
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
//融合对象 制造一个可用任何key访问的object

export function mapToObj(map:Map<any,any>=new Map()){
    //
    let r=new Proxy({},{
        get(target,p:any,receiver){
            return map.get(p);
        },
        set(target,p:any,value,receive){
            map.set(p,value);
            return true;
        },
        has(target,p:any){
            return map.has(p);
        },
        deleteProperty (target, p): boolean{
            return map.delete(p);
        },
        defineProperty (target, p, attributes: PropertyDescriptor): boolean
        {
            map.set(p,attributes.value);
            return true;
        },
        enumerate (target): any[]
        {
            return list(map.keys());
        },
        ownKeys (target): any[]
        {
            return list(map.keys());
        }
        // apply (target, thisArg: any, argArray?: any): any
        // {

        // },
        // construct (target, argArray: any, newTarget?: any): object
        // {

        // }
    })
    return r;
}
//把对象也转化为一个iterable


//以下为类型扩展部分

//扩展数组 和 有类型数组
//在map reduct filter基础上增加函数
//提供select函数，可支持使用 序号数组 bool数组 slice 和普通idx选取
//这里仿numpy实现

//实现 ndarray 和 ndarray<type>标识普通数组 ndarray<uint8> ndarray<int32> 等标识类型数组

//强类型支持部分
type uint8={};
type uint16={};
type uint32={};
type int8={};
type int16={};
type int32={};
type float32={};
type float64={};

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







//标识有类型数组
type TypedArray<T>=T extends uint8? Uint8Array:
                    T extends uint16? Uint16Array:
                    T extends uint32? Uint32Array:
                    T extends int8? Int8Array:
                    T extends int16? Int16Array:
                    T extends int32? Int32Array:
                    T extends float32? Float32Array:
                    T extends float64? Float64Array:
                    T extends any? GenericTypedArray:never;

type GenericTypedArray=Uint8Array|
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
