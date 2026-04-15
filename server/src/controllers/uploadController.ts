import type { Request, Response } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { getUserIdFromReq } from "../utils/requestUser";
import { uploadSchema } from "../utils/validators/uploadSchemas";
import { createDocFromUpload } from "../services/uploadService";

const MAX_BYTES = 2 * 1024 * 1024;
const allowedExt = new Set([".txt", ".md"]);

function getExt(filename: string) {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = getExt(file.originalname);
    if (!allowedExt.has(ext)) return cb(new ApiError(400, "Only .txt and .md are allowed"));
    return cb(null, true);
  },
});

export const uploadToDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req as any);
  const { title } = uploadSchema.parse(req.query);

  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) throw new ApiError(400, "File is required");

  const data = await createDocFromUpload({
    userId,
    originalName: file.originalname,
    buffer: file.buffer,
    ...(title ? { titleOverride: title } : {}),
  });
  return successResponse(res, data, "Uploaded");
});

