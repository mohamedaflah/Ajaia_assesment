"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = exports.login = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const authSchemas_1 = require("../utils/validators/authSchemas");
const authService_1 = require("../services/authService");
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = authSchemas_1.loginSchema.parse(req.body);
    const data = await (0, authService_1.loginWithEmailPassword)(email, password);
    return (0, ApiResponse_1.successResponse)(res, data, "Login successful");
});
exports.signup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = authSchemas_1.signupSchema.parse(req.body);
    const data = await (0, authService_1.signupWithEmailPassword)(email, password);
    return (0, ApiResponse_1.successResponse)(res, data, "Signup successful");
});
//# sourceMappingURL=authController.js.map