import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const apiErr = err instanceof ApiError ? err : new ApiError(500, "Server error");

  // eslint-disable-next-line no-console
  if (!(err instanceof ApiError)) console.error(err);

  return res.status(apiErr.statusCode).json({
    success: false,
    message: apiErr.message,
  });
}

