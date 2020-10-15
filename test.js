"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
//要解决zip丢失类型问题
for (let [i, s] of lib_1.enumerate(lib_1.zip(lib_1.zip(lib_1.range(1, 10), lib_1.range(3, 12))))) {
    console.log(i, s);
}
lib_1.call(async () => {
    let a = lib_1.zip(lib_1.zip([[1, 2, 3], [2, 3, 4]]));
    let lst = lib_1.list(a);
    for (;;) {
        await lib_1.delay(1000);
        let test = lib_1.int(await lib_1.input("输入数字:"));
        for (let [a, b] of lib_1.enumerate(lib_1.zip(lib_1.zip(lib_1.range(test), lib_1.range(test, test * 2))))) {
            lib_1.print(a, b);
        }
    }
});
//# sourceMappingURL=test.js.map