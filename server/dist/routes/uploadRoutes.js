"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadController_1 = require("../controllers/uploadController");
exports.uploadRouter = (0, express_1.Router)();
exports.uploadRouter.use(authMiddleware_1.protect);
exports.uploadRouter.post("/", uploadController_1.upload.single("file"), uploadController_1.uploadToDocument);
//# sourceMappingURL=uploadRoutes.js.map