// routes/booksProxy.js
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = express.Router();

router.use(
  "/books",
  createProxyMiddleware({
    target: process.env.BOOKS_SERVICE_URL || "http://localhost:4002",
    changeOrigin: true,
    pathRewrite: { "^/books": "" },
  })
);

export default router;
