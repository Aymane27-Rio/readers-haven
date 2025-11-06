import dotenv from "dotenv";
dotenv.config(); // must be first

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import passport, { configurePassport, oauthSuccessRedirect } from "./config/passport.js";
import profileRoutes from "./routes/profileRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import fs from "fs";
import path from "path";
import { requestId } from "./utils/requestId.js";
import { logger } from "./utils/logger.js";
import { config } from "./utils/config.js";
import { ok, error as sendError } from "./utils/response.js";

console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();

const app = express();
// Core hardening & transport
app.use(requestId);
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use(express.json());
// Basic request logging
app.use((req, _res, next) => { logger.info({ id: req.id, method: req.method, url: req.url }); next(); });
app.use(passport.initialize());
configurePassport();

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads");
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => ok(res, { service: "readers-haven-api", status: "up" }, "Readers Haven API is running"));

app.get('/health', (_req, res) => {
  res.json({ status: 'up', service: 'backend-api' });
});

app.get('/metrics', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`# HELP backend_requests_total Total number of HTTP requests\n# TYPE backend_requests_total counter\nbackend_requests_total{service="backend-api"} 1\n`);
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quotes", quoteRoutes);

// OAuth routes (Google)
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: (process.env.FRONTEND_URL || "http://localhost:5173") + "/login?oauth=failed" }),
  oauthSuccessRedirect
);

// OAuth routes (Facebook)
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"], session: false }));
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: (process.env.FRONTEND_URL || "http://localhost:5173") + "/login?oauth=failed" }),
  oauthSuccessRedirect
);

// 404 handler
app.use((req, res) => sendError(res, 404, "Route not found", "NOT_FOUND"));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logger.error({ id: req?.id, err: err?.message, stack: err?.stack });
  return sendError(res, err.status || 500, err.message || "Internal Server Error", err.code || "INTERNAL_ERROR");
});

const PORT = config.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
