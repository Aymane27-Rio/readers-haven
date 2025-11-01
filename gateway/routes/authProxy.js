// routes/authProxy.js
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = express.Router();

router.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);

export default router;
