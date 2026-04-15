import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { upload, uploadToDocument } from "../controllers/uploadController";

export const uploadRouter = Router();

uploadRouter.use(protect);

uploadRouter.post("/", upload.single("file"), uploadToDocument);

