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

  // Fetch all books for this user
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

  // Add a new book
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

  // Delete a book
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
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">📚 My Books</h1>

      <form onSubmit={addBook} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          placeholder="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Add Book
        </button>
      </form>

      {books.length === 0 ? (
        <p className="text-center text-gray-500">No books yet.</p>
      ) : (
        <ul className="space-y-2">
          {books.map((book) => (
            <li
              key={book._id}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                <span className="font-semibold">{book.title}</span> by{" "}
                {book.author}
              </div>
              <button
                onClick={() => deleteBook(book._id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </>
);
}

export default Books;