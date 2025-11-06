import React from "react";
import Navbar from "../components/Navbar.jsx";
import { genreData } from "../data/genres.js";

export default function Community() {
  const token = React.useMemo(() => localStorage.getItem("token"), []);

  // Mock posts (MVP). Later, replace with API.
  const [posts, setPosts] = React.useState([
    { id: "p1", title: "What Moroccan classic should I read next?", author: "Amina", time: "2h", body: "Looking for recommendations in Moroccan literature with a vintage vibe.", tags: ["Moroccan", "Classics"], likes: 12, comments: 4 },
    { id: "p2", title: "Best cafes to read in Rabat?", author: "Youssef", time: "5h", body: "Share your favorite reading spots!", tags: ["Rabat", "Cafes"], likes: 7, comments: 3 },
  ]);

  // Composer (local only for now)
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [error, setError] = React.useState("");

  // Semi-dynamic sidebar: quotes (from API) + genres (from data)
  const [quotes, setQuotes] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/quotes", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setQuotes(data.slice(0, 5));
        }
      } catch (_) {}
    })();
  }, [token]);

  // Compute top genres from genreData (by number of items)
  const topGenres = React.useMemo(() => {
    const entries = Object.entries(genreData).map(([g, items]) => ({ genre: g, count: items.length }));
    return entries.sort((a, b) => b.count - a.count).slice(0, 6);
  }, []);

  const onPublish = (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) { setError("Please provide a title and body"); return; }
    const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
    const me = (localStorage.getItem("name") || "You").split(" ")[0];
    const newPost = {
      id: `p_${Date.now()}`,
      title: title.trim(),
      author: me,
      time: "now",
      body: body.trim(),
      tags: tagList,
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setTitle("");
    setBody("");
    setTags("");
  };

  return (
    <>
      <Navbar />
      <main className="page-container pattern-bg section centered" style={{ marginTop: '1cm' }}>
        <div className="wrap">
          <div className="vintage-card vintage-card--padded" style={{ marginBottom: '1rem' }}>
            <h1 className="brand-title brand-title--lg" style={{ textAlign: 'center', marginBottom: '.25rem' }}>Readers Haven Community</h1>
            <p className="tagline" style={{ textAlign: 'center' }}>Share reads, quotes, and discuss with fellow book lovers.</p>
          </div>

          <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {/* 2-col on larger screens */}
            <style>{`@media(min-width: 900px){ .community-grid{ grid-template-columns: 2fr 1fr; } }`}</style>
            <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {/* Feed column */}
              <div>
                {token ? (
                  <div className="vintage-card vintage-card--padded" style={{ marginBottom: '1rem' }}>
                    <div className="brand-title" style={{ fontSize: '1.05rem', marginBottom: '.35rem' }}>Start a discussion</div>
                    <form className="form" onSubmit={onPublish}>
                      <div className="form-row">
                        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                      </div>
                      <div className="form-row">
                        <textarea className="input" placeholder="What do you want to share?" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
                      </div>
                      <div className="form-row">
                        <input className="input" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                      </div>
                      {error && <p className="form-meta" style={{ color: '#b91c1c' }}>{error}</p>}
                      <button type="submit" className="vintage-button">Publish</button>
                    </form>
                  </div>
                ) : (
                  <div className="vintage-card vintage-card--padded" style={{ marginBottom: '1rem' }}>
                    <div className="tagline">Sign in to start a discussion.</div>
                  </div>
                )}

                <div className="vintage-card vintage-card--padded">
                  <div className="brand-title" style={{ fontSize: '1.05rem', marginBottom: '.35rem' }}>Latest Discussions</div>
                  {posts.length === 0 ? (
                    <p className="form-meta">No discussions yet.</p>
                  ) : (
                    <ul className="grid grid--cards" style={{ marginTop: '.5rem' }}>
                      {posts.map((p) => (
                        <li key={p.id} className="vintage-card" style={{ padding: '.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div className="brand-title" style={{ fontSize: '1.05rem' }}>{p.title}</div>
                            <div className="form-meta">{p.time}</div>
                          </div>
                          <div className="form-meta" style={{ marginTop: '.15rem' }}>by {p.author}</div>
                          <p className="tagline" style={{ marginTop: '.35rem' }}>{p.body}</p>
                          {p.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.35rem' }}>
                              {p.tags.map((t) => (
                                <span key={t} className="badge">{t}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '.6rem', marginTop: '.5rem' }}>
                            <button className="vintage-button vintage-button--ghost" type="button">Like ({p.likes})</button>
                            <button className="vintage-button vintage-button--ghost" type="button">Comment ({p.comments})</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="vintage-card vintage-card--padded" style={{ height: 'fit-content' }}>
                <div className="brand-title" style={{ fontSize: '1.05rem', marginBottom: '.35rem' }}>Trending Quotes</div>
                {quotes.length === 0 ? (
                  <p className="form-meta">No quotes yet.</p>
                ) : (
                  <ul className="grid grid--cards">
                    {quotes.map((q) => (
                      <li key={q._id} className="vintage-card" style={{ padding: '.6rem' }}>
                        <div className="tagline">“{q.text}”</div>
                        {q.author && <div className="form-meta" style={{ marginTop: '.25rem' }}>— {q.author}</div>}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="brand-title" style={{ fontSize: '1.05rem', margin: '.75rem 0 .35rem' }}>Top Genres</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {topGenres.map(g => (
                    <span key={g.genre} className="badge" title={`${g.count} books`}>{g.genre}</span>
                  ))}
                </div>

                <div className="brand-title" style={{ fontSize: '1.05rem', margin: '.75rem 0 .35rem' }}>Reading Challenge</div>
                <div className="vintage-card" style={{ padding: '.6rem' }}>
                  <div className="form-meta">30-day streak</div>
                  <div style={{ height: 6, background: '#eee', marginTop: 6, borderRadius: 4 }}>
                    <div style={{ height: 6, width: '40%', background: '#b87333', borderRadius: 4 }} />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
