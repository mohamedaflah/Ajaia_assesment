import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { isValidObjectId } from "../utils/validateObjectId";
import { getUserIdFromReq } from "../utils/requestUser";
import { shareDocSchema } from "../utils/validators/shareSchemas";
import { shareDoc } from "../services/shareService";

export const shareDocument = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = getUserIdFromReq(req as any);
  const id = String((req.params as any).id ?? "");
  if (!id || !isValidObjectId(id)) throw new ApiError(400, "Invalid document id");

  const { email, permission } = shareDocSchema.parse(req.body);
  const data = await shareDoc(id, ownerId, email, permission);
  return successResponse(res, data, "Shared");
});

