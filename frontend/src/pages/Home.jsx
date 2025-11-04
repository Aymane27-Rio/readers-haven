import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [quote, setQuote] = useState("");
  const navigate = useNavigate();

  const quotes = [
    "A reader lives a thousand lives before he dies. — George R.R. Martin",
    "So many books, so little time. — Frank Zappa",
    "Once you learn to read, you will be forever free. — Frederick Douglass",
    "Reading is essential for those who seek to rise above the ordinary. — Jim Rohn",
  ];

  const categories = [
    { name: "Fiction", icon: "📖", genre: "Fiction" },
    { name: "Science", icon: "🔬", genre: "Science" },
    { name: "History", icon: "🏺", genre: "History" },
    { name: "Philosophy", icon: "💭", genre: "Philosophy" },
    { name: "Fantasy", icon: "🐉", genre: "Fantasy" },
  ];

  useEffect(() => {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(random);
  }, []);

  const token = localStorage.getItem("token");

  return (
    <>
      <Navbar />
      <main
        className="fade-in-page"
        style={{
          minHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "2rem",
          background: "linear-gradient(to bottom, #f0fdf4, #ffffff)",
        }}
      >
        <h1 style={{ color: "#065f46", fontSize: "2.5rem", fontWeight: "bold" }}>
          Welcome to <span style={{ color: "#8b1a1a" }}>Readers Haven</span>
        </h1>

        <p style={{ maxWidth: "600px", marginTop: "1rem", fontSize: "1.1rem", color: "#374151" }}>
          A cozy digital space for book lovers — manage your library, track your reads,
          and rediscover the joy of stories.
        </p>

        <div
          className="quote-card"
          style={{
            marginTop: "2rem",
            background: "white",
            color: "#065f46",
            fontSize: "1.1rem",
            fontStyle: "italic",
            borderRadius: "10px",
            padding: "1rem 1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "600px",
          }}
        >
          {quote}
        </div>

        {/* ==== Categories Section ==== */}
        <section style={{ marginTop: "3rem", maxWidth: "700px", width: "100%" }}>
          <h2 style={{ color: "#065f46", marginBottom: "1rem" }}>Explore by Category</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "1rem",
              justifyItems: "center",
            }}
          >
            {categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => navigate(`/genre/${cat.genre}`)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1fae5",
                  borderRadius: "12px",
                  padding: "1rem",
                  cursor: "pointer",
                  width: "120px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div style={{ fontSize: "2rem" }}>{cat.icon}</div>
                <p style={{ color: "#065f46", fontWeight: "500" }}>{cat.name}</p>
              </div>
            ))}
          </div>
        </section>

        {token ? (
          <a
            href="/books"
            style={{
              marginTop: "2rem",
              textDecoration: "none",
              background: "#065f46",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#064e3b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#065f46")}
          >
            Go to My Books
          </a>
        ) : (
          <a
            href="/login"
            style={{
              marginTop: "2rem",
              textDecoration: "none",
              background: "#8b1a1a",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#a32222")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#8b1a1a")}
          >
            Start Reading
          </a>
        )}
      </main>
      <Footer />
    </>
  );
}