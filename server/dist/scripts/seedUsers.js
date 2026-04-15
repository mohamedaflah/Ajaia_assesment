"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const User_1 = require("../models/User");
function getSeedUsers() {
    if (env_1.env.SEED_USERS) {
        const parsed = JSON.parse(env_1.env.SEED_USERS);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("SEED_USERS must be a non-empty JSON array");
        }
        return parsed;
    }
    return [
        { email: "owner@example.com", password: "Password123!" },
        { email: "alice@example.com", password: "Password123!" },
        { email: "bob@example.com", password: "Password123!" },
    ];
}
async function main() {
    await (0, db_1.connectDb)();
    const seedUsers = getSeedUsers();
    for (const u of seedUsers) {
        const email = u.email.toLowerCase().trim();
        const passwordHash = await bcryptjs_1.default.hash(u.password, 10);
        await User_1.UserModel.updateOne({ email }, { $set: { email, passwordHash } }, { upsert: true });
        // eslint-disable-next-line no-console
        console.log(`Seeded user: ${email}`);
    }
    await mongoose_1.default.disconnect();
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seedUsers.js.map