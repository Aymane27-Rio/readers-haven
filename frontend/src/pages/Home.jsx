import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate, Link } from "react-router-dom";
import { t } from "../i18n.js";
import {
  GiSpellBook,
  GiTestTubes,
  GiGreekTemple,
  GiThink,
  GiDragonSpiral,
  GiFlameSpin,
} from "react-icons/gi";
import { FiRefreshCw } from "react-icons/fi";

const quotes = [
  "A reader lives a thousand lives before he dies. — George R.R. Martin",
  "So many books, so little time. — Frank Zappa",
  "Once you learn to read, you will be forever free. — Frederick Douglass",
  "Reading is essential for those who seek to rise above the ordinary. — Jim Rohn",
];

const categories = [
  { name: "Fiction", description: "Stories that linger long after the last page.", Icon: GiSpellBook, genre: "Fiction" },
  { name: "Science", description: "Curated titles to fuel curiosity.", Icon: GiTestTubes, genre: "Science" },
  { name: "History", description: "Trace the paths that shaped our world.", Icon: GiGreekTemple, genre: "History" },
  { name: "Philosophy", description: "Ideas that challenge the everyday.", Icon: GiThink, genre: "Philosophy" },
  { name: "Fantasy", description: "Gateways to spellbinding new realms.", Icon: GiDragonSpiral, genre: "Fantasy" },
];

const highlights = [
  { title: "Daily streaks", detail: "Keep your reading habit glowing.", Icon: GiFlameSpin },
  { title: "Curated clubs", detail: "Join intimate circles for every genre.", Icon: GiGreekTemple },
  { title: "Community prompts", detail: "Share thoughts and discover voices.", Icon: GiSpellBook },
];

export default function Home() {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [isQuoteAnimating, setIsQuoteAnimating] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const quote = quotes[quoteIndex];

  useEffect(() => {
    if (!isQuoteAnimating) return undefined;
    const timer = setTimeout(() => setIsQuoteAnimating(false), 450);
    return () => clearTimeout(timer);
  }, [isQuoteAnimating]);

  const shuffleQuote = () => {
    if (quotes.length <= 1) return;
    let next = quoteIndex;
    while (next === quoteIndex) {
      next = Math.floor(Math.random() * quotes.length);
    }
    setIsQuoteAnimating(true);
    setQuoteIndex(next);
  };

  return (
    <>
      <Navbar />
      <main className="page-container pattern-bg fade-in">
        <section className="hero wrap" style={{ display: "grid", gap: "2.25rem" }}>
          <header style={{ display: "grid", gap: "1.05rem" }}>
            <p className="form-meta" style={{ textTransform: "uppercase", letterSpacing: "0.24em", color: "#b87333" }}>{t('home.tagline')}</p>
            <h1 className="brand-title brand-title--xl" style={{ textAlign: "center", lineHeight: 1.15 }}>
              {t('home.welcome')} <span style={{ color: "#8b1a1a" }}>Readers Haven</span>
            </h1>
            <p className="tagline" style={{ textAlign: "center", maxWidth: 720, marginInline: "auto", fontSize: "1.05rem", lineHeight: 1.65 }}>
              A cozy digital space for book lovers — track your reads, curate beautiful shelves, and rediscover the magic of stories in community.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: ".65rem", flexWrap: "wrap" }}>
              <Link className="vintage-button" to={token ? "/books" : "/login"}>
                {token ? t('home.cta_books') : t('home.cta_start')}
              </Link>
              {!token && (
                <Link className="vintage-button vintage-button--ghost" to="/signup">
                  {t('home.cta_join')}
                </Link>
              )}
            </div>
          </header>

          <figure className={`vintage-card quote-card fade-in-slow${isQuoteAnimating ? " is-animating" : ""}`}>
            <blockquote>
              {quote}
            </blockquote>
            <div className="quote-card__footer">
              <figcaption>{t('home.quote_caption')}</figcaption>
              <button type="button" className="quote-card__shuffle" onClick={shuffleQuote} aria-label={t('home.quote_shuffle')}>
                <FiRefreshCw size={18} />
                <span>{t('home.quote_shuffle')}</span>
              </button>
            </div>
          </figure>

          <section style={{ display: "grid", gap: "1.75rem" }}>
            <header style={{ textAlign: "center", display: "grid", gap: ".4rem" }}>
              <h2 className="brand-title brand-title--lg">{t('home.explore')}</h2>
              <p className="form-meta" style={{ maxWidth: 620, marginInline: "auto" }}>
                Browse shelves crafted for curious minds. Tap any collection to see handpicked titles.
              </p>
            </header>
            <div className="grid grid--tiles" style={{ gap: "1.2rem" }}>
              {categories.map((cat) => (
                <article
                  key={cat.name}
                  className="tile"
                  onClick={() => navigate(`/genre/${cat.genre}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/genre/${cat.genre}`)}
                  style={{ display: "grid", gap: ".6rem", padding: "1.2rem" }}
                >
                  <div className="tile__icon" aria-hidden="true">
                    <cat.Icon size={40} />
                  </div>
                  <div style={{ display: "grid", gap: ".3rem" }}>
                    <h3 className="brand-title" style={{ fontSize: "1.05rem" }}>{cat.name}</h3>
                    <p className="form-meta" style={{ fontSize: ".95rem", lineHeight: 1.5 }}>{cat.description}</p>
                  </div>
                  <span className="form-meta" style={{ marginTop: "auto", fontWeight: 600, color: "#b87333" }}>
                    {t('home.explore_cta')}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className="home-highlights" style={{ display: "grid", gap: "1.4rem" }}>
            <header style={{ textAlign: "center" }}>
              <h2 className="brand-title brand-title--lg">{t('home.highlights_title')}</h2>
            </header>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.1rem" }}>
              {highlights.map((item) => (
                <article key={item.title} className="vintage-card" style={{ display: "grid", gap: ".55rem", padding: "1.25rem" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", background: "rgba(184,115,51,0.14)", color: "#8b1a1a" }}>
                    <item.Icon size={24} />
                  </div>
                  <h3 className="brand-title" style={{ fontSize: "1.08rem" }}>{item.title}</h3>
                  <p className="form-meta" style={{ lineHeight: 1.55 }}>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}