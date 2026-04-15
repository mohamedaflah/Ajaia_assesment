"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSchema = void 0;
const zod_1 = require("zod");
exports.uploadSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).optional(),
});
//# sourceMappingURL=uploadSchemas.js.map