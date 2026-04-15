"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromReq = void 0;
const ApiError_1 = require("./ApiError");
function getUserIdFromReq(req) {
    const userId = req?.user?.userId;
    if (!userId || typeof userId !== "string")
        throw new ApiError_1.ApiError(401, "Unauthorized");
    return userId;
}
exports.getUserIdFromReq = getUserIdFromReq;
//# sourceMappingURL=requestUser.js.map