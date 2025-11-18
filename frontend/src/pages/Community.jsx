import React from "react";
import Navbar from "../components/Navbar.jsx";
import { genreData } from "../data/genres.js";
import { API_ORIGIN } from "../services/apiBase.js";

const initialPosts = [
  {
    id: "p1",
    title: "What Moroccan classic should I read next?",
    author: "Amina",
    authorRole: "Literary Explorer",
    time: "2h",
    body: "I'm in a little reading slump and want to dive into another Moroccan classic that captures our cities' soul. Which book gave you that goosebumps feeling recently?",
    tags: ["Moroccan", "Classics", "Vintage"],
    likes: 12,
    comments: 4,
    replies: [
      { user: "Mehdi", text: "Try \"The Sand Child\"! It stays with you for days." },
      { user: "Salma", text: "Seconding that! Also check out \"Leaving Tangier\"." },
    ],
    category: "Recommendations",
  },
  {
    id: "p2",
    title: "Best cafés to read in Rabat?",
    author: "Youssef",
    authorRole: "Community Guide",
    time: "5h",
    body: "I'm planning a Saturday reading marathon. Drop your coziest café spots with great light and calm playlists! Bonus points if they serve msemen.",
    tags: ["Rabat", "Cafés", "Atmosphere"],
    likes: 7,
    comments: 3,
    replies: [{ user: "Nadia", text: "La Maison Bleue has a sunlit upstairs corner that's perfect." }],
    category: "Local Spots",
  },
  {
    id: "p3",
    title: "Weekly prompt: Share a quote that changed your mindset",
    author: "Readers Haven Team",
    authorRole: "Moderator",
    time: "1d",
    body: "What's one line from a book that still echoes in your mind? Drop it below so we can add it to the community quote wall!",
    tags: ["Prompts", "Quotes"],
    likes: 19,
    comments: 11,
    replies: [],
    category: "Prompts",
  },
];

const pollOptions = [
  { id: "opt1", label: "Graphic novel spotlight" },
  { id: "opt2", label: "North African histories" },
  { id: "opt3", label: "Poetry in translation" },
];

const communitySpaces = [
  { id: "club1", name: "Casablanca Night Readers", members: 218, meeting: "Wed • 8pm" },
  { id: "club2", name: "Fantasy in Darija", members: 142, meeting: "Sat • 6pm" },
  { id: "club3", name: "Morning Poetry Circle", members: 96, meeting: "Daily • 7am" },
];

const contributorHighlights = [
  { name: "Nadia", role: "Top Reviewer", contributions: 18 },
  { name: "Hamza", role: "Genre Curator", contributions: 15 },
  { name: "Siham", role: "Challenge Captain", contributions: 12 },
];

const upcomingSessions = [
  { id: "event1", title: "Tea & Tolstoy", date: "Fri 22 Nov", progress: 68 },
  { id: "event2", title: "Mini Memoir Sprint", date: "Sun 24 Nov", progress: 44 },
];

