import dotenv from "dotenv";
dotenv.config(); // must be first

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import passport, { configurePassport, oauthSuccessRedirect } from "./config/passport.js";
import profileRoutes from "./routes/profileRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import fs from "fs";
import path from "path";

console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(passport.initialize());
configurePassport();

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads");
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("Readers Haven API is running");
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

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
