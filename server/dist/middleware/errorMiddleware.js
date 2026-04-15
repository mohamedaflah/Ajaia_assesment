"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
function notFoundHandler(req, _res, next) {
    next(new ApiError_1.ApiError(404, `Not found: ${req.method} ${req.originalUrl}`));
}
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, _req, res, _next) {
    const apiErr = err instanceof ApiError_1.ApiError ? err : new ApiError_1.ApiError(500, "Server error");
    // eslint-disable-next-line no-console
    if (!(err instanceof ApiError_1.ApiError))
        console.error(err);
    return res.status(apiErr.statusCode).json({
        success: false,
        message: apiErr.message,
    });
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorMiddleware.js.map