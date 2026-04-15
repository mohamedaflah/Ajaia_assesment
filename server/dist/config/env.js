"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const isTest = process.env.NODE_ENV === "test" || !!process.env.JEST_WORKER_ID;
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).optional(),
    PORT: zod_1.z.coerce.number().int().positive().optional(),
    MONGO_URI: isTest ? zod_1.z.string().min(1).optional() : zod_1.z.string().min(1),
    JWT_SECRET: isTest ? zod_1.z.string().min(16).optional() : zod_1.z.string().min(16),
    CORS_ORIGIN: zod_1.z.string().optional(),
    SEED_USERS: zod_1.z.string().optional(),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map