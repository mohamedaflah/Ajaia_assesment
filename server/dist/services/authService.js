"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupWithEmailPassword = exports.loginWithEmailPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
async function loginWithEmailPassword(email, password) {
    const user = await User_1.UserModel.findOne({ email: email.toLowerCase().trim() }).lean();
    if (!user)
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        throw new ApiError_1.ApiError(401, "Invalid credentials");
    const token = (0, jwt_1.generateToken)(String(user._id));
    return { token };
}
exports.loginWithEmailPassword = loginWithEmailPassword;
async function signupWithEmailPassword(email, password) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User_1.UserModel.findOne({ email: normalizedEmail }).lean();
    if (existing)
        throw new ApiError_1.ApiError(409, "User already exists");
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const created = await User_1.UserModel.create({ email: normalizedEmail, passwordHash });
    const token = (0, jwt_1.generateToken)(String(created._id));
    return { token };
}
exports.signupWithEmailPassword = signupWithEmailPassword;
//# sourceMappingURL=authService.js.map