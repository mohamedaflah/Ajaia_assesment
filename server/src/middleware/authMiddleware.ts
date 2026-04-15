import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export const protect = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new ApiError(401, "Unauthorized");

    const decoded: any = verifyToken(token);
    (req as any).user = decoded;

    next();
  } catch {
    next(new ApiError(401, "Invalid token"));
  }
};

