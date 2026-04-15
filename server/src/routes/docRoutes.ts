import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocs,
  updateDocument,
} from "../controllers/docController";
import { shareDocument, getSharedDocument } from "../controllers/shareController";

export const docRouter = Router();

// Public route — no auth required
docRouter.get("/shared/:token", getSharedDocument);

// Protected routes
docRouter.use(protect);

docRouter.get("/", listDocs);
docRouter.post("/", createDocument);
docRouter.get("/:id", getDocument);
docRouter.put("/:id", updateDocument);
docRouter.delete("/:id", deleteDocument);
docRouter.post("/:id/share", shareDocument);
