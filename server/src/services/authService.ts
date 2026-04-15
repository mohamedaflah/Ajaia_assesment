import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError";
import { generateToken } from "../utils/jwt";
import { UserModel } from "../models/User";

export async function loginWithEmailPassword(email: string, password: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const token = generateToken(String(user._id));
  return { token };
}

export async function signupWithEmailPassword(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (existing) throw new ApiError(409, "User already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await UserModel.create({ email: normalizedEmail, passwordHash });

  const token = generateToken(String(created._id));
  return { token };
}

