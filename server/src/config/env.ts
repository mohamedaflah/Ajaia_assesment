import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isTest = process.env.NODE_ENV === "test" || !!process.env.JEST_WORKER_ID;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  PORT: z.coerce.number().int().positive().optional(),
  MONGO_URI: isTest ? z.string().min(1).optional() : z.string().min(1),
  JWT_SECRET: isTest ? z.string().min(16).optional() : z.string().min(16),
  CORS_ORIGIN: z.string().optional(),
  SEED_USERS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

