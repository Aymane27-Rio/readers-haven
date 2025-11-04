import User from "../models/User.js";
import multer from "multer";
import path from "path";
import crypto from "crypto";

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

export const getMe = async (req, res) => {
  const u = req.user;
  res.json({
    _id: u._id,
    name: u.name,
    email: u.email,
    username: u.username || "",
    bio: u.bio || "",
    location: u.location || "",
    avatarUrl: u.avatarUrl || "",
  });
};

export const updateMe = async (req, res) => {
  try {
    const { name, username, bio, location } = req.body;
    const { avatarUrl } = req.body;
    // basic sanitization/trim
    const updates = {};
    if (typeof name === "string") updates.name = name.trim();
    if (typeof username === "string") updates.username = username.trim().toLowerCase();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof location === "string") updates.location = location.trim();
    if (typeof avatarUrl === "string") updates.avatarUrl = avatarUrl.trim();

    // unique username check when provided
    if (updates.username) {
      const exists = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
      if (exists) return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      avatarUrl: user.avatarUrl || "",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const rel = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl: rel }, { new: true });
    res.json({ avatarUrl: user.avatarUrl });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
