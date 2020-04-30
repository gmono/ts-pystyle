"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function delay(mis) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, mis);
    });
}
exports.delay = delay;
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
function any(arraylike) {
    for (let a of arraylike) {
        if (a)
            return true;
    }
    return false;
}
exports.any = any;
function all(arraylike) {
}
exports.all = all;
function* zip(...arraylikes) {
    let itors = arraylikes.map(v => v[Symbol.iterator]());
    for (;;) {
        //对所有itor取next 如果全部成功则yield 否则返回
        let ress = itors.map(v => v.next());
        //not any false
        if (!any(ress.map(v => !v.done))) {
            //返回
            yield ress.map(v => v.value);
        }
        else
            return undefined;
    }
}
exports.zip = zip;
zip([1, 2, 3]);
