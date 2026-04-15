"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDocsForUser = listDocsForUser;
exports.createDoc = createDoc;
exports.getDocById = getDocById;
exports.updateDoc = updateDoc;
exports.renameDoc = renameDoc;
exports.deleteDoc = deleteDoc;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/ApiError");
const Document_1 = require("../models/Document");
function toObjectId(id) {
    return new mongoose_1.default.Types.ObjectId(id);
}
async function getPermission(documentId, userId) {
    const doc = await Document_1.DocumentModel.findById(documentId)
        .select({ owner: 1, collaborators: 1 })
        .lean();
    if (!doc)
        throw new ApiError_1.ApiError(404, "Document not found");
    const uid = userId;
    if (String(doc.owner) === uid)
        return "owner";
    const collab = doc.collaborators?.find((c) => String(c.user) === uid);
    if (!collab)
        return "none";
    return collab.permission === "write" ? "write" : "read";
}
async function listDocsForUser(userId) {
    const owned = await Document_1.DocumentModel.find({ owner: toObjectId(userId) })
        .select({ title: 1, updatedAt: 1, createdAt: 1, owner: 1 })
        .sort({ updatedAt: -1 })
        .lean();
    const shared = await Document_1.DocumentModel.find({ "collaborators.user": toObjectId(userId) })
        .select({ title: 1, updatedAt: 1, createdAt: 1, owner: 1 })
        .sort({ updatedAt: -1 })
        .lean();
    return { owned, shared };
}
async function createDoc(userId, input) {
    const created = await Document_1.DocumentModel.create({
        title: input.title.trim(),
        content: input.content,
        owner: toObjectId(userId),
        collaborators: [],
    });
    return created.toObject();
}
async function getDocById(documentId, userId) {
    const perm = await getPermission(documentId, userId);
    if (perm === "none")
        throw new ApiError_1.ApiError(403, "Forbidden");
    const doc = await Document_1.DocumentModel.findById(documentId).lean();
    if (!doc)
        throw new ApiError_1.ApiError(404, "Document not found");
    return doc;
}
async function updateDoc(documentId, userId, input) {
    const perm = await getPermission(documentId, userId);
    if (perm !== "owner" && perm !== "write")
        throw new ApiError_1.ApiError(403, "Forbidden");
    const update = {};
    if (input.title !== undefined)
        update.title = input.title.trim();
    if (input.content !== undefined)
        update.content = input.content;
    const updated = await Document_1.DocumentModel.findByIdAndUpdate(documentId, update, {
        new: true,
    }).lean();
    if (!updated)
        throw new ApiError_1.ApiError(404, "Document not found");
    return updated;
}
async function renameDoc(documentId, userId, title) {
    return updateDoc(documentId, userId, { title });
}
async function deleteDoc(documentId, userId) {
    const perm = await getPermission(documentId, userId);
    if (perm !== "owner")
        throw new ApiError_1.ApiError(403, "Only owner can delete");
    const deleted = await Document_1.DocumentModel.findByIdAndDelete(documentId).lean();
    if (!deleted)
        throw new ApiError_1.ApiError(404, "Document not found");
    return { id: documentId };
}
//# sourceMappingURL=docService.js.map