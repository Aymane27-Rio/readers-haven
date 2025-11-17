import User from "../models/User.js";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { ok, badRequest, error as sendError } from "../utils/response.js";

// Multer storage (local uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]; 
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only jpg, png, webp allowed"));
    cb(null, true);
  },
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
});

export const avatarUpload = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      const message = err.message || "Failed to upload avatar";
      return badRequest(res, message, err.code ? { code: err.code } : undefined);
    }
    next();
  });
};

export const getMe = async (req, res) => {
  const u = req.user;
  return ok(res, {
    _id: u._id,
    name: u.name,
    email: u.email,
    username: u.username || "",
    bio: u.bio || "",
    location: u.location || "",
    avatarUrl: u.avatarUrl || "",
    preferences: {
      theme: u.preferences?.theme || 'system',
      emailUpdates: typeof u.preferences?.emailUpdates === 'boolean' ? u.preferences.emailUpdates : true,
      showShelvesPublic: typeof u.preferences?.showShelvesPublic === 'boolean' ? u.preferences.showShelvesPublic : true,
      language: u.preferences?.language || 'en',
    },
  }, 'Profile fetched');
};

export const updateMe = async (req, res) => {
  try {
    const { name, username, bio, location, preferences, avatarUrl } = req.body;
    // basic sanitization/trim
    const updates = {};
    if (typeof name === "string") updates.name = name.trim();
    if (typeof username === "string") updates.username = username.trim().toLowerCase();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof location === "string") updates.location = location.trim();
    if (typeof avatarUrl === "string") updates.avatarUrl = avatarUrl.trim();

    // preferences update (validated fields only)
    if (preferences && typeof preferences === 'object') {
      const next = { ...(req.user.preferences?.toObject?.() || req.user.preferences || {}) };
      if (typeof preferences.theme === 'string' && ['system','light','dark'].includes(preferences.theme)) next.theme = preferences.theme;
      if (typeof preferences.emailUpdates === 'boolean') next.emailUpdates = preferences.emailUpdates;
      if (typeof preferences.showShelvesPublic === 'boolean') next.showShelvesPublic = preferences.showShelvesPublic;
      if (typeof preferences.language === 'string' && ['en','ar','zgh'].includes(preferences.language)) next.language = preferences.language;
      updates.preferences = next;
    }

    // unique username check when provided
    if (updates.username) {
      const exists = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
      if (exists) return badRequest(res, "Username already taken");
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return ok(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      avatarUrl: user.avatarUrl || "",
      preferences: {
        theme: user.preferences?.theme || 'system',
        emailUpdates: typeof user.preferences?.emailUpdates === 'boolean' ? user.preferences.emailUpdates : true,
        showShelvesPublic: typeof user.preferences?.showShelvesPublic === 'boolean' ? user.preferences.showShelvesPublic : true,
        language: user.preferences?.language || 'en',
      },
    }, 'Profile updated');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return badRequest(res, "No file uploaded");
    const rel = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl: rel }, { new: true });
    return ok(res, { avatarUrl: user.avatarUrl }, 'Avatar updated');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};
