import express from "express";
import { getBooks, addBook, deleteBook, updateBook } from "../controllers/bookController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getBooks)
  .post(protect, addBook);

router.route("/:id")
  .put(protect, updateBook)
  .delete(protect, deleteBook);

export default router;