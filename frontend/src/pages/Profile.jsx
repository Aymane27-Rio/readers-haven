import React from "react";
import Navbar from "../components/Navbar.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { API_BASE, API_ORIGIN, UPLOADS_BASE } from "../services/apiBase.js";
import { fetchJson } from "../services/unwrap.js";
import { useToast } from "../components/ToastProvider.jsx";

export default function Profile() {
  const token = React.useMemo(() => localStorage.getItem("token") || sessionStorage.getItem("token"), []);
  const { notify } = useToast();
  const storedName = React.useMemo(() => {
    try {
      return localStorage.getItem("name") || sessionStorage.getItem("name") || "";
    } catch (_) {
      return "";
    }
  }, []);

  const [name, setName] = React.useState(storedName);
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const dropRef = React.useRef(null);
  const [mode, setMode] = React.useState("view"); // 'view' | 'edit'
  const [shelves, setShelves] = React.useState({ toRead: 0, currentlyReading: 0, read: 0 });
  const [books, setBooks] = React.useState([]);
  const [selectedShelf, setSelectedShelf] = React.useState(""); // '', 'to-read', 'currently-reading', 'read'
  const [quotes, setQuotes] = React.useState([]);
  const [quoteText, setQuoteText] = React.useState("");
  const [quoteAuthor, setQuoteAuthor] = React.useState("");
  // Settings (local only for now)
  const [theme, setTheme] = React.useState('system'); // 'system' | 'light' | 'dark'
  const [emailUpdates, setEmailUpdates] = React.useState(true);
  const [showShelvesPublic, setShowShelvesPublic] = React.useState(true);

  const displayName = name?.trim() || storedName?.trim() || "Reader";
  const first = displayName.split(" ")[0] || displayName;

  const getPayload = (d) => (d && typeof d === 'object' && 'status' in d && 'data' in d ? d.data : d);

  // Load current profile
  React.useEffect(() => {
    (async () => {
      try {
        const data = await fetchJson(`${API_ORIGIN}/profile`, { headers: { Authorization: `Bearer ${token}` } });
        setName(data.name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
        if (data.avatarUrl) {
          const url = data.avatarUrl.startsWith('/uploads') ? `${UPLOADS_BASE}${data.avatarUrl}` : data.avatarUrl;
          setAvatarUrl(url);
          localStorage.setItem("avatarUrl", url);
        }
        if (data.name) { localStorage.setItem("name", data.name); try { window.dispatchEvent(new Event('auth:name')); } catch (_) { } }
        // decide initial mode: if user has basic info, show view
        setMode((data.name || data.username || data.bio || data.location) ? 'view' : 'edit');

      } catch (_) { }
    })();
  }, [token]);

  // Load settings from localStorage
  React.useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('settings') || '{}');
      if (s.theme) setTheme(s.theme);
      if (typeof s.emailUpdates === 'boolean') setEmailUpdates(s.emailUpdates);
      if (typeof s.showShelvesPublic === 'boolean') setShowShelvesPublic(s.showShelvesPublic);
    } catch (_) { }
  }, []);

  const saveSettings = () => {
    const s = { theme, emailUpdates, showShelvesPublic };
    try { localStorage.setItem('settings', JSON.stringify(s)); setStatus('Settings saved'); setTimeout(() => setStatus(''), 1200); } catch (_) { }
  };

  // Load user's quotes
  React.useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const data = await fetchJson(`${API_ORIGIN}/quotes`, { headers: { Authorization: `Bearer ${token}` } });
        setQuotes(data);
      } catch (_) { }
    })();
  }, [token]);

  const addQuote = async (e) => {
    e.preventDefault();
    setError("");
    if (!quoteText.trim()) { setError("Quote text is required"); return; }
    try {
      const q = await fetchJson(`${API_ORIGIN}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: quoteText, author: quoteAuthor })
      });
      setQuotes((prev) => [q, ...prev]);
      setQuoteText("");
      setQuoteAuthor("");
      setStatus("Quote added");
      setTimeout(() => setStatus(""), 1200);
      notify("Quote added");

    } catch (_) {
      setError("Network error while adding quote");
      notify("Failed to add quote", "error");
    }
  };

  const deleteQuote = async (id) => {
    setError("");
    try {
      await fetchJson(`${API_ORIGIN}/quotes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setQuotes((prev) => prev.filter((q) => q._id !== id));
      notify("Quote deleted");
    } catch (_) {
      setError("Network error while deleting quote");
      notify("Failed to delete quote", "error");
    }
  };

  // Load user's books and compute shelves counts
  React.useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const data = await fetchJson(`${API_ORIGIN}/books`, { headers: { Authorization: `Bearer ${token}` } });
        setBooks(data);
        const counts = { toRead: 0, currentlyReading: 0, read: 0 };
        data.forEach((b) => {
          const s = (b.status || "to-read").toLowerCase();
          if (s === "to-read") counts.toRead += 1;
          else if (s === "currently-reading") counts.currentlyReading += 1;
          else if (s === "read") counts.read += 1;
        });
        setShelves(counts);
      } catch (_) { }
    })();
  }, [token]);

  // Drag and drop for avatar
  React.useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onPrevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = async (e) => {
      onPrevent(e);
      if (!e.dataTransfer.files?.length) return;
      await handleFile(e.dataTransfer.files[0]);
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach(ev => el.addEventListener(ev, onPrevent));
    el.addEventListener("drop", onDrop);
    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach(ev => el.removeEventListener(ev, onPrevent));
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  const handleFile = async (file) => {
    setError("");
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG, WEBP allowed"); return; }
    if (file.size > 4 * 1024 * 1024) { setError("Image too large (max 4MB)"); return; }
    const form = new FormData();
    form.append("avatar", file);
    setUploading(true);
    try {
      const data = await fetchJson(`${API_ORIGIN}/profile/avatar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const url = data.avatarUrl?.startsWith('/uploads') ? `${UPLOADS_BASE}${data.avatarUrl}` : data.avatarUrl;
      setAvatarUrl(url);
      localStorage.setItem("avatarUrl", url);
      setStatus("Avatar updated");
      setTimeout(() => setStatus(""), 1500);
      notify("Avatar updated");
    } catch (e) {
      setError("Network error while uploading avatar");
      notify("Failed to upload avatar", "error");
    } finally {
      setUploading(false);
    }
  };

  const onPickFile = (e) => { const f = e.target.files?.[0]; if (f) handleFile(f); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await fetchJson(`${API_ORIGIN}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, username, bio, location })
      });
      if (data?.name) { localStorage.setItem("name", data.name); try { window.dispatchEvent(new Event('auth:name')); } catch (_) { } }
      setStatus("Profile saved");
      setTimeout(() => setStatus(""), 1500);
      setMode('view');
      notify("Profile saved");

    } catch (e) {
      const msg = e?.message || "Failed to save profile";
      setError(msg);
      notify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_ORIGIN}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl: "" })
      });
      if (res.ok) {
        setAvatarUrl("");
        localStorage.removeItem("avatarUrl");
        setStatus("Photo removed");
        setTimeout(() => setStatus(""), 1200);
        notify("Photo removed");
      } else {
        const d = await res.json();
        setError(d.message || "Failed to remove photo");
        notify(d.message || "Failed to remove photo", "error");
      }
    } catch (_) {
      setError("Network error while removing photo");
      notify("Network error while removing photo", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <Breadcrumbs />
      <main className="page-container pattern-bg section centered" style={{ marginTop: '1cm' }}>
        <div className="wrap">
          {mode === 'view' ? (
            <div className="vintage-card vintage-card--padded" style={{ paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="profile-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="profile-avatar__image" />
                  ) : (
                    <span className="profile-avatar__initials">{(name || 'U').trim().charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div style={{ minWidth: 240, textAlign: 'left' }}>
                  <h1 className="brand-title" style={{ margin: 0 }}>{displayName}</h1>
                  {username && <div className="form-meta" style={{ marginTop: 4, marginLeft: 0, padding: 0, textIndent: 0, display: 'block' }}>@{username}</div>}
                  {location && <div className="form-meta" style={{ marginTop: 4, marginLeft: 0, padding: 0, textIndent: 0, display: 'block' }}>{location}</div>}
                </div>
              </div>
              {bio && (
                <p className="tagline" style={{ marginTop: '0.75rem' }}>{bio}</p>
              )}
              {/* Bookshelves counts */}
              <div className="vintage-card" style={{ marginTop: '1rem', padding: '.75rem' }}>
                <div className="brand-title" style={{ fontSize: '1.05rem', marginBottom: '.35rem' }}>{first}’s Bookshelves</div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="badge" title="to-read" onClick={() => setSelectedShelf(selectedShelf === 'to-read' ? '' : 'to-read')}>
                    to-read ({shelves.toRead})
                  </button>
                  <button type="button" className="badge" title="currently-reading" onClick={() => setSelectedShelf(selectedShelf === 'currently-reading' ? '' : 'currently-reading')}>
                    currently-reading ({shelves.currentlyReading})
                  </button>
                  <button type="button" className="badge" title="read" onClick={() => setSelectedShelf(selectedShelf === 'read' ? '' : 'read')}>
                    read ({shelves.read})
                  </button>
                </div>
                {selectedShelf && (
                  <div className="vintage-card" style={{ marginTop: '.6rem', padding: '.6rem' }}>
                    <div className="form-meta" style={{ marginBottom: '.35rem' }}>
                      Showing books in: {selectedShelf}
                    </div>
                    {books.filter(b => (b.status || 'to-read').toLowerCase() === selectedShelf).length === 0 ? (
                      <p className="form-meta">No books in this shelf.</p>
                    ) : (
                      <ul className="grid grid--cards">
                        {books.filter(b => (b.status || 'to-read').toLowerCase() === selectedShelf).map((b) => (
                          <li key={b._id} className="vintage-card" style={{ padding: '.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span className="brand-title" style={{ fontSize: '1.05rem' }}>{b.title}</span>
                              {b.author && <span className="tagline" style={{ marginLeft: '.35rem' }}>by {b.author}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '.5rem' }}>
                <button className="vintage-button" onClick={() => setMode('edit')}>Edit Profile</button>
                {avatarUrl && <button className="gr-btn" onClick={handleRemovePhoto} disabled={saving}>Remove Photo</button>}
              </div>
              <div className="vintage-card" style={{ marginTop: '1rem', padding: '.75rem' }}>
                <div className="brand-title" style={{ fontSize: '1.05rem', marginBottom: '.35rem' }}>{first}’s Quotes</div>
                {quotes.length === 0 ? (
                  <p className="form-meta">No quotes yet.</p>
                ) : (
                  <ul className="grid grid--cards">
                    {quotes.map((q) => (
                      <li key={q._id} className="vintage-card" style={{ padding: '.75rem' }}>
                        <div className="tagline" style={{ marginBottom: '.25rem' }}>&ldquo;{q.text}&rdquo;</div>
                        {q.author && <div className="form-meta">— {q.author}</div>}
                        <div style={{ marginTop: '.35rem' }}>
                          <button className="vintage-button vintage-button--ghost" onClick={() => deleteQuote(q._id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <form className="form" onSubmit={addQuote} style={{ marginTop: '.6rem' }}>
                  <div className="form-row">
                    <input className="input" type="text" placeholder="Quote" value={quoteText} onChange={(e) => setQuoteText(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <input className="input" type="text" placeholder="Author (optional)" value={quoteAuthor} onChange={(e) => setQuoteAuthor(e.target.value)} />
                  </div>
                  <button type="submit" className="vintage-button">Add Quote</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="vintage-card vintage-card--padded">
              <h1 className="brand-title brand-title--lg" style={{ textAlign: "center", marginBottom: ".5rem" }}>
                Welcome, {first}
              </h1>
              <p className="tagline" style={{ textAlign: "center", marginBottom: "1rem" }}>
                Complete your profile information.
              </p>

              {/* Avatar uploader */}
              <div className="form-row" style={{ justifyContent: 'center' }}>
                <div ref={dropRef} className="vintage-card" style={{ padding: '.75rem', textAlign: 'center' }}>
                  <div style={{ marginBottom: '.6rem' }}>
                    <div className="profile-avatar profile-avatar--md">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="profile-avatar__image" />
                      ) : (
                        <span className="profile-avatar__initials">{(name || 'U').trim().charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickFile} disabled={uploading} />
                  <p className="form-meta" style={{ marginTop: '.4rem' }}>Drag & drop an image here, or pick a file (JPG/PNG/WEBP, max 4MB)</p>
                </div>
              </div>

              <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <input className="input" type="text" placeholder="Your name" value={name}
                    onChange={(e) => { setName(e.target.value); }} />
                </div>
                <div className="form-row">
                  <input className="input" type="text" placeholder="Username (unique)" value={username}
                    onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-row">
                  <input className="input" type="text" placeholder="Location" value={location}
                    onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="form-row">
                  <textarea className="input" placeholder="Short bio" value={bio}
                    onChange={(e) => setBio(e.target.value)} rows={4} />
                </div>

                {error && <p className="form-meta" style={{ color: '#b91c1c' }}>{error}</p>}
                {status && <p className="form-meta" style={{ color: '#166534' }}>{status}</p>}

                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <button type="submit" className="vintage-button" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                  <button type="button" className="gr-btn" onClick={() => setMode('view')}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
