"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToObj = exports.len = exports.keys = exports.set = exports.zipToDict = exports.dict = exports.list = exports.trustType = exports.assertType = exports.assert = exports.parse = exports.json = exports.float = exports.str = exports.int = exports.insert = exports.max = exports.min = exports.sample = exports.extract = exports.byIdx = exports.sorted = exports.shuffle = exports.zip = exports.print = exports.equal = exports.not = exports.all = exports.any = exports.enumerate = exports.range = exports.select = exports.input = exports.randint = exports.delay = void 0;
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
//仿python基础设施
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
//将一个数组列表压缩为一个元组列表
function* zip(...arraylikes) {
    let itors = arraylikes.map(v => v[Symbol.iterator]());
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
    if (typeof b == "string")
        return typeof a == b;
    else if (typeof b == "function")
        return a instanceof b;
}
exports.assertType = assertType;
//!用于判断类型别名或接口，由于无法直接判断，这里直接“取信”即认为是如此 用于类型推导
//此函数让编辑器相信某对象是某个类型
//此函数对any使用时可实现自动类型提示转换 类似 as 关键字
function trustType(o) {
    return true;
}
exports.trustType = trustType;
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
        enumerate(target) {
            return list(map.keys());
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
//标识普通数组
//原始列表未list 普通数组即弱类型数组 普通数组有的函数强类型数组一样有
//实际分开实现
//
