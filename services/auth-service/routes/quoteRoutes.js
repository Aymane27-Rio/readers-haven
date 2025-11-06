import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getQuotes, addQuote, deleteQuote } from "../controllers/quoteController.js";

const router = express.Router();

router.route("/")
  .get(protect, getQuotes)
  .post(protect, addQuote);

router.route("/:id")
  .delete(protect, deleteQuote);

export default router;
