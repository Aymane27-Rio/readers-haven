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
      <main className="page-container pattern-bg fade-in">
        <section className="section hero wrap">
          <h1 className="brand-title brand-title--xl" style={{ textAlign: "center" }}>
            Welcome to <span style={{ color: "#8b1a1a" }}>Readers Haven</span>
          </h1>
          <p className="tagline" style={{ textAlign: "center" }}>
            A cozy digital space for book lovers — manage your library, track your reads,
            and rediscover the joy of stories.
          </p>

          <div className="vintage-card vintage-card--padded wrap fade-in-slow" style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontStyle: "italic" }}>{quote}</p>
          </div>

          <section className="wrap" style={{ marginTop: "2rem" }}>
            <h2 className="brand-title brand-title--lg" style={{ textAlign: "center" }}>Explore by Category</h2>
            <div className="grid grid--tiles" style={{ marginTop: "1rem" }}>
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="tile"
                  onClick={() => navigate(`/genre/${cat.genre}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/genre/${cat.genre}`)}
                >
                  <div className="tile__icon">{cat.icon}</div>
                  <p className="brand-title" style={{ fontSize: "1rem" }}>{cat.name}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="centered" style={{ marginTop: "1.5rem" }}>
            {token ? (
              <a className="vintage-button" href="/books">Go to My Books</a>
            ) : (
              <a className="vintage-button" href="/login">Start Reading</a>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}