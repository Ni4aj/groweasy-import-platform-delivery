import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import uploadRoutes from "./routes/upload.js";

// --------------------------------------------
// Load .env
// --------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

// --------------------------------------------
// Startup
// --------------------------------------------

console.log("=================================");
console.log("GrowEasy Backend Starting...");
console.log("=================================");

const app = express();

const PORT = process.env.PORT || 4000;

// --------------------------------------------
// CORS Configuration
// --------------------------------------------

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "https://groweasy-web-vqod.onrender.com",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (Postman, curl, Render health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------------------
// Routes
// --------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GrowEasy API Running 🚀",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", uploadRoutes);

// --------------------------------------------
// Global Error Handler
// --------------------------------------------

app.use((err, req, res, next) => {
  console.error("Backend Error:", err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

// --------------------------------------------
// Start Server
// --------------------------------------------

app.listen(PORT, () => {
  console.log(`🚀 GrowEasy API running on port ${PORT}`);
});