import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { DocumentModel } from "../models/Document";
import { UserModel } from "../models/User";

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export async function shareDoc(
  documentId: string,
  ownerId: string,
  collaboratorEmail: string,
  permission: "read" | "write"
) {
  const doc = await DocumentModel.findById(documentId).select({ owner: 1 }).lean();
  if (!doc) throw new ApiError(404, "Document not found");
  if (String(doc.owner) !== ownerId) throw new ApiError(403, "Only owner can share");

  const user = await UserModel.findOne({ email: collaboratorEmail.toLowerCase().trim() })
    .select({ _id: 1 })
    .lean();
  if (!user) throw new ApiError(404, "User not found");
  if (String(user._id) === ownerId) throw new ApiError(400, "Owner already has access");

  await DocumentModel.updateOne(
    { _id: toObjectId(documentId) },
    {
      $pull: { collaborators: { user: user._id } },
    }
  );
  const updated = await DocumentModel.findByIdAndUpdate(
    documentId,
    {
      $addToSet: { collaborators: { user: user._id, permission } },
    },
    { new: true }
  ).lean();

  if (!updated) throw new ApiError(404, "Document not found");
  return updated;
}

