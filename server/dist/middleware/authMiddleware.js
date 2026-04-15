"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../utils/jwt");
const protect = (req, _res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            throw new ApiError_1.ApiError(401, "Unauthorized");
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch {
        next(new ApiError_1.ApiError(401, "Invalid token"));
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddleware.js.map