import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword, me, csrf, logout } from "../controllers/authController.js";
import { protect, verifyCsrf } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/csrf", csrf);
router.post("/register", verifyCsrf, registerUser);
router.post("/login", verifyCsrf, loginUser);
router.post("/logout", verifyCsrf, logout);
router.post("/forgot", verifyCsrf, forgotPassword);
router.post("/reset", verifyCsrf, resetPassword);
router.get("/me", protect, me);

export default router;