"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedDocument = exports.shareDocument = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const validateObjectId_1 = require("../utils/validateObjectId");
const requestUser_1 = require("../utils/requestUser");
const shareService_1 = require("../services/shareService");
/** Toggle public share link for a document (auth required, owner only) */
exports.shareDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = (0, requestUser_1.getUserIdFromReq)(req);
    const id = String(req.params.id ?? "");
    if (!id || !(0, validateObjectId_1.isValidObjectId)(id))
        throw new ApiError_1.ApiError(400, "Invalid document id");
    const data = await (0, shareService_1.toggleShareLink)(id, ownerId);
    return (0, ApiResponse_1.successResponse)(res, data, data.shared ? "Link created" : "Link revoked");
});
/** Get a document via public share token (no auth required) */
exports.getSharedDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = String(req.params.token ?? "").trim();
    if (!token)
        throw new ApiError_1.ApiError(400, "Missing share token");
    const data = await (0, shareService_1.getDocByShareToken)(token);
    return (0, ApiResponse_1.successResponse)(res, data);
});
//# sourceMappingURL=shareController.js.map