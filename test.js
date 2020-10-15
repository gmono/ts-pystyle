"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
//要解决zip丢失类型问题
for (let s of lib_1.zip(lib_1.zip(lib_1.range(1, 10), lib_1.range(3, 12)))) {
    console.log(s);
}
//# sourceMappingURL=test.js.map