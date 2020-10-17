"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.open = exports.call = exports.mapToObj = exports.len = exports.keys = exports.set = exports.zipToDict = exports.dict = exports.list = exports.isAsyncIter = exports.isIter = exports.trustType = exports.assertType = exports.assert = exports.parse = exports.json = exports.float = exports.str = exports.int = exports.insert = exports.max = exports.min = exports.sample = exports.extract = exports.byIdx = exports.sorted = exports.shuffle = exports.cartesian = exports.zip = exports.iter = exports.error = exports.print = exports.equal = exports.not = exports.all = exports.any = exports.enumerate = exports.range = exports.select = exports.input = exports.randint = exports.delay = void 0;
const prompts_1 = __importDefault(require("prompts"));
async function delay(mis) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, mis);
    });
}
exports.delay = delay;
// 基本便利函数
//不包括max 从0开始
function randint(max) {
    return Math.floor(Math.random() * max) % max;
}
exports.randint = randint;
async function input(message) {
    let res = await prompts_1.default({
        message,
        name: "result",
        type: "text"
    });
    return res.result;
}
exports.input = input;
//有待改进 可从choices中提取类型 约束返回类型
async function select(message, choices) {
    let choicesarr = null;
    if (typeof choices[0] == "string") {
        choicesarr = choices.map((v, idx) => ({ title: v, value: idx.toString() }));
    }
    else
        choicesarr = choices;
    let res = await prompts_1.default({
        message,
        name: "result",
        type: "select",
        choices: choicesarr
    });
    return res.result;
}
exports.select = select;
function* range(start, space, end) {
    //允许 range(a,c,b) range(b) range(a,b)
    if (space == null && end == null) {
        //1
        yield* range(0, 1, start);
    }
    else if (end == null) {
        //2
        yield* range(start, 1, space);
    }
    else {
        //3
        for (let i = start; i < end; i += space) {
            yield i;
        }
    }
}
exports.range = range;
function* enumerate(arraylike) {
    let now = 0;
    for (let a of arraylike) {
        yield [now++, a];
    }
}
exports.enumerate = enumerate;
//boolean运算函数 其中收到的值被当作bool值
function any(arraylike) {
    for (let a of arraylike) {
        if (a)
            return true;
    }
    return false;
}
exports.any = any;
function all(arraylike) {
    return !any(not(arraylike));
}
exports.all = all;
function not(arraylike) {
    let ar = [];
    for (let a of arraylike)
        ar.push(!a);
    return ar;
}
exports.not = not;
function equal(ar, dest) {
    let ret = [];
    if (Symbol.iterator in dest) {
        if (trustType(dest))
            for (let [a, b] of zip(ar, dest)) {
                ret.push(a.__equal__(b));
            }
    }
    else {
        for (let a of ar) {
            if (trustType(dest))
                ret.push(a.__equal__(dest));
        }
    }
    return ret;
}
exports.equal = equal;
function print(...data) {
    console.log(...data);
}
exports.print = print;
// type t=typeof a extends Iterable<number>? true:false;
//可以支持 异步迭代器 异步迭代器生成promise
function error(msg = "") {
    throw new Error(msg);
}
exports.error = error;
/**
 * 可以包装异步和同步迭代器 其中异步迭代器是返回异步 itor的对象
 * 这个对象的next函数可以返回一个promise  求得promise后和普通itor一样
 * asyncitor的next返回的是一个Promise  itor返回的是一个itor result
 * 此promise then后就得到了一个和itor一样的itor result
 * ! 注意此处问题 由于asynciter和iter并不能互相转化 这里只能把 iter转化为asynciter
 * ! 而不能把asynciter转化为iter 此处iterator返回的应该是null,即保证同步循环不能对异步迭代器使用
 */
