"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const authRoutes_1 = require("./routes/authRoutes");
const docRoutes_1 = require("./routes/docRoutes");
const uploadRoutes_1 = require("./routes/uploadRoutes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN ?? true,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "2mb" }));
    app.get("/api/health", (_req, res) => {
        res.status(200).json({ ok: true });
    });
    app.use("/api/auth", authRoutes_1.authRouter);
    app.use("/api/docs", docRoutes_1.docRouter);
    app.use("/api/upload", uploadRoutes_1.uploadRouter);
    app.use(errorMiddleware_1.notFoundHandler);
    app.use(errorMiddleware_1.errorHandler);
    return app;
}
exports.createApp = createApp;
//# sourceMappingURL=app.js.map