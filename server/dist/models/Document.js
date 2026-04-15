"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const collaboratorSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    permission: { type: String, enum: ["read", "write"], required: true },
}, { _id: false });
const documentSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: mongoose_1.default.Schema.Types.Mixed, required: true }, // TipTap JSON
    owner: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    collaborators: { type: [collaboratorSchema], default: [] },
    shareToken: { type: String, default: null, index: true, sparse: true },
}, { timestamps: true });
exports.DocumentModel = mongoose_1.default.models.Document ||
    mongoose_1.default.model("Document", documentSchema);
//# sourceMappingURL=Document.js.map