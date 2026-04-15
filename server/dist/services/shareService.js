"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareDoc = shareDoc;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/ApiError");
const Document_1 = require("../models/Document");
const User_1 = require("../models/User");
function toObjectId(id) {
    return new mongoose_1.default.Types.ObjectId(id);
}
async function shareDoc(documentId, ownerId, collaboratorEmail, permission) {
    const doc = await Document_1.DocumentModel.findById(documentId).select({ owner: 1 }).lean();
    if (!doc)
        throw new ApiError_1.ApiError(404, "Document not found");
    if (String(doc.owner) !== ownerId)
        throw new ApiError_1.ApiError(403, "Only owner can share");
    const user = await User_1.UserModel.findOne({ email: collaboratorEmail.toLowerCase().trim() })
        .select({ _id: 1 })
        .lean();
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    if (String(user._id) === ownerId)
        throw new ApiError_1.ApiError(400, "Owner already has access");
    await Document_1.DocumentModel.updateOne({ _id: toObjectId(documentId) }, {
        $pull: { collaborators: { user: user._id } },
    });
    const updated = await Document_1.DocumentModel.findByIdAndUpdate(documentId, {
        $addToSet: { collaborators: { user: user._id, permission } },
    }, { new: true }).lean();
    if (!updated)
        throw new ApiError_1.ApiError(404, "Document not found");
    return updated;
}
//# sourceMappingURL=shareService.js.map