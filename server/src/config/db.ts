import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  if (!env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(env.MONGO_URI);
}