export default function Community() {
  const token = React.useMemo(() => localStorage.getItem("token"), []);

  const [posts, setPosts] = React.useState(initialPosts);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [error, setError] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("trending");
  const [search, setSearch] = React.useState("");
  const [pollVote, setPollVote] = React.useState(null);
  const [goingEvents, setGoingEvents] = React.useState(() => new Set());
  const [quotes, setQuotes] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_ORIGIN}/quotes`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setQuotes(data.slice(0, 5));
        }
      } catch (_) { }
    })();
  }, [token]);

  const topGenres = React.useMemo(() => {
    const entries = Object.entries(genreData).map(([g, items]) => ({ genre: g, count: items.length }));
    return entries.sort((a, b) => b.count - a.count).slice(0, 8);
  }, []);

  const filteredPosts = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts
      .filter((post) => {
        if (!term) return true;
        return [post.title, post.body, ...(post.tags || [])]
          .some((value) => value.toLowerCase().includes(term));
      })
      .filter((post) => {
        if (activeFilter === "trending") return post.likes >= 7 || post.comments >= 3;
        if (activeFilter === "new") return post.time.includes("now") || post.time.includes("h");
        if (activeFilter === "prompts") return post.category === "Prompts";
        return true;
      });
  }, [posts, search, activeFilter]);

  const onPublish = (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) { setError("Please provide a title and a story"); return; }

    const me = (localStorage.getItem("name") || "You").split(" ")[0];
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const newPost = {
      id: `p_${Date.now()}`,
      title: title.trim(),
      author: me,
      authorRole: "Community Member",
      time: "now",
      body: body.trim(),
      tags: tagList,
      likes: 0,
      comments: 0,
      replies: [],
      category: tagList[0] || "General",
    };
    setPosts((prev) => [newPost, ...prev]);
    setTitle("");
    setBody("");
    setTags("");
  };

  const toggleLike = (id) => {
    setPosts((prev) => prev.map((post) => (post.id === id
      ? { ...post, likes: post.likes + 1 }
      : post)));
  };

  const markGoing = (eventId) => {
    setGoingEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const handleVote = (optionId) => {
    setPollVote(optionId);
  };

  return (
    <>
      <Navbar />
      <main className="page-container pattern-bg section centered" style={{ marginTop: "1cm" }}>
        <div className="wrap">
          <section className="vintage-card vintage-card--padded" style={{ marginBottom: "1.25rem", background: "linear-gradient(135deg, rgba(184,115,51,0.12), rgba(30,41,59,0.06))" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
              <div>
                <p className="form-meta" style={{ fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b87333" }}>Community Hub</p>
                <h1 className="brand-title brand-title--lg" style={{ marginBottom: ".25rem" }}>Readers Haven Community</h1>
                <p className="tagline" style={{ maxWidth: 640 }}>
                  Swap recommendations, join pop-up reading sprints, and celebrate stories with book lovers across Morocco and beyond.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
                <div className="vintage-card" style={{ padding: ".6rem .9rem", minWidth: 140 }}>
                  <p className="form-meta" style={{ marginBottom: ".25rem" }}>Active this week</p>
                  <p className="brand-title" style={{ fontSize: "1.4rem" }}>326 readers</p>
                </div>
                <div className="vintage-card" style={{ padding: ".6rem .9rem", minWidth: 140 }}>
                  <p className="form-meta" style={{ marginBottom: ".25rem" }}>Clubs running</p>
                  <p className="brand-title" style={{ fontSize: "1.4rem" }}>12 sessions</p>
                </div>
                <div className="vintage-card" style={{ padding: ".6rem .9rem", minWidth: 140 }}>
                  <p className="form-meta" style={{ marginBottom: ".25rem" }}>Daily prompts</p>
                  <p className="brand-title" style={{ fontSize: "1.4rem" }}>3 fresh ideas</p>
                </div>
              </div>
            </div>
          </section>

          <style>{`@media(min-width: 960px){ .community-grid{ display:grid; grid-template-columns: 2fr 1fr; gap:1.25rem; } }`}</style>
          <div className="community-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
            <section style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="vintage-card vintage-card--padded" style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
                <header style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 className="brand-title" style={{ fontSize: "1.15rem", marginBottom: ".25rem" }}>Share something with the community</h2>
                    <p className="form-meta">Tell us what you're reading, planning, or organizing. Your voice sets the tone!</p>
                  </div>
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                    {[
                      { id: "trending", label: "Trending" },
                      { id: "new", label: "New" },
                      { id: "prompts", label: "Prompts" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter.id)}
                        className={`vintage-button ${activeFilter === filter.id ? "" : "vintage-button--ghost"}`}
                        style={{ minWidth: 92 }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </header>

                <div className="vintage-card" style={{ padding: ".75rem", background: "rgba(15,23,42,0.02)" }}>
                  {token ? (
                    <form className="form" onSubmit={onPublish} style={{ display: "grid", gap: ".75rem" }}>
                      <div className="form-row" style={{ gap: ".75rem" }}>
                        <input className="input" placeholder="Catchy discussion title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <input className="input" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} style={{ maxWidth: 240 }} />
                      </div>
                      <textarea className="input" placeholder="What story, idea, or update would you like to share?" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
                      {error && <p className="form-meta" style={{ color: "#b91c1c" }}>{error}</p>}
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem" }}>
                        <div style={{ display: "flex", gap: ".45rem" }}>
                          <button type="button" className="vintage-button vintage-button--ghost">Add poll</button>
                          <button type="button" className="vintage-button vintage-button--ghost">Share reading list</button>
                        </div>
                        <button type="submit" className="vintage-button">Publish update</button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem" }}>
                      <p className="form-meta" style={{ margin: 0 }}>Sign in to post, react, and join clubs.</p>
                      <a className="vintage-button" href="/login">Sign in</a>
                    </div>
                  )}
                </div>

                <div className="vintage-card" style={{ padding: ".75rem", display: "grid", gap: ".75rem" }}>
                  <input
                    className="input"
                    placeholder="Search discussions, tags, or readers"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search community posts"
                  />
                  <ul className="grid" style={{ display: "grid", gap: ".85rem" }}>
                    {filteredPosts.length === 0 && (
                      <li className="vintage-card" style={{ padding: ".75rem" }}>
                        <p className="form-meta">No discussions match that search yet. Start a new one?</p>
                      </li>
                    )}
                    {filteredPosts.map((post) => (
                      <li key={post.id} className="vintage-card" style={{ padding: ".85rem", display: "grid", gap: ".7rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: ".75rem" }}>
                          <div>
                            <div className="brand-title" style={{ fontSize: "1.1rem" }}>{post.title}</div>
                            <div className="form-meta" style={{ marginTop: ".25rem" }}>
                              {post.author} • {post.authorRole} • {post.time}
                            </div>
                          </div>
                          <span className="badge" style={{ background: "rgba(184,115,51,0.12)", color: "#b87333" }}>{post.category}</span>
                        </div>
                        <p className="tagline" style={{ margin: 0 }}>{post.body}</p>
                        {post.tags?.length > 0 && (
                          <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                            {post.tags.map((tag) => (
                              <button key={tag} type="button" className="badge" onClick={() => setSearch(tag)}>{tag}</button>
                            ))}
                          </div>
                        )}
                        {post.replies?.length > 0 && (
                          <div className="vintage-card" style={{ padding: ".6rem", background: "rgba(15,23,42,0.02)", display: "grid", gap: ".45rem" }}>
                            <div className="form-meta" style={{ fontWeight: 600 }}>Community replies</div>
                            {post.replies.slice(0, 2).map((reply, index) => (
                              <div key={`${post.id}-reply-${index}`} className="form-meta" style={{ lineHeight: 1.5 }}>
                                <strong>{reply.user}:</strong> {reply.text}
                              </div>
                            ))}
                            {post.comments > post.replies.length && (
                              <button type="button" className="vintage-button vintage-button--ghost" style={{ alignSelf: "flex-start" }}>
                                View {post.comments} replies
                              </button>
                            )}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: ".65rem", flexWrap: "wrap" }}>
                          <button type="button" className="vintage-button vintage-button--ghost" onClick={() => toggleLike(post.id)}>
                            Appreciate ({post.likes})
                          </button>
                          <button type="button" className="vintage-button vintage-button--ghost">Comment ({post.comments})</button>
                          <button type="button" className="vintage-button vintage-button--ghost">Save for later</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="vintage-card vintage-card--padded" style={{ display: "grid", gap: ".75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="brand-title" style={{ fontSize: "1.1rem" }}>Join a community space</h3>
                    <span className="form-meta">Hand curated clubs, aligned with your bookshelf.</span>
                  </div>
                  <div style={{ display: "grid", gap: ".65rem" }}>
                    {communitySpaces.map((space) => (
                      <div key={space.id} className="vintage-card" style={{ padding: ".7rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                        <div>
                          <div className="brand-title" style={{ fontSize: "1.05rem" }}>{space.name}</div>
                          <div className="form-meta" style={{ marginTop: ".25rem" }}>{space.members} members • {space.meeting}</div>
                        </div>
                        <button type="button" className="vintage-button vintage-button--ghost">Request invite</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside style={{ display: "grid", gap: "1.1rem" }}>
              <section className="vintage-card vintage-card--padded" style={{ display: "grid", gap: ".75rem" }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="brand-title" style={{ fontSize: "1.05rem" }}>Weekly pulse poll</h3>
                  <span className="badge">Vote & learn</span>
                </header>
                <p className="tagline" style={{ margin: 0 }}>Which theme should headline next week's community showcase?</p>
                <div style={{ display: "grid", gap: ".45rem" }}>
                  {pollOptions.map((option) => {
                    const checked = pollVote === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleVote(option.id)}
                        className={`vintage-button ${checked ? "" : "vintage-button--ghost"}`}
                        style={{ justifyContent: "flex-start" }}
                      >
                        {checked ? "✓ " : ""}{option.label}
                      </button>
                    );
                  })}
                </div>
                {pollVote && <p className="form-meta" style={{ color: "#166534" }}>Thanks for voting! We will share results in Monday's digest.</p>}
              </section>

              <section className="vintage-card vintage-card--padded" style={{ display: "grid", gap: ".6rem" }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="brand-title" style={{ fontSize: "1.05rem" }}>Trending quotes</h3>
                  <span className="form-meta">Refreshed hourly</span>
                </header>
                {quotes.length === 0 ? (
                  <p className="form-meta">No quotes yet. Drop yours in the prompt!</p>
                ) : (
                  <ul className="grid" style={{ display: "grid", gap: ".6rem" }}>
                    {quotes.map((quote) => (
                      <li key={quote._id} className="vintage-card" style={{ padding: ".6rem", background: "rgba(15,23,42,0.02)" }}>
                        <div className="tagline">“{quote.text}”</div>
                        {quote.author && <div className="form-meta" style={{ marginTop: ".25rem" }}>— {quote.author}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="vintage-card vintage-card--padded" style={{ display: "grid", gap: ".6rem" }}>
                <h3 className="brand-title" style={{ fontSize: "1.05rem" }}>Top genres this month</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem" }}>
                  {topGenres.map((genre) => (
                    <span key={genre.genre} className="badge" title={`${genre.count} picks`}>{genre.genre}</span>
                  ))}
                </div>
              </section>

              <section className="vintage-card vintage-card--padded" style={{ display: "grid", gap: ".65rem" }}>
                <h3 className="brand-title" style={{ fontSize: "1.05rem" }}>Upcoming reading sessions</h3>
                {upcomingSessions.map((session) => {
                  const going = goingEvents.has(session.id);
                  return (
                    <div key={session.id} className="vintage-card" style={{ padding: ".65rem", display: "grid", gap: ".45rem" }}>
                      <div className="form-meta" style={{ fontWeight: 600 }}>{session.date}</div>
                      <div className="brand-title" style={{ fontSize: "1rem" }}>{session.title}</div>
                      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4 }}>
                        <div style={{ height: 6, width: `${session.progress}%`, background: "#b87333", borderRadius: 4 }} />
                      </div>
                      <button
                        type="button"
                        className={`vintage-button ${going ? "" : "vintage-button--ghost"}`}
                        onClick={() => markGoing(session.id)}
                      >
                        {going ? "Going ✓" : "Count me in"}
                      </button>
                    </div>
                  );
                })}
              </section>

              <section className="vintage-card vintage-card--padded" style={{ display: "grid", gap: ".6rem" }}>
                <h3 className="brand-title" style={{ fontSize: "1.05rem" }}>Community leaders</h3>
                <div style={{ display: "grid", gap: ".5rem" }}>
                  {contributorHighlights.map((leader) => (
                    <div key={leader.name} className="vintage-card" style={{ padding: ".6rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="brand-title" style={{ fontSize: "1rem" }}>{leader.name}</div>
                        <div className="form-meta" style={{ marginTop: ".25rem" }}>{leader.role}</div>
                      </div>
                      <span className="badge">{leader.contributions} contributions</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="vintage-button vintage-button--ghost" style={{ justifySelf: "flex-start" }}>
                  See full leaderboard
                </button>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
