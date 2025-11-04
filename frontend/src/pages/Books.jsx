import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/books";

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load books");
      setLoading(false);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return alert("Please fill all fields");

    try {
      const res = await axios.post(
        API_URL,
        { title, author },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks([...books, res.data]);
      setTitle("");
      setAuthor("");
    } catch (err) {
      console.error(err);
      alert("Failed to add book");
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((book) => book._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete book");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-emerald-100 to-emerald-50">
        <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-xl border border-emerald-200">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-emerald-700">
            📚 My Book Collection
          </h1>

          <form
            onSubmit={addBook}
            className="flex flex-col sm:flex-row gap-3 mb-8 justify-center"
          >
            <input
              type="text"
              placeholder="Book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-emerald-300 p-3 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="border border-emerald-300 p-3 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white py-3 px-6 rounded-md hover:bg-emerald-700 transition"
            >
              Add
            </button>
          </form>

          {books.length === 0 ? (
            <p className="text-center text-gray-500">No books yet.</p>
          ) : (
            <ul className="space-y-3">
              {books.map((book) => (
                <li
                  key={book._id}
                  className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-lg p-3 shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <span className="font-semibold text-emerald-800">
                      {book.title}
                    </span>{" "}
                    <span className="text-gray-600">by {book.author}</span>
                  </div>
                  <button
                    onClick={() => deleteBook(book._id)}
                    className="text-crimson-500 hover:text-crimson-600 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default Books;