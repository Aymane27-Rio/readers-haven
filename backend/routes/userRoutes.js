// backend/routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PUT /api/user/profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, interests, favoriteQuote, profilePic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio, interests, favoriteQuote, profilePic },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
