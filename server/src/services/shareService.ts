import crypto from "crypto";
import { ApiError } from "../utils/ApiError";
import { DocumentModel } from "../models/Document";

/**
 * Toggle public sharing for a document. If already shared, revoke.
 * If not shared, generate a new random token.
 */
export async function toggleShareLink(documentId: string, ownerId: string) {
  const doc = await DocumentModel.findById(documentId).select({ owner: 1, shareToken: 1 }).lean();
  if (!doc) throw new ApiError(404, "Document not found");
  if (String(doc.owner) !== ownerId) throw new ApiError(403, "Only owner can share");

  if (doc.shareToken) {
    // Revoke: remove the token
    await DocumentModel.updateOne({ _id: documentId }, { $set: { shareToken: null } });
    return { shareToken: null, shared: false };
  } else {
    // Generate a new share token
    const token = crypto.randomBytes(16).toString("hex");
    await DocumentModel.updateOne({ _id: documentId }, { $set: { shareToken: token } });
    return { shareToken: token, shared: true };
  }
}

/**
 * Get a document by its public share token. No auth required.
 */
export async function getDocByShareToken(token: string) {
  const doc = await DocumentModel.findOne({ shareToken: token })
    .select({ title: 1, content: 1, shareToken: 1, createdAt: 1, updatedAt: 1 })
    .lean();
  if (!doc) throw new ApiError(404, "Document not found or link expired");
  return doc;
}
