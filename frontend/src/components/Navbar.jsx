import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = React.useState(() => localStorage.getItem("token"));
  const [name, setName] = React.useState(() => localStorage.getItem("name") || "");
  const [open, setOpen] = React.useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    // optional: clear name when logging out
    try { localStorage.removeItem("name"); } catch (_) {}
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
            <a href="#" className="gr-link">Community</a>
          </nav>
          <div className="gr-actions">
            {token ? (
              <>
                <Link to="/profile" className="gr-link" style={{ textDecoration: 'none' }}>
                  {name ? `Hello, ${name.split(' ')[0]}` : 'Hello'}
                </Link>
                <button className="gr-btn" onClick={handleLogout}>Sign Out</button>
              </>
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