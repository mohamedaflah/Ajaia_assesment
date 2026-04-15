import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";
import { authRouter } from "./routes/authRoutes";
import { docRouter } from "./routes/docRoutes";
import { uploadRouter } from "./routes/uploadRoutes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN ?? true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/docs", docRouter);
  app.use("/api/upload", uploadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

