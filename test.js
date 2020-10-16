"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
//支持切断
let p = lib_1.iter(lib_1.zip([[1, 2, 3], lib_1.range(1000)]));
p.map(v => v[0] * 2).forEach(v => lib_1.print(v));
lib_1.iter(lib_1.range(10)).map(v => v * 2).forEach(v => lib_1.print(v));
lib_1.call(async () => {
    let a = lib_1.zip(lib_1.zip([[1, 2, 3], [2, 3, 4]]));
    let lst = lib_1.list(a);
    for (let [i, ii, c] of lib_1.cartesian(lib_1.range(10), lib_1.range(10), lib_1.range(3), lib_1.range(3))) {
        lib_1.print([i, ii, c]);
    }
    for (;;) {
        await lib_1.delay(1000);
        let test = lib_1.int(await lib_1.input("输入数字:"));
        for (let [a, b] of lib_1.enumerate(lib_1.zip(lib_1.zip(lib_1.range(test), lib_1.range(test, test * 2))))) {
            lib_1.print(a, b);
        }
    }
});
//# sourceMappingURL=test.js.map