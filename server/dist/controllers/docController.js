"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.createDocument = exports.listDocs = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const validateObjectId_1 = require("../utils/validateObjectId");
const requestUser_1 = require("../utils/requestUser");
const docSchemas_1 = require("../utils/validators/docSchemas");
const docService_1 = require("../services/docService");
exports.listDocs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = (0, requestUser_1.getUserIdFromReq)(req);
    const data = await (0, docService_1.listDocsForUser)(userId);
    return (0, ApiResponse_1.successResponse)(res, data);
});
exports.createDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = (0, requestUser_1.getUserIdFromReq)(req);
    const input = docSchemas_1.createDocSchema.parse(req.body);
    const data = await (0, docService_1.createDoc)(userId, input);
    return (0, ApiResponse_1.successResponse)(res, data, "Document created");
});
exports.getDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = (0, requestUser_1.getUserIdFromReq)(req);
    const id = String(req.params.id ?? "");
    if (!id || !(0, validateObjectId_1.isValidObjectId)(id))
        throw new ApiError_1.ApiError(400, "Invalid document id");
    const data = await (0, docService_1.getDocById)(id, userId);
    return (0, ApiResponse_1.successResponse)(res, data);
});
exports.updateDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = (0, requestUser_1.getUserIdFromReq)(req);
    const id = String(req.params.id ?? "");
    if (!id || !(0, validateObjectId_1.isValidObjectId)(id))
        throw new ApiError_1.ApiError(400, "Invalid document id");
    const input = docSchemas_1.updateDocSchema.parse(req.body);
    const data = await (0, docService_1.updateDoc)(id, userId, input);
    return (0, ApiResponse_1.successResponse)(res, data, "Document updated");
});
exports.deleteDocument = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = (0, requestUser_1.getUserIdFromReq)(req);
    const id = String(req.params.id ?? "");
    if (!id || !(0, validateObjectId_1.isValidObjectId)(id))
        throw new ApiError_1.ApiError(400, "Invalid document id");
    const data = await (0, docService_1.deleteDoc)(id, userId);
    return (0, ApiResponse_1.successResponse)(res, data, "Document deleted");
});
//# sourceMappingURL=docController.js.map