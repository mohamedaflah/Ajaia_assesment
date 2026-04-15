"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToDocument = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const requestUser_1 = require("../utils/requestUser");
const uploadSchemas_1 = require("../utils/validators/uploadSchemas");
const uploadService_1 = require("../services/uploadService");
const MAX_BYTES = 2 * 1024 * 1024;
const allowedExt = new Set([".txt", ".md"]);
function getExt(filename) {
    const idx = filename.lastIndexOf(".");
    return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: MAX_BYTES },
    fileFilter: (_req, file, cb) => {
        const ext = getExt(file.originalname);
        if (!allowedExt.has(ext))
            return cb(new ApiError_1.ApiError(400, "Only .txt and .md are allowed"));
        return cb(null, true);
    },
});
exports.uploadToDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = (0, requestUser_1.getUserIdFromReq)(req);
    const { title } = uploadSchemas_1.uploadSchema.parse(req.query);
    const file = req.file;
    if (!file)
        throw new ApiError_1.ApiError(400, "File is required");
    const data = await (0, uploadService_1.createDocFromUpload)({
        userId,
        originalName: file.originalname,
        buffer: file.buffer,
        ...(title ? { titleOverride: title } : {}),
    });
    return (0, ApiResponse_1.successResponse)(res, data, "Uploaded");
});
//# sourceMappingURL=uploadController.js.map