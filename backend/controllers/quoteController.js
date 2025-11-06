import Quote from "../models/quote.js";
import { ok, created, error as sendError, notFound, unauthorized, badRequest } from "../utils/response.js";

// @desc Get all quotes
// @route GET /api/quotes
export const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ user: req.user.id }).sort({ createdAt: -1 });
    return ok(res, quotes, 'Quotes fetched');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};

// @desc Add a quote
// @route POST /api/quotes
export const addQuote = async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text || !text.trim()) return badRequest(res, 'Quote text is required');
    const quote = await Quote.create({ text: text.trim(), author, user: req.user.id });
    return created(res, quote, 'Quote created');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};

// @desc Delete a quote
// @route DELETE /api/quotes/:id
export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return notFound(res, 'Quote not found');
    if (quote.user.toString() !== req.user.id) return unauthorized(res, 'Not authorized');
    await quote.deleteOne();
    return ok(res, { _id: req.params.id }, 'Quote removed');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};
