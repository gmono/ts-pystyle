"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
for (let [a, b] of lib_1.zip(lib_1.range(1, 10), lib_1.range(3, 12))) {
    console.log(a, b);
}
