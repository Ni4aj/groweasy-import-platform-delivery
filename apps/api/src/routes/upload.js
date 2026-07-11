import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadCSV } from "../controllers/uploadController.js";

const router = express.Router();

// POST /api/upload
router.post(
  "/upload",
  upload.single("file"),
  uploadCSV
);

export default router;