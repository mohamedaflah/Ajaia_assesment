import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../config/db";
import { env } from "../config/env";
import { UserModel } from "../models/User";

type SeedUser = { email: string; password: string };

function getSeedUsers(): SeedUser[] {
  if (env.SEED_USERS) {
    const parsed = JSON.parse(env.SEED_USERS) as SeedUser[];
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
  await connectDb();

  const seedUsers = getSeedUsers();
  for (const u of seedUsers) {
    const email = u.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(u.password, 10);
    await UserModel.updateOne({ email }, { $set: { email, passwordHash } }, { upsert: true });
    // eslint-disable-next-line no-console
    console.log(`Seeded user: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

