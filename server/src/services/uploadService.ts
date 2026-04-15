import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { parseTextFile } from "../utils/fileParser";
import { DocumentModel } from "../models/Document";

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function plainTextToTipTapDoc(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content = lines.map((line) => ({
    type: "paragraph",
    content: line.length ? [{ type: "text", text: line }] : [],
  }));
  return { type: "doc", content };
}

export async function createDocFromUpload(params: {
  userId: string;
  originalName: string;
  buffer: Buffer;
  titleOverride?: string;
}) {
  const titleFromName = params.originalName.replace(/\.(txt|md)$/i, "");
  const title = (params.titleOverride?.trim() || titleFromName || "Untitled").trim();
  if (!title) throw new ApiError(400, "Title cannot be empty");

  const text = parseTextFile(params.buffer);
  if (!text.trim()) throw new ApiError(400, "File content is empty");

  const docJson = plainTextToTipTapDoc(text);
  const created = await DocumentModel.create({
    title,
    content: docJson,
    owner: toObjectId(params.userId),
    collaborators: [],
  });
  return created.toObject();
}

