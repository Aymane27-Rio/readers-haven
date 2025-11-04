import express from "express";
import multer from "multer";
import path from "path";
import { getBooks, addBook, deleteBook } from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/users/profile
router.post("/profile", protect, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.bio = req.body.bio;
    user.interests = req.body.interests;
    user.favoriteQuote = req.body.favoriteQuote;

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.route("/")
  .get(protect, getBooks)
  .post(protect, addBook);

router.route("/:id")
  .delete(protect, deleteBook);

export default router;