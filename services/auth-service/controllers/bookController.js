import Book from "../models/book.js";
import { ok, created, error as sendError, unauthorized, notFound, badRequest } from "../utils/response.js";

// @desc Get all books
// @route GET /api/books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id });
    return ok(res, books, 'Books fetched');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};

// @desc Add a book
// @route POST /api/books
export const addBook = async (req, res) => {
  try {
    const { title, author, description, publishedYear } = req.body;
    const book = await Book.create({ title, author, description, publishedYear, user: req.user.id });
    return created(res, book, 'Book created');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};

const ALLOWED_STATUSES = ["to-read", "currently-reading", "read"];

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const { title, author, description, publishedYear, status } = req.body || {};

    if (title !== undefined) updates.title = title;
    if (author !== undefined) updates.author = author;
    if (description !== undefined) updates.description = description;
    if (publishedYear !== undefined) updates.publishedYear = publishedYear;
    if (status !== undefined) {
      const normalized = String(status).toLowerCase();
      if (!ALLOWED_STATUSES.includes(normalized)) {
        return badRequest(res, 'Invalid status');
      }
      updates.status = normalized;
    }

    const book = await Book.findById(id);
    if (!book) return notFound(res, 'Book not found');
    if (book.user.toString() !== req.user.id) return unauthorized(res, 'Not authorized');

    Object.assign(book, updates);
    await book.save();

    return ok(res, book, 'Book updated');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};

// @desc Delete a book
// @route DELETE /api/books/:id
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return notFound(res, 'Book not found');
    if (book.user.toString() !== req.user.id) return unauthorized(res, 'Not authorized');
    await book.deleteOne();
    return ok(res, { _id: req.params.id }, 'Book removed');
  } catch (e) {
    return sendError(res, 500, e.message || 'Internal Server Error');
  }
};