import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test_secret_test_secret";

// Import after env is set (env.ts reads process.env on import)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp } = require("../app");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateToken } = require("../utils/jwt");

describe("POST /api/docs", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("creates a document", async () => {
    const app = createApp();
    const token = generateToken(new mongoose.Types.ObjectId().toString());

    const res = await request(app)
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

