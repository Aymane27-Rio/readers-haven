import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { fetchJson } from "../services/unwrap.js";
import Navbar from "../components/Navbar.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { genreData } from "../data/genres.js";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { API_BASE } from "../services/apiBase.js";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const { notify } = useToast();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const API_URL = `${API_BASE}/books`;

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchJson(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setBooks(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load books");
      notify("Failed to load books", "error");
      setLoading(false);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) {
      notify("Please fill all fields", "error");
      return;
    }

    try {
      const newBook = await fetchJson(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, author })
      });
      setBooks([...books, newBook]);
      setTitle("");
      setAuthor("");
      notify("Book added");
    } catch (err) {
      console.error(err);
      notify("Failed to add book", "error");
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await fetchJson(`${API_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setBooks(books.filter((book) => book._id !== id));
      notify("Book deleted");
    } catch (err) {
      console.error(err);
      notify("Failed to delete book", "error");
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
      <Breadcrumbs />
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
              <LoadingSkeleton rows={6} variant="grid" />
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