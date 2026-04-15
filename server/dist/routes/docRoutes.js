"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const docController_1 = require("../controllers/docController");
const shareController_1 = require("../controllers/shareController");
exports.docRouter = (0, express_1.Router)();
// Public route — no auth required
exports.docRouter.get("/shared/:token", shareController_1.getSharedDocument);
// Protected routes
exports.docRouter.use(authMiddleware_1.protect);
exports.docRouter.get("/", docController_1.listDocs);
exports.docRouter.post("/", docController_1.createDocument);
exports.docRouter.get("/:id", docController_1.getDocument);
exports.docRouter.put("/:id", docController_1.updateDocument);
exports.docRouter.delete("/:id", docController_1.deleteDocument);
exports.docRouter.post("/:id/share", shareController_1.shareDocument);
//# sourceMappingURL=docRoutes.js.map