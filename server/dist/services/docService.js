"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoc = exports.renameDoc = exports.updateDoc = exports.getDocById = exports.createDoc = exports.listDocsForUser = void 0;
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
    return { owned };
}
exports.listDocsForUser = listDocsForUser;
async function createDoc(userId, input) {
    const created = await Document_1.DocumentModel.create({
        title: input.title.trim(),
        content: input.content,
        owner: toObjectId(userId),
        collaborators: [],
    });
    return created.toObject();
}
exports.createDoc = createDoc;
async function getDocById(documentId, userId) {
    const perm = await getPermission(documentId, userId);
    if (perm === "none")
        throw new ApiError_1.ApiError(403, "Forbidden");
    const doc = await Document_1.DocumentModel.findById(documentId).lean();
    if (!doc)
        throw new ApiError_1.ApiError(404, "Document not found");
    return doc;
}
exports.getDocById = getDocById;
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
exports.updateDoc = updateDoc;
async function renameDoc(documentId, userId, title) {
    return updateDoc(documentId, userId, { title });
}
exports.renameDoc = renameDoc;
async function deleteDoc(documentId, userId) {
    const perm = await getPermission(documentId, userId);
    if (perm !== "owner")
        throw new ApiError_1.ApiError(403, "Only owner can delete");
    const deleted = await Document_1.DocumentModel.findByIdAndDelete(documentId).lean();
    if (!deleted)
        throw new ApiError_1.ApiError(404, "Document not found");
    return { id: documentId };
}
exports.deleteDoc = deleteDoc;
//# sourceMappingURL=docService.js.map