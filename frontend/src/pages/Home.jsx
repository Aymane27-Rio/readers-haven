import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate, Link } from "react-router-dom";
import { t } from "../i18n.js";
import { GiSpellBook, GiTestTubes, GiGreekTemple, GiThink, GiDragonSpiral } from "react-icons/gi";

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
    { name: "Fiction", Icon: GiSpellBook, genre: "Fiction" },
    { name: "Science", Icon: GiTestTubes, genre: "Science" },
    { name: "History", Icon: GiGreekTemple, genre: "History" },
    { name: "Philosophy", Icon: GiThink, genre: "Philosophy" },
    { name: "Fantasy", Icon: GiDragonSpiral, genre: "Fantasy" },
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
            {t('home.welcome')} <span style={{ color: "#8b1a1a" }}>Readers Haven</span>
          </h1>
          <p className="tagline" style={{ textAlign: "center" }}>
            A cozy digital space for book lovers — manage your library, track your reads,
            and rediscover the joy of stories.
          </p>

          <div className="vintage-card vintage-card--padded wrap fade-in-slow" style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontStyle: "italic" }}>{quote}</p>
          </div>

          <section className="wrap" style={{ marginTop: "2rem" }}>
            <h2 className="brand-title brand-title--lg" style={{ textAlign: "center" }}>{t('home.explore')}</h2>
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
                  <div className="tile__icon" aria-hidden="true">
                    <cat.Icon size={36} />
                  </div>
                  <p className="brand-title" style={{ fontSize: "1rem" }}>{cat.name}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="centered" style={{ marginTop: "1.5rem" }}>
            {token ? (
              <Link className="vintage-button" to="/books">{t('home.cta_books')}</Link>
            ) : (
              <Link className="vintage-button" to="/login">{t('home.cta_start')}</Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}