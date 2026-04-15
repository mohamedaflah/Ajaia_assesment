import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { loginSchema, signupSchema } from "../utils/validators/authSchemas";
import { loginWithEmailPassword, signupWithEmailPassword } from "../services/authService";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const data = await loginWithEmailPassword(email, password);
  return successResponse(res, data, "Login successful");
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = signupSchema.parse(req.body);
  const data = await signupWithEmailPassword(email, password);
  return successResponse(res, data, "Signup successful");
});

