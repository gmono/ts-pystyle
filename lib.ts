import prompts from "prompts";

export async function delay(mis){
    return new Promise<void>((resolve)=>{
        setTimeout(() => {
            resolve();
        }, mis);
    })   
}

// 基本便利函数
//不包括max 从0开始
export function randint(max: number) {
    return Math.floor(Math.random() * max) % max;
}
export async function input(message: string) {
    let res = await prompts({
        message,
        name: "result",
        type: "text"
    });
    return res.result as string;
}
//有待改进 可从choices中提取类型 约束返回类型
export async function select(message: string, choices: prompts.PromptObject["choices"] | string[]) {
    let choicesarr: prompts.PromptObject["choices"] = null;
    if (typeof choices[0] == "string") {
        choicesarr = (choices as string[]).map((v, idx) => ({ title: v, value: idx.toString() }));
    }
    else
        choicesarr = choices as typeof choicesarr;
    let res = await prompts({
        message,
        name: "result",
        type: "select",
        choices: choicesarr
    });
    return res.result as string;
}



//仿python基础设施
export function range(end:number):Iterable<number>;
export function range(start:number,end:number):Iterable<number>;
export function range(start:number,space:number,end:number):Iterable<number>;
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
//boolean运算函数 其中收到的值被当作bool值
export function any(arraylike:Iterable<any>)
{
    for(let a of arraylike){
        if(a) return true;
    }
    return false;
}
export function all(arraylike:Iterable<any>)
{
    return !any(not(arraylike));
}
export function not(arraylike:Iterable<boolean>){
    let ar=[]
    for(let a of arraylike) ar.push(!a);
    return ar;
}
//实现了此接口的可提供比较
export type CompareAble<D>={
    __equal__(b:D):boolean;
};
export type CompareDest<D>=D|Iterable<D>;
export function equal<D>(ar:Iterable<CompareAble<D>>,dest:CompareDest<D>){
    let ret=[] as boolean[];
    if(Symbol.iterator in  dest){
        if(trustType<Iterable<D>>(dest))
            for(let [a,b] of zip(ar,dest)){
                ret.push(a.__equal__(b))
            }
    }else{
        for(let a of ar){
            if(trustType<D>(dest))
            ret.push(a.__equal__(dest));
        }
    }
    return ret;
}

export function print<T extends any[]>(...data:T){
    console.log(...data);
}

//把一个数组的元素类型加迭代器包装
export type MapToIteratable<T extends any[]>={[R in keyof T]:Iterable<T[R]>};
//用作类型引用
export type ZipType<T extends any[]>=Iterable<T>;
//将一个数组列表压缩为一个元组列表
// zip(a,b) a b 是迭代器，zip可接受迭代器数组
// zip([a,b]) 这里是传递的一个迭代器数组，未来支持 迭代器的迭代器

//合并类型 如果不存在 直接赋值 如果是同名数组 变成|类型 如果是同名对象
//递归调用得到新类型
//!合并类型用于JSON对象类型的合并中 需要函数按照对应合并策略进行合并
type MergeObject<A,B>={[idx in (keyof A|keyof B)]:
    idx extends keyof A?
    idx extends keyof B?(
        //同时
        MergeType<A[idx],B[idx]>
    )
    :(
        //非同时 即属性名属于一个对象 直接赋值
        idx extends keyof A?A[idx]:
        idx extends keyof B?B[idx]:never
        //如果最后一个都属于 说明出错了
    ):(
        //非同时 即属性名属于一个对象 直接赋值
        idx extends keyof A?A[idx]:
        idx extends keyof B?B[idx]:never
        //如果最后一个都属于 说明出错了
    )};
//合并类型 如果是同一个类型 返回 如果是数组类型返回合并后
//以后支持 如果是迭代器 生成器 等常见模板类型 都进行合并
//但由于不支持通用泛型表示 无法覆盖自定义泛型
//对于自定义泛型 只能通过 & 符号来自动合并
//对象不适用& 来自动合并 因为& 无法自动处理当两个属性冲突时的情况
//例如无法把两个不同的数组合并为一个或类型数组,如果进行 元素结果为never
//不能提供更多类似这种特殊类型的合并处理操作
//! 这里做如下假设： 迭代器合并是进行混合或拼接concat，而非取舍
//! 一切对象类型都进行合并
//! 原始类型进行或操作
type MergeType<A,B>=A extends B? A:
                    
                    A extends Array<infer AT>?B extends Array<infer BT>? Array<AT|BT>:MergeObject<A,B>:MergeObject<A,B>;