class ExtendIteratable {
    constructor(rawIter) {
        this.rawIter = rawIter;
    }
    [Symbol.asyncIterator]() {
        if (isAsyncIter(this.raw))
            return this.rawIter[Symbol.asyncIterator]();
        return this.map(v => Promise.resolve(v))[Symbol.iterator]();
    }
    //如果是async 返回promise<T>
    [Symbol.iterator]() {
        if (isAsyncIter(this.raw))
            return this.rawIter[Symbol.asyncIterator]();
        return this.rawIter[Symbol.iterator]();
    }
    //用于在包装
    //支持链式调用
    //全部采用延后求值方法
    map(cbk) {
        //延迟调用
        let _this = this;
        function* inner() {
            let i = 0;
            for (let a of _this) {
                yield cbk(a, i);
                i++;
            }
        }
        //async 处理 async iter map后还是async iter
        async function* ainner() {
            let i = 0;
            for await (let a of _this) {
                yield await cbk(a, i);
                i++;
            }
        }
        if (isAsyncIter(this.raw)) {
            return new ExtendIteratable(ainner());
        }
        return new ExtendIteratable(inner());
    }
    /**
     * ! 此函数对异步迭代器调用时会遍历其中元素来得到具体长度，以便转换为同步
     * 把异步迭代器转换为同步迭代器
     * 其实是伪的同步迭代器
     * 由于不知道什么时候结束，不能把异步迭代器当同步迭代器迭代而仅仅是把元素换为Promise<T>
     * 实际上其元素类型并非promise T 而是其返回的itor result 需要await之后才能知道是否结束
     * ? 既然sync().then(v) 可以 那么把v变成某种单元素接收器替代接受iter 也可以
     */
    async sync() {
        //对于async的iter 对转换为普通iter
        //使用异步循环
        if (isIter(this.raw)) {
            //如果是普通迭代器，直接返回
            return this;
        }
        else if (isAsyncIter(this.raw)) {
            //收集所有result的promise，通过对promise使用then 转换promise为值的promise
            //然后返回值的promise
            //由于不知道何时结束，这个无法实施，只能一次性收集所有的元素 await后返回返回数组
            let ar = [];
            for await (let a of this) {
                ar.push(a);
            }
            return iter(ar);
        }
        error("内部错误");
    }
    /**
     * 实际遍历，得到数组
     */
    collect() {
        //对于异步迭代器而言 言语不await就无法知道是否结束 
        //此函数必然要变为异步函数，因此这里设定，此函数不能在异步迭代器上调用
        //异步迭代器必须先调用sync函数并等待其结束
        //对于raw本来就是数组的来说，直接返回其数组
        if (isAsyncIter(this.raw))
            error("不能在异步迭代器上调用collect");
        else if (this.raw instanceof Array) {
            return this.raw;
        }
        else {
            //收集
            let ar = [];
            for (let a of this.raw) {
                ar.push(a);
            }
            return ar;
        }
    }
    //async 迭代器返回的直接就是promise
    //此函数调用后真正开始循环求值，在此之前，其他函数调用都不会直接执行
    forEach(cbk) {
        //延迟调用
        assert(!isAsyncIter(this.raw), "错误，不能对AsyncIterable直接调用forEach,应使用sync函数");
        //使用sync+forEach 或 map+sync 来模拟原始的foreach
        let _this = this;
        let i = 0;
        for (let a of this) {
            //必须是同步的
            cbk(a, i);
            i++;
        }
        return this;
    }
    get raw() {
        return this.rawIter;
    }
    //连接两个迭代器
    //! 未完成 还没有处理async的情况
    concat(b) {
        //延迟调用
        let _this = this;
        function* inner() {
            for (let a of _this) {
                yield a;
            }
            for (let a of b) {
                yield a;
            }
        }
        return new ExtendIteratable(inner());
    }
}
function iter(ar) {
    return new ExtendIteratable(ar);
}
exports.iter = iter;
async function* test() {
    yield 1;
}
function* zip(...arraylikes) {
    // arraylikes是一个迭代器数组 T是迭代器的类型数组 arraylinks[0]是第一个迭代器
    // 其内部类型是T[0]，但如果只有一个元素，那么其内部类型就应该直接是T
    // 其类型应该被转换为与arraylikes本身相同
    // 如果arraylink中的第一个元素 是一个Iterable<T[R]>的数组，那表示
    // 直接传过来的一个数组 返回递归调用自己
    //此处arraylikes可以是一个迭代器数组 即 zip(a,b)
    //也可以是只有一个元素的迭代器的数组的数组 zip([a,b])
    //永假 终于让编辑器承认类型
    if (!trustType(arraylikes))
        return;
    if (len(arraylikes) == 0)
        return;
    if (len(arraylikes) == 1) {
        arraylikes = arraylikes[0];
    }
    //开始 
    //arraylinks可能是一个可迭代对象 不可修改参数本身 
    //itors是一个迭代器数组
    let itors = [];
    for (let a of arraylikes) {
        itors.push(a[Symbol.iterator]());
    }
    for (;;) {
        //对所有itor取next 如果全部成功则yield 否则返回
        let ress = itors.map(v => v.next());
        // print(ress);
        //如果有一个结束
        if (any(ress.map(v => v.done))) {
            //返回
            return undefined;
        }
        else
            yield ress.map(v => v.value);
    }
}
exports.zip = zip;
//笛卡尔积 惰性求值
function* _cartesian(a, b) {
    //b应当有穷尽 否则 将无限循环
    //或迭代必须自动结束 否则无限循环
    let ar = [];
    let first = true;
    for (let t of a) {
        let s = first ? b : ar;
        for (let tt of s) {
            yield [t, tt];
            first && ar.push(tt);
        }
        first = false;
    }
}
function* cartesian(...args) {
    if (len(args) == 2) {
        yield* _cartesian(args[0], args[1]);
    }
    else {
        //递归
        for (let [a, b] of _cartesian(args[0], cartesian(...args.slice(1)))) {
            //a 为元素 b为元素数组
            yield [a, ...b];
        }
    }
}
exports.cartesian = cartesian;
cartesian([], [], []);
//两次zip还原
// let a=list(zip(...list(zip(...[[1,2,3],[2,3,4]]))))
//基本操作
//打乱
//双向队列 支持中间删除
const denque_1 = __importDefault(require("denque"));
function shuffle(arl) {
    //随机选择idx进行填空 建立idx表 填一个删一个
    let dq = new denque_1.default();
    let a = list(arl);
    let idxs = list(range(len(a)));
    idxs.forEach(v => dq.push(v));
    //随机从dq中选择一个idx 然后把那个位置的idx删掉
    let r = new Array(len(a));
    for (let t of a) {
        //t为新得到的单词
        //选择一个idx
        let i = randint(len(dq));
        let idx = dq.get(i);
        dq.removeOne(i);
        //随机填空
        r[idx] = t;
    }
    return r;
}
exports.shuffle = shuffle;
//默认是升序
//排序函数 未来的array实现将省略list 这个扫描过程
function sorted(arl, key = null, sorttype = "ASC") {
    let ret = list(arl).sort((a, b) => {
        let [k, kk] = [-key(a), -key(b)];
        return k - kk;
    });
    return ret;
}
exports.sorted = sorted;
//按索引表 在iterable中选择值
//通常基于迭代器的通用实现比较慢 基于可随机访问存储的数组实现比较快
//未来将转换到多重签名实现上
function byIdx(arl, idxs) {
    let l = list(arl);
    let ret = idxs.map(v => l[v]);
    return ret;
}
exports.byIdx = byIdx;
//不放回采样
function extract(arl, count) {
    //从一个列表中采样 不放回
    let a = list(arl);
    let idx = shuffle(range(len(a))).slice(0, count);
    print(idx);
    return byIdx(a, idx);
}
exports.extract = extract;
//有放回采样
function sample(arl, count) {
    //从一个列表中采样 有放回
    let a = list(arl);
    let idx = list(range(len(a))).map(v => randint(len(a)));
    return byIdx(a, idx);
}
exports.sample = sample;
//数学
exports.min = Math.min;
exports.max = Math.max;
/**
 * 插入
 * @param arl 数组
 * @param point 插入位置 插入到这个位置的元素前面 为 0-len(arl) 的值
 * @param val 插入值
 */
