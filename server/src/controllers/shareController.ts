import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { isValidObjectId } from "../utils/validateObjectId";
import { getUserIdFromReq } from "../utils/requestUser";
import { toggleShareLink, getDocByShareToken } from "../services/shareService";

/** Toggle public share link for a document (auth required, owner only) */
export const shareDocument = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = getUserIdFromReq(req as any);
  const id = String((req.params as any).id ?? "");
  if (!id || !isValidObjectId(id)) throw new ApiError(400, "Invalid document id");

  const data = await toggleShareLink(id, ownerId);
  return successResponse(res, data, data.shared ? "Link created" : "Link revoked");
});

/** Get a document via public share token (no auth required) */
export const getSharedDocument = asyncHandler(async (req: Request, res: Response) => {
  const token = String((req.params as any).token ?? "").trim();
  if (!token) throw new ApiError(400, "Missing share token");

  const data = await getDocByShareToken(token);
  return successResponse(res, data);
});
