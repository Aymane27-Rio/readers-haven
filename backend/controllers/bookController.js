import Book from "../models/book.js";

// @desc Get all books
// @route GET /api/books
export const getBooks = async (req, res) => {
  const books = await Book.find({ user: req.user.id });
  res.json(books);
};

// @desc Add a book
// @route POST /api/books
export const addBook = async (req, res) => {
  const { title, author, description, publishedYear } = req.body;

  const book = await Book.create({
    title,
    author,
    description,
    publishedYear,
    user: req.user.id,
  });

  res.status(201).json(book);
};

// @desc Delete a book
// @route DELETE /api/books/:id
export const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.user.toString() !== req.user.id)
    return res.status(401).json({ message: "Not authorized" });

  await book.deleteOne();
  res.json({ message: "Book removed" });
};