"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test_secret_test_secret";
// Import after env is set (env.ts reads process.env on import)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp } = require("../app");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateToken } = require("../utils/jwt");
describe("POST /api/docs", () => {
    let mongo;
    beforeAll(async () => {
        mongo = await mongodb_memory_server_1.MongoMemoryServer.create();
        await mongoose_1.default.connect(mongo.getUri());
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongo.stop();
    });
    it("creates a document", async () => {
        const app = createApp();
        const token = generateToken(new mongoose_1.default.Types.ObjectId().toString());
        const res = await (0, supertest_1.default)(app)
            .post("/api/docs")
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "My doc",
            content: { type: "doc", content: [{ type: "paragraph" }] },
        })
            .expect(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("_id");
        expect(res.body.data.title).toBe("My doc");
    });
});
//# sourceMappingURL=docs.create.test.js.map