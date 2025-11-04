import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import { genreData } from "../data/genres.js";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

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

  // derive query param q for client-side filtering
  const q = useMemo(() => new URLSearchParams(location.search).get("q")?.trim().toLowerCase() || "", [location.search]);
  const filteredBooks = useMemo(() => {
    if (!q) return books;
    return books.filter((b) =>
      [b.title, b.author].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [books, q]);

  // compute genre matches across all genreData entries when querying
  const genreMatches = useMemo(() => {
    if (!q) return [];
    const results = [];
    Object.entries(genreData).forEach(([genre, items]) => {
      items.forEach((item) => {
        const hay = `${item.title} ${item.author} ${genre}`.toLowerCase();
        if (hay.includes(q)) results.push({ ...item, genre });
      });
    });
    return results;
  }, [q]);

  const showGenresFirst = q && genreMatches.length > 0;
  const displayCount = showGenresFirst ? genreMatches.length : filteredBooks.length;

  if (error) return <p className="section wrap" style={{ textAlign: "center", color: "#b91c1c" }}>{error}</p>;

  return (
    <>
      <Navbar />
      <main className="page-container pattern-bg section centered">
        <div className="wrap">
          <div className="vintage-card vintage-card--padded">
            <h1 className="brand-title brand-title--lg" style={{ textAlign: "center", marginBottom: "1rem" }}>
              {showGenresFirst ? '📚 Catalog Results' : '📚 My Book Collection'}
              {q && (
                <span className="badge" title="Results count">
                  {displayCount}
                </span>
              )}
            </h1>

            <form onSubmit={addBook} className="form" style={{ marginBottom: "1rem" }}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Book title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="input"
                />
                <button type="submit" className="vintage-button">Add</button>
              </div>
            </form>

            {loading ? (
              <ul className="grid grid--cards" style={{ marginTop: ".6rem" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="vintage-card" style={{ padding: "1rem" }}>
                    <div className="skeleton-line lg" style={{ width: "60%", marginBottom: ".6rem" }}></div>
                    <div className="skeleton-line" style={{ width: "40%" }}></div>
                  </li>
                ))}
              </ul>
            ) : showGenresFirst ? (
              <ul className="grid grid--cards" style={{ marginTop: ".6rem" }}>
                {genreMatches.map((g, idx) => (
                  <li key={`${g.title}-${idx}`} className="vintage-card" style={{ padding: "1rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="brand-title" style={{ fontSize: "1.05rem" }}>{g.title}</span>
                      <span className="tagline" style={{ marginLeft: ".35rem" }}>by {g.author}</span>
                    </div>
                    <span className="tagline">{g.genre}</span>
                  </li>
                ))}
              </ul>
            ) : filteredBooks.length > 0 ? (
              <ul className="grid grid--cards" style={{ marginTop: ".6rem" }}>
                {filteredBooks.map((book) => (
                  <li key={book._id} className="vintage-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="brand-title" style={{ fontSize: "1.05rem" }}>{book.title}</span>
                      <span className="tagline" style={{ marginLeft: ".35rem" }}>by {book.author}</span>
                    </div>
                    <button onClick={() => deleteBook(book._id)} className="vintage-button vintage-button--ghost" style={{ fontSize: ".9rem" }}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : q ? (
              <p className="form-meta">No results for “{q}”.</p>
            ) : (
              <p className="form-meta">No books yet.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default Books;