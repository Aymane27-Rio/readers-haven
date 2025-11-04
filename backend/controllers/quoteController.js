import Quote from "../models/quote.js";

export const getQuotes = async (req, res) => {
  const quotes = await Quote.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(quotes);
};

export const addQuote = async (req, res) => {
  const { text, author } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: "Quote text is required" });
  const q = await Quote.create({ text: text.trim(), author: (author || "").trim(), user: req.user.id });
  res.status(201).json(q);
};

export const deleteQuote = async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: "Quote not found" });
  if (quote.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });
  await quote.deleteOne();
  res.json({ message: "Quote removed" });
};
