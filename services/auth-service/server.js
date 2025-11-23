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
import { csrf } from "./controllers/authController.js";
import fs from "fs";
import path from "path";
import { requestId } from "./utils/requestId.js";
import { logger } from "./utils/logger.js";
import { config } from "./utils/config.js";
import { ok, error as sendError } from "./utils/response.js";
import { initializeTracing, createHttpMetrics } from "../../shared/libs/observability.js";

console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();

const SERVICE_NAME = "auth-service";
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
// Core hardening & transport
app.use(requestId);
app.use(helmet());
app.use(compression());

// CORS: allow both frontend dev and production origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:32173",
  "http://localhost:5173"
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-XSRF-Token', 'Authorization'],
}));
// Global baseline rate limit
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
// Parse JSON but skip multipart/form-data (let multer handle it)
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, next);
});
// Basic request logging
app.use((req, _res, next) => { logger.info({ id: req.id, method: req.method, url: req.url }); next(); });
app.use(metricsMiddleware);
app.use(passport.initialize());
configurePassport();

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads");
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) { }
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => ok(res, { service: "readers-haven-api", status: "up" }, "Readers Haven API is running"));

app.get('/health', (_req, res) => {
  res.json({ status: 'up', service: 'backend-api' });
});

app.get('/metrics', metricsHandler);

// Explicit CSRF endpoints for SPA (support both /api/auth and /auth)
app.get("/api/auth/csrf", csrf);
app.get("/auth/csrf", csrf);

// Stricter limiter just for auth endpoints (login/register/reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many auth attempts, please try again later.",
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/auth", authLimiter, authRoutes);
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

app.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
app.get(
  "/google/callback",
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
