import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "test" ? "test-secret" : null);

export const protect = async (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ message: "JWT secret not configured" });
  }

  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.cookie) {
    const parts = req.headers.cookie.split(";").map((c) => c.trim());
    const session = parts.find((c) => c.startsWith("rh_session="));
    if (session) {
      token = session.split("=")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user missing" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const verifyCsrf = (req, res, next) => {
  const method = (req.method || "GET").toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return next();
  }

  const headerToken = req.headers["x-csrf-token"] || req.headers["x-xsrf-token"];
  if (!headerToken) {
    return res.status(403).json({ message: "Missing CSRF token" });
  }

  let cookieToken = null;
  if (req.headers.cookie) {
    const parts = req.headers.cookie.split(";").map((c) => c.trim());
    const csrfCookie = parts.find((c) => c.startsWith("rh_csrf="));
    if (csrfCookie) cookieToken = csrfCookie.split("=")[1];
  }

  if (!cookieToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  return next();
};