type CBKType<T>=[value:T,index:number];
type IterInnerType<T>=T extends Iterable<infer S>? S:never;
//代理对象
class ExtendIteratable<T,Raw> implements Iterable<T>{
    constructor(protected rawIter:Raw){}
    [Symbol.iterator](): Iterator<T, any, undefined> {
        return this.rawIter[Symbol.iterator]();
    }
    //支持链式调用
    //全部采用延后求值方法
    map<S>(cbk:(...args:CBKType<T>)=>S):ExtendIteratable<S,Iterable<S>>{
        //延迟调用
        let _this=this;
        function *inner(){
            let i=0;
            for(let a of _this){
                yield cbk(a,i);
                i++;
            }
        }
        return new ExtendIteratable<S,Iterable<S>>(inner());
    }
    forEach(cbk:(...args:CBKType<T>)=>void):ExtendIteratable<T,Raw>{
        let i=0;
        for(let a of this){
            cbk(a,i);
            i++;
        }
        return this;
    }
    get raw(){
        return this.rawIter;
    }
    concat<R>(b:ExtendIteratable<IterInnerType<R>,R>):ExtendIteratable<T|IterInnerType<R>,Iterable<T|IterInnerType<R>>>{
        //延迟调用
        let _this=this;
        function *inner(){
            for(let a of _this){
                yield a;
            }
            for(let a of b){
                yield a;
            }
        }
        return new ExtendIteratable<T|IterInnerType<R>,Iterable<T|IterInnerType<R>>>(inner());
    }
    // exchange():(T extends [infer one,infer two]? ExtendIteratable<[two,one],Iterable<[two,one]>>:never){
    //     //如果T是一个[a,b]类型 可变为[b,a]类型

    //     let _this=this;
    //     function *inner(){
    //         for(let ar of _this){
    //             if(trustType<object>(ar))
    //             if(assertType(ar,Array)){
    //                 if(len(ar)==2){
    //                     yield [ar[1],ar[0]];
    //                 }
    //             }
    //         }
    //     }
    //     return new ExtendIteratable<any,Iterable<any>>(inner() as any) as any;
    // }
}
//构造扩展迭代器
export type ArInner<T>=T extends Array<infer P> ?P:never;
// export function iter<R extends [Iterable<any>,Iterable<any>]>(ar:R):ExtendIteratable<[IterInnerType<R[0]>,IterInnerType<R[1]>],R>;
export function iter<R extends Iterable<any>>(ar:R):ExtendIteratable<IterInnerType<R>,R>;
export function iter<R extends Iterable<any>>(ar:R):ExtendIteratable<IterInnerType<R>,R>
{
    return  new ExtendIteratable<IterInnerType<R>,R>(ar);
}

// iter([[1,2],[2,3]]).exchange()
/**
 * 可 zip(a,b) zip([a,b]) 其中ab为迭代器
 * 同时ab可不直接给出，允许使用迭代器如zip(zip([a,b]))其中第一个zip得到的是一个
 * 迭代器的迭代器
 * zip可用来对iterable进行截断，对无限迭代器可用作限定长度
 */

 //压缩单数组参数的
export function zip<T extends [any,...any[]]>(arraylikes:MapToIteratable<T>):Generator<T,void,void>;
 //压缩单迭代器参数的
export function zip<T extends Iterable<any>>(arraylikes:Iterable<T>):Generator<IterInnerType<T>[],void,void>;
export function zip<T extends any[]>(...arraylikes:MapToIteratable<T>):Generator<T,void,void>;

