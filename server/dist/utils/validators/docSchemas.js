"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocSchema = exports.createDocSchema = void 0;
const zod_1 = require("zod");
const tipTapDocSchema = zod_1.z
    .object({
    type: zod_1.z.literal("doc"),
    content: zod_1.z.array(zod_1.z.any()).min(1),
})
    .passthrough();
exports.createDocSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1),
    content: tipTapDocSchema,
});
exports.updateDocSchema = zod_1.z
    .object({
    title: zod_1.z.string().trim().min(1).optional(),
    content: tipTapDocSchema.optional(),
})
    .refine((v) => v.title !== undefined || v.content !== undefined, {
    message: "At least one of title or content is required",
});
//# sourceMappingURL=docSchemas.js.map