"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDb() {
    mongoose_1.default.set("strictQuery", true);
    if (!env_1.env.MONGO_URI)
        throw new Error("MONGO_URI is required");
    await mongoose_1.default.connect(env_1.env.MONGO_URI);
}
exports.connectDb = connectDb;
//# sourceMappingURL=db.js.map