"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromReq = getUserIdFromReq;
const ApiError_1 = require("./ApiError");
function getUserIdFromReq(req) {
    const userId = req?.user?.userId;
    if (!userId || typeof userId !== "string")
        throw new ApiError_1.ApiError(401, "Unauthorized");
    return userId;
}
//# sourceMappingURL=requestUser.js.map