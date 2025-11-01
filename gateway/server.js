import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authProxy from "./routes/authProxy.js";
import booksProxy from "./routes/booksProxy.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount the proxy routes
app.use("/api", authProxy);
app.use("/api", booksProxy);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