function insert(arl, point, val) {
    let newar = [];
    let a = list(arl);
    a.forEach((v, idx) => {
        if (point == idx)
            newar.push(val);
        newar.push(v);
    });
    if (len(a) == point)
        newar.push(val);
    return newar;
}
exports.insert = insert;
function int(other) {
    if (typeof other == "string")
        return parseInt(other);
    else if (typeof other == "number")
        return other | 0;
    else if ("toInt" in other) {
        return other.toInt();
    }
    else
        return 0;
}
exports.int = int;
function str(n) {
    if (assertType(n, "object")) {
        return n.toString();
    }
    else if (assertType(n, "string"))
        return n;
    else
        return new Number(n).toString();
}
exports.str = str;
function float(other) {
    if (typeof other == "string")
        return parseFloat(other);
    else if (typeof other == "number")
        return other;
    else if ("toFloat" in other) {
        return other.toFloat();
    }
    else
        return 0;
}
exports.float = float;
function json(obj) {
    return JSON.stringify(obj);
}
exports.json = json;
function parse(json) {
    return JSON.parse(json);
}
exports.parse = parse;
//特殊工具函数
function assert(n, msg) {
    if (!n)
        throw new Error(msg);
}
exports.assert = assert;
function assertType(a, b) {
    //此处有特殊类型的判断 例如 迭代器 的symbol等
    if (typeof b == "string")
        return typeof a == b;
    else if (typeof b == "function")
        return a instanceof b;
}
exports.assertType = assertType;
assertType([], Array);
//!用于判断类型别名或接口，由于无法直接判断，这里直接“取信”即认为是如此 用于类型推导
//此函数让编辑器相信某对象是某个类型
//此函数对any使用时可实现自动类型提示转换 类似 as 关键字
function trustType(o) {
    return true;
}
exports.trustType = trustType;
//判断迭代器的
function isIter(a) {
    return Symbol.iterator in a;
}
exports.isIter = isIter;
function isAsyncIter(a) {
    return Symbol.asyncIterator in a && !(Symbol.iterator in a);
}
exports.isAsyncIter = isAsyncIter;
//数据容器构造区域
function list(iter) {
    if (iter == null)
        return list([]);
    let ret = [];
    for (let a of iter) {
        ret.push(a);
    }
    return ret;
}
exports.list = list;
function dict(arl) {
    return new Map(arl);
}
exports.dict = dict;
function zipToDict(ks, vs) {
    return dict(zip(ks, vs));
}
exports.zipToDict = zipToDict;
function set(arl) {
    return new Set(arl);
}
exports.set = set;
//数据操作
function* keys(obj) {
    //取对象的key或map的所有key 枚举
    if (obj instanceof Map) {
        //枚举
        for (let a of obj.keys()) {
            yield a;
        }
    }
    else if (typeof obj == "object") {
        for (let k in obj) {
            yield k;
        }
    }
}
exports.keys = keys;
//以下为调用协议
//此函数可以得到 map set list array 拥有__len__函数的对象和 object本身的属性数
//等同类数据 包括使用object实现是set 中的element数量
function len(obj) {
    if ("length" in obj) {
        return obj.length;
    }
    else if ("size" in obj) {
        return obj.size;
    }
    else if ("count" in obj) {
        return obj.count;
    }
    else if ("__len__" in obj) {
        return obj.__len__();
    }
    else if (Symbol.iterator in obj) {
        if (trustType(obj))
            return len(list(obj));
    }
    else if (typeof obj == "object") {
        let s = 0;
        for (let i in obj) {
            s++;
        }
        return s;
    }
}
exports.len = len;
//融合对象 制造一个可用任何key访问的object
function mapToObj(map = new Map()) {
    //
    let r = new Proxy({}, {
        get(target, p, receiver) {
            return map.get(p);
        },
        set(target, p, value, receive) {
            map.set(p, value);
            return true;
        },
        has(target, p) {
            return map.has(p);
        },
        deleteProperty(target, p) {
            return map.delete(p);
        },
        defineProperty(target, p, attributes) {
            map.set(p, attributes.value);
            return true;
        },
        ownKeys(target) {
            return list(map.keys());
        }
        // apply (target, thisArg: any, argArray?: any): any
        // {
        // },
        // construct (target, argArray: any, newTarget?: any): object
        // {
        // }
    });
    return r;
}
exports.mapToObj = mapToObj;
//把对象也转化为一个iterable
//便利函数部分
function call(func) {
    func();
}
exports.call = call;
//标识普通数组
//原始列表未list 普通数组即弱类型数组 普通数组有的函数强类型数组一样有
//实际分开实现
//
//! 数据相关 文件读写
const fs = __importStar(require("fs/promises"));
exports.open = fs.open;
async function close(fhand) {
    (await fhand).close();
}
exports.close = close;
//把file转换为AsyncIterable 
//# sourceMappingURL=lib.js.map