export function *zip(...arraylikes:any){
    // arraylikes是一个迭代器数组 T是迭代器的类型数组 arraylinks[0]是第一个迭代器
    // 其内部类型是T[0]，但如果只有一个元素，那么其内部类型就应该直接是T
    // 其类型应该被转换为与arraylikes本身相同
    // 如果arraylink中的第一个元素 是一个Iterable<T[R]>的数组，那表示
    // 直接传过来的一个数组 返回递归调用自己

    //此处arraylikes可以是一个迭代器数组 即 zip(a,b)
    //也可以是只有一个元素的迭代器的数组的数组 zip([a,b])
    //永假 终于让编辑器承认类型
    if(!trustType<any[]>(arraylikes)) return;
    if(len(arraylikes)==0) return;
    if(len(arraylikes)==1){
        arraylikes=arraylikes[0];
    } 
    //开始 
    //arraylinks可能是一个可迭代对象 不可修改参数本身 
    //itors是一个迭代器数组
    let itors=[];
    for(let a of arraylikes){
        itors.push(a[Symbol.iterator]());
    }
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


//笛卡尔积 惰性求值
function *_cartesian<A extends Iterable<any>,B extends Iterable<any>>(a:A,b:B)
:Generator<[IterInnerType<A>,IterInnerType<B>], void, unknown>
{
    //b应当有穷尽 否则 将无限循环
    //或迭代必须自动结束 否则无限循环
    let ar=[] as IterInnerType<B>[];
    let first=true;
    for(let t of a){
        let s=first? b:ar;
        for(let tt of s){
            yield [t,tt];
            first&&ar.push(tt)
        }
        first=false;
    }
}

type MapToInner<ar>=ar extends [infer a,...infer b]? (a extends Iterable<infer n>?[n,...MapToInner<b>]:"never"):[];
type a=MapToInner<[[number],[string]]>
export function *cartesian<ar extends Iterable<any>[]>(...args:ar):Generator<MapToInner<ar>, void, unknown>{
    if(len(args)==2) {
            yield * _cartesian(args[0],args[1]) as any;
    }
    else{
        //递归
        for(let [a,b] of _cartesian(args[0],cartesian(...args.slice(1)))){
            //a 为元素 b为元素数组
            yield [a,...b] as any;
        }
    }
}
cartesian([],[],[])
//两次zip还原
// let a=list(zip(...list(zip(...[[1,2,3],[2,3,4]]))))

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
export interface AsInt{
    toInt():number;
}
export interface AsFloat{
    toFloat():number;
}
export function int(other:string|number|AsInt){
    if(typeof other=="string") return parseInt(other);
    else if(typeof other=="number") return other|0;
    else if("toInt" in other){
        return other.toInt()
    }else return 0;
}
export type AsString={toString:()=>string}|number|string;
export function str(n:AsString){
    if(assertType(n,"object")){
        return n.toString();
    }else if(assertType(n,"string")) return n;
    else
    return new Number(n).toString();
}
export function float(other:string|number|AsFloat){
    if(typeof other=="string") return parseFloat(other);
    else if(typeof other=="number") return other;
    else if("toFloat" in other){
        return other.toFloat()
    }else return 0;
}
export function json(obj:any){
    return JSON.stringify(obj);
}
export function parse(json:string){
    return JSON.parse(json);
}
//特殊工具函数
export function assert(n:boolean,msg:string){
    if(!n) throw new Error(msg);
    
}

export type  TypeNameList= RawTypeNameList| "object" | "function";
export type RawTypeNameList="string" | "number" | "bigint" | "boolean" | "symbol" | "undefined";
export type RawTypeList=string | number | bigint | boolean | symbol | undefined;
export type  TypeList= RawTypeNameList| object | Function;
export type TypeMap<tp extends TypeList>=tp extends string? "string":
                    tp extends number? "number":
                    tp extends bigint? "bigint":
                    tp extends boolean? "boolean":
                    tp extends symbol? "symbol":
                    tp extends Function? "function":
                    tp extends undefined? "undefined":
                    tp extends object? "object":never;
export type TypeNameMap<name extends TypeNameList>=name extends "string"? string:
                    name extends "number"? number:
                    name extends "bigint"? bigint:
                    name extends "boolean"? boolean:
                    name extends "symbol"? symbol:
                    name extends "function"? Function:
                    name extends "undefined"? undefined:
                    name extends "object"? object:never;
export type ClassType=new(...args)=>any;
//此为类型判断函数系列 可用于类型推导 
//用法: assertType(a,b) b为string时 判断原生类型 b为class时判断实例类型
//! 不可用于判断接口类型和类型别名type 
export function assertType<T extends TypeNameList>(obj:any,typename:T):obj is TypeNameMap<T>;
export function assertType<T extends object,S extends ClassType>(obj:T,cls:S):obj is InstanceType<S>;
export function assertType(a,b){
    //此处有特殊类型的判断 例如 迭代器 的symbol等
    if(typeof b=="string") return typeof a==b;
    else if(typeof b=="function")  return a instanceof b;
}
assertType([],Array);
//!用于判断类型别名或接口，由于无法直接判断，这里直接“取信”即认为是如此 用于类型推导
//此函数让编辑器相信某对象是某个类型
//此函数对any使用时可实现自动类型提示转换 类似 as 关键字
export function trustType<T>(o:any):o is T{
    return true;
}
//判断迭代器的
export function isIter<T extends any>(a:object):a is Iterable<T>{
    return Symbol.iterator in a;
}
export function isAsyncIter<T extends any>(a:object):a is AsyncIterable<T>{
    return Symbol.asyncIterator in a;
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

export type HasLength={length:number}|{size:number}|{count:number}|{__len__():number};
//以下为调用协议
//此函数可以得到 map set list array 拥有__len__函数的对象和 object本身的属性数
//等同类数据 包括使用object实现是set 中的element数量
export function len(obj:Iterable<any>|HasLength|object){
    
    if("length" in obj){
        return obj.length
    }else if ("size" in obj){
        return obj.size;
    }else if("count" in obj){
        return obj.count;
    }else if("__len__" in obj){
        return obj.__len__()
    }else if(Symbol.iterator in obj){
        if(trustType<Iterable<any>>(obj))
            return len(list(obj));
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

//便利函数部分

export function call(func:()=>any){
    func();
}

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
