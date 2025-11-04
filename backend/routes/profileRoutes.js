import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMe, updateMe, uploadAvatar, upload } from "../controllers/profileController.js";

const router = express.Router();

router.get("/", protect, getMe);
router.put("/", protect, updateMe);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

export default router;
