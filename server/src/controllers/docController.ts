import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { isValidObjectId } from "../utils/validateObjectId";
import { getUserIdFromReq } from "../utils/requestUser";
import { createDocSchema, updateDocSchema } from "../utils/validators/docSchemas";
import {
  createDoc,
  deleteDoc,
  getDocById,
  listDocsForUser,
  updateDoc,
} from "../services/docService";

export const listDocs = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req as any);
  const data = await listDocsForUser(userId);
  return successResponse(res, data);
});

export const createDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req as any);
  const input = createDocSchema.parse(req.body);
  const data = await createDoc(userId, input);
  return successResponse(res, data, "Document created");
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req as any);
  const id = String((req.params as any).id ?? "");
  if (!id || !isValidObjectId(id)) throw new ApiError(400, "Invalid document id");
  const data = await getDocById(id, userId);
  return successResponse(res, data);
});

export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req as any);
  const id = String((req.params as any).id ?? "");
  if (!id || !isValidObjectId(id)) throw new ApiError(400, "Invalid document id");
  const input = updateDocSchema.parse(req.body);
  const data = await updateDoc(id, userId, input);
  return successResponse(res, data, "Document updated");
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req as any);
  const id = String((req.params as any).id ?? "");
  if (!id || !isValidObjectId(id)) throw new ApiError(400, "Invalid document id");
  const data = await deleteDoc(id, userId);
  return successResponse(res, data, "Document deleted");
});

