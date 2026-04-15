"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareDocument = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const validateObjectId_1 = require("../utils/validateObjectId");
const requestUser_1 = require("../utils/requestUser");
const shareSchemas_1 = require("../utils/validators/shareSchemas");
const shareService_1 = require("../services/shareService");
exports.shareDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ownerId = (0, requestUser_1.getUserIdFromReq)(req);
    const id = String(req.params.id ?? "");
    if (!id || !(0, validateObjectId_1.isValidObjectId)(id))
        throw new ApiError_1.ApiError(400, "Invalid document id");
    const { email, permission } = shareSchemas_1.shareDocSchema.parse(req.body);
    const data = await (0, shareService_1.shareDoc)(id, ownerId, email, permission);
    return (0, ApiResponse_1.successResponse)(res, data, "Shared");
});
//# sourceMappingURL=shareController.js.map