import express from "express";
import dotenv from "dotenv";
import connectDB, { closeDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import cors from "cors";

dotenv.config({ path: ".env" });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// in-mem db for tests
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

export default app;
