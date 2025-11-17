import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchJson } from "../services/unwrap.js";
import Navbar from "../components/Navbar.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { genreData } from "../data/genres.js";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { useToast } from "../components/ToastProvider.jsx";
import { API_BASE } from "../services/apiBase.js";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "to-read", label: "To Read" },
  { value: "currently-reading", label: "Currently Reading" },
  { value: "read", label: "Finished" },
];

const statusBadge = {
  "to-read": { label: "To Read", color: "#2563eb" },
  "currently-reading": { label: "Reading", color: "#f59e0b" },
  read: { label: "Finished", color: "#16a34a" },
};

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const { notify } = useToast();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const API_URL = `${API_BASE}/books`;

  const fetchBooks = useCallback(async () => {
    if (!token) {
      setBooks([]);
      setError("Please log in to view your books.");
      return;
    }
    try {
      setLoading(true);
      const data = await fetchJson(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setBooks(data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load books");
      notify("Failed to load books", "error");
      setLoading(false);
    }
  }, [API_URL, notify, token]);

  const addBook = async (e) => {
    e.preventDefault();
    if (!title || !author) {
      notify("Please fill all fields", "error");
      return;
    }
    if (!token) {
      notify("Please log in to add books", "error");
      return;
    }

    try {
      const newBook = await fetchJson(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, author, description })
      });
      setBooks((prev) => [...prev, newBook]);
      setTitle("");
      setAuthor("");
      setDescription("");
      setError("");
      notify("Book added");
      // Refresh from server to capture defaults like status timestamps
      fetchBooks().catch(() => {});
    } catch (err) {
      console.error(err);
      notify("Failed to add book", "error");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const updated = await fetchJson(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      setBooks((prev) => prev.map((book) => (book._id === id ? updated : book)));
      notify(`Marked as ${statusBadge[newStatus]?.label ?? newStatus}`);
    } catch (err) {
      console.error(err);
      notify("Failed to update book", "error");
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
  }, [fetchBooks]);

  // derive query param q for client-side filtering
  const q = useMemo(() => new URLSearchParams(location.search).get("q")?.trim().toLowerCase() || "", [location.search]);
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch = !q || [b.title, b.author, b.description].some((v) => String(v || "").toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || (b.status || "to-read") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, q, statusFilter]);

  const totals = useMemo(() => {
    const base = { total: books.length, toRead: 0, reading: 0, read: 0 };
    books.forEach((b) => {
      const status = (b.status || "to-read").toLowerCase();
      if (status === "to-read") base.toRead += 1;
      else if (status === "currently-reading") base.reading += 1;
      else if (status === "read") base.read += 1;
    });
    return base;
  }, [books]);

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

  if (!token) {
    return (
      <>
        <Navbar />
        <section className="section wrap" style={{ textAlign: "center", color: "#b91c1c" }}>
          Please log in to manage your books.
        </section>
      </>
    );
  }

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

            {!showGenresFirst && (
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '.75rem', marginBottom: '1.25rem' }}>
                <div className="vintage-card" style={{ padding: '.75rem' }}>
                  <p className="tagline" style={{ marginBottom: '.35rem' }}>Total Books</p>
                  <p className="brand-title" style={{ fontSize: '1.6rem' }}>{totals.total}</p>
                </div>
                <div className="vintage-card" style={{ padding: '.75rem' }}>
                  <p className="tagline" style={{ marginBottom: '.35rem' }}>To Read</p>
                  <p className="brand-title" style={{ fontSize: '1.6rem', color: '#2563eb' }}>{totals.toRead}</p>
                </div>
                <div className="vintage-card" style={{ padding: '.75rem' }}>
                  <p className="tagline" style={{ marginBottom: '.35rem' }}>Reading</p>
                  <p className="brand-title" style={{ fontSize: '1.6rem', color: '#f59e0b' }}>{totals.reading}</p>
                </div>
                <div className="vintage-card" style={{ padding: '.75rem' }}>
                  <p className="tagline" style={{ marginBottom: '.35rem' }}>Finished</p>
                  <p className="brand-title" style={{ fontSize: '1.6rem', color: '#16a34a' }}>{totals.read}</p>
                </div>
              </div>
            )}

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
                <input
                  type="text"
                  placeholder="Short note or description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                />
                <button type="submit" className="vintage-button">Add</button>
              </div>
            </form>

            {!showGenresFirst && (
              <div className="form-row" style={{ marginBottom: "1rem", justifyContent: 'space-between', alignItems: 'center', gap: '.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <label htmlFor="status-filter" className="tagline" style={{ fontWeight: 600 }}>Filter by status:</label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input"
                    style={{ width: '200px' }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="vintage-button vintage-button--ghost"
                  onClick={fetchBooks}
                >
                  Refresh
                </button>
              </div>
            )}

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
                  <li key={book._id} className="vintage-card" style={{ display: "grid", gap: '.35rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem' }}>
                      <div>
                        <span className="brand-title" style={{ fontSize: "1.05rem" }}>{book.title}</span>
                        <span className="tagline" style={{ marginLeft: ".35rem" }}>by {book.author}</span>
                      </div>
                      <span
                        className="badge"
                        style={{ background: statusBadge[book.status || 'to-read']?.color || '#475569', color: '#fff' }}
                      >
                        {statusBadge[book.status || 'to-read']?.label ?? 'To Read'}
                      </span>
                    </div>

                    {book.description && (
                      <p className="tagline" style={{ color: '#475569' }}>{book.description}</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', flexWrap: 'wrap' }}>
                      {STATUS_OPTIONS.filter((opt) => opt.value !== 'all' && opt.value !== (book.status || 'to-read')).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className="vintage-button vintage-button--ghost"
                          style={{ fontSize: '.85rem' }}
                          onClick={() => updateStatus(book._id, opt.value)}
                        >
                          Mark {opt.label}
                        </button>
                      ))}
                      <button onClick={() => deleteBook(book._id)} className="vintage-button vintage-button--danger" style={{ fontSize: ".85rem" }}>
                        Delete
                      </button>
                    </div>
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