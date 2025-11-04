import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = React.useState(() => localStorage.getItem("token"));
  const [name, setName] = React.useState(() => localStorage.getItem("name") || "");
  const [avatarUrl, setAvatarUrl] = React.useState(() => localStorage.getItem("avatarUrl") || "");
  const [open, setOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const [search, setSearch] = React.useState(() => {
    // prefill from URL param or last search from localStorage
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("q");
      return q ?? localStorage.getItem("lastSearch") ?? "";
    } catch (_) { return localStorage.getItem("lastSearch") ?? ""; }
  });
  const debounceRef = React.useRef(null);

  React.useEffect(() => {
    const onToken = () => setToken(localStorage.getItem("token"));
    const onName = () => setName(localStorage.getItem("name") || "");
    window.addEventListener('auth:token', onToken);
    window.addEventListener('auth:name', onName);
    window.addEventListener('storage', (e) => { if (e.key === 'token') onToken(); });
    return () => {
      window.removeEventListener('auth:token', onToken);
      window.removeEventListener('auth:name', onName);
      window.removeEventListener('storage', onToken);
    };
  }, []);

  // Fetch profile (name/avatar) when token exists
  React.useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.name) { localStorage.setItem('name', data.name); setName(data.name); }
          if (data?.avatarUrl) {
            const url = data.avatarUrl.startsWith('/uploads') ? `http://localhost:5000${data.avatarUrl}` : data.avatarUrl;
            localStorage.setItem('avatarUrl', url);
            setAvatarUrl(url);
          }
        }
      } catch (_) {}
    };
    load();
  }, [token]);

  React.useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onEsc); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    // optional: clear name when logging out
    try { localStorage.removeItem("name"); } catch (_) {}
    try { localStorage.removeItem("avatarUrl"); } catch (_) {}
    try { window.dispatchEvent(new Event('auth:token')); } catch (_) {}
    try { window.dispatchEvent(new Event('auth:name')); } catch (_) {}
    navigate("/login");
  };

  return (
    // Goodreads-like header: full-width beige, left brand, centered search, right links & auth
    <header className="gr-nav" role="banner">
      <div className="gr-nav__inner" role="navigation" aria-label="Primary">
        {/* Brand (left) */}
        <div className="gr-brand">
          <Link to="/login">Readers Haven</Link>
        </div>

        {/* Search (center) */}
        <div className="gr-search">
          <input
            type="search"
            placeholder="Search books, authors, genres"
            aria-label="Search"
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              // debounce navigation to books with q param
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                const q = val.trim();
                localStorage.setItem("lastSearch", q);
                if (q.length > 0) navigate(`/books?q=${encodeURIComponent(q)}`);
                else navigate(`/books`);
              }, 300);
            }}
          />
        </div>

        {/* Right side: links + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <button className="gr-hamburger" aria-label="Menu" onClick={() => setOpen(!open)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav className={`gr-links ${open ? 'is-open' : ''}`}>
            <NavLink to="/home" className={({ isActive }) => `gr-link${isActive ? ' is-active' : ''}`} aria-current={({ isActive }) => isActive ? 'page' : undefined}>Home</NavLink>
            <NavLink to="/books" className={({ isActive }) => `gr-link${isActive ? ' is-active' : ''}`} aria-current={({ isActive }) => isActive ? 'page' : undefined}>My Books</NavLink>
            <NavLink to="/community" className={({ isActive }) => `gr-link${isActive ? ' is-active' : ''}`} aria-current={({ isActive }) => isActive ? 'page' : undefined}>Community</NavLink>
          </nav>
          <div className="gr-actions">
            {token ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="gr-link"
                  onClick={() => setMenuOpen((v) => !v)}
                  title={name || 'Profile'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '9999px', objectFit: 'cover' }} />
                  ) : (
                    <span style={{
                      width: 32, height: 32, borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', color: '#333', fontWeight: 700
                    }}>
                      {(name || 'U').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 10px)',
                      minWidth: 220,
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 6px 10px rgba(0,0,0,0.08)',
                      padding: '.25rem',
                      zIndex: 70,
                    }}
                  >
                    <Link
                      role="menuitem"
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '.5rem .75rem',
                        color: '#1f2937',
                        textDecoration: 'none',
                        borderRadius: 6,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f6f7')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Profile
                    </Link>
                    <div style={{ height: 1, background: '#e5e7eb', margin: '.25rem 0' }} />
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '.5rem .75rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#b91c1c',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className="gr-btn" style={{ textDecoration: 'none' }}>Sign In</NavLink>
                <NavLink to="/signup" className="gr-btn" style={{ textDecoration: 'none' }}>Join</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}