"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocFromUpload = createDocFromUpload;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/ApiError");
const fileParser_1 = require("../utils/fileParser");
const Document_1 = require("../models/Document");
function toObjectId(id) {
    return new mongoose_1.default.Types.ObjectId(id);
}
function plainTextToTipTapDoc(text) {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const content = lines.map((line) => ({
        type: "paragraph",
        content: line.length ? [{ type: "text", text: line }] : [],
    }));
    return { type: "doc", content };
}
async function createDocFromUpload(params) {
    const titleFromName = params.originalName.replace(/\.(txt|md)$/i, "");
    const title = (params.titleOverride?.trim() || titleFromName || "Untitled").trim();
    if (!title)
        throw new ApiError_1.ApiError(400, "Title cannot be empty");
    const text = (0, fileParser_1.parseTextFile)(params.buffer);
    if (!text.trim())
        throw new ApiError_1.ApiError(400, "File content is empty");
    const docJson = plainTextToTipTapDoc(text);
    const created = await Document_1.DocumentModel.create({
        title,
        content: docJson,
        owner: toObjectId(params.userId),
        collaborators: [],
    });
    return created.toObject();
}
//# sourceMappingURL=uploadService.js.map