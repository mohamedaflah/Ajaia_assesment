"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareDocSchema = void 0;
const zod_1 = require("zod");
exports.shareDocSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    permission: zod_1.z.enum(["read", "write"]),
});
//# sourceMappingURL=shareSchemas.js.map