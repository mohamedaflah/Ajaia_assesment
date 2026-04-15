import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { DocumentModel } from "../models/Document";
import type { CreateDocInput, UpdateDocInput } from "../utils/validators/docSchemas";

type DocPermission = "none" | "read" | "write" | "owner";

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

async function getPermission(documentId: string, userId: string): Promise<DocPermission> {
  const doc = await DocumentModel.findById(documentId)
    .select({ owner: 1, collaborators: 1 })
    .lean();
  if (!doc) throw new ApiError(404, "Document not found");

  const uid = userId;
  if (String(doc.owner) === uid) return "owner";
  const collab = doc.collaborators?.find((c) => String(c.user) === uid);
  if (!collab) return "none";
  return collab.permission === "write" ? "write" : "read";
}

export async function listDocsForUser(userId: string) {
  const owned = await DocumentModel.find({ owner: toObjectId(userId) })
    .select({ title: 1, updatedAt: 1, createdAt: 1, owner: 1 })
    .sort({ updatedAt: -1 })
    .lean();

  const shared = await DocumentModel.find({ "collaborators.user": toObjectId(userId) })
    .select({ title: 1, updatedAt: 1, createdAt: 1, owner: 1 })
    .sort({ updatedAt: -1 })
    .lean();

  return { owned, shared };
}

export async function createDoc(userId: string, input: CreateDocInput) {
  const created = await DocumentModel.create({
    title: input.title.trim(),
    content: input.content,
    owner: toObjectId(userId),
    collaborators: [],
  });
  return created.toObject();
}

export async function getDocById(documentId: string, userId: string) {
  const perm = await getPermission(documentId, userId);
  if (perm === "none") throw new ApiError(403, "Forbidden");

  const doc = await DocumentModel.findById(documentId).lean();
  if (!doc) throw new ApiError(404, "Document not found");
  return doc;
}

export async function updateDoc(documentId: string, userId: string, input: UpdateDocInput) {
  const perm = await getPermission(documentId, userId);
  if (perm !== "owner" && perm !== "write") throw new ApiError(403, "Forbidden");

  const update: any = {};
  if (input.title !== undefined) update.title = input.title.trim();
  if (input.content !== undefined) update.content = input.content;

  const updated = await DocumentModel.findByIdAndUpdate(documentId, update, {
    new: true,
  }).lean();
  if (!updated) throw new ApiError(404, "Document not found");
  return updated;
}

export async function renameDoc(documentId: string, userId: string, title: string) {
  return updateDoc(documentId, userId, { title });
}

export async function deleteDoc(documentId: string, userId: string) {
  const perm = await getPermission(documentId, userId);
  if (perm !== "owner") throw new ApiError(403, "Only owner can delete");

  const deleted = await DocumentModel.findByIdAndDelete(documentId).lean();
  if (!deleted) throw new ApiError(404, "Document not found");
  return { id: documentId };
}

