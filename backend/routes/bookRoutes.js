import express from "express";
import { getBooks, addBook, deleteBook } from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getBooks)
  .post(protect, addBook);

router.route("/:id")
  .delete(protect, deleteBook);

export default router;