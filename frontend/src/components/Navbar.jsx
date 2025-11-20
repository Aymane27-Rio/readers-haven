import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GiBookCover } from "react-icons/gi";
import { t } from "../i18n.js";
import { API_BASE, API_ORIGIN, UPLOADS_BASE } from "../services/apiBase.js";
import { fetchJson } from "../services/unwrap.js";

export default function Navbar() {
  const navigate = useNavigate();
  const readToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");
  const readName = () => localStorage.getItem("name") || sessionStorage.getItem("name") || "";
  const [token, setToken] = React.useState(readToken);
  const [name, setName] = React.useState(readName);
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  // Inline settings in dropdown
  const [theme, setTheme] = React.useState(() => (JSON.parse(localStorage.getItem('settings') || '{}').theme) || 'system');
  const [emailUpdates, setEmailUpdates] = React.useState(() => {
    const s = JSON.parse(localStorage.getItem('settings') || '{}');
    return typeof s.emailUpdates === 'boolean' ? s.emailUpdates : true;
  });
  const [showShelvesPublic, setShowShelvesPublic] = React.useState(() => {
    const s = JSON.parse(localStorage.getItem('settings') || '{}');
    return typeof s.showShelvesPublic === 'boolean' ? s.showShelvesPublic : true;
  });
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
    const onToken = () => { try { localStorage.removeItem('avatarUrl'); } catch (_) { }; setAvatarUrl(""); setToken(readToken()); };
    const onName = () => setName(readName());
    window.addEventListener('auth:token', onToken);
    window.addEventListener('auth:name', onName);
    window.addEventListener('storage', (e) => { if (e.key === 'token' || e.key === 'name') { onToken(); onName(); } });
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
        const data = await fetchJson(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (data?.name) { localStorage.setItem('name', data.name); setName(data.name); }
        if (data?.avatarUrl) {
          const url = data.avatarUrl.startsWith('/uploads') ? `${UPLOADS_BASE}${data.avatarUrl}` : data.avatarUrl;
          localStorage.setItem('avatarUrl', url);
          setAvatarUrl(url);
        }
      } catch (_) { }
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

  const handleLogout = async () => {
    try {
      await fetchJson(`${API_BASE}/auth/logout`, { method: "POST" });
    } catch (_) { }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    try { localStorage.removeItem("name"); } catch (_) { }
    try { sessionStorage.removeItem("name"); } catch (_) { }
    try { localStorage.removeItem("avatarUrl"); } catch (_) { }
    try { window.dispatchEvent(new Event('auth:token')); } catch (_) { }
    try { window.dispatchEvent(new Event('auth:name')); } catch (_) { }
    navigate("/login");
  };

  return (
    // Goodreads-like header: full-width beige, left brand, centered search, right links & auth
    <header className="gr-nav" role="banner">
      <div className="gr-nav__inner" role="navigation" aria-label="Primary">
        {/* Brand (left) */}
        <div className="gr-brand">
          <Link to="/login">
            <span className="brand-logo" aria-hidden="true"><GiBookCover size={22} /></span>
            <span className="brand-name">Readers Haven</span>
          </Link>
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
            <NavLink
              to="/home"
              className={({ isActive }) => `gr-link${isActive ? ' is-active' : ''}`}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              {t('nav.home')}
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) => `gr-link${isActive ? ' is-active' : ''}`}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              {t('nav.books')}
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) => `gr-link${isActive ? ' is-active' : ''}`}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              {t('nav.community')}
            </NavLink>
            <NavLink
              to="/buy"
              className={({ isActive }) => `gr-link${isActive ? ' is-active' : ''}`}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              {t('nav.buy')}
            </NavLink>
          </nav>
          <div className="gr-actions">
            {token ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="gr-link gr-link--avatar"
                  onClick={() => setMenuOpen((v) => !v)}
                  title={name || 'Profile'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}
                >
                  <span className="profile-avatar profile-avatar--xs">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="profile-avatar__image"
                      />
                    ) : (
                      <span className="profile-avatar__initials">
                        {(name || 'U').trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 10px)',
                      minWidth: 220,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.18), 0 6px 10px rgba(0,0,0,0.12)',
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
                        color: 'var(--text)',
                        textDecoration: 'none',
                        borderRadius: 6,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {t('nav.profile')}
                    </Link>

                    <Link
                      role="menuitem"
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '.5rem .75rem',
                        color: 'var(--text)',
                        textDecoration: 'none',
                        borderRadius: 6,
                        marginTop: '.1rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {t('nav.settings')}
                    </Link>

                    <div style={{ height: 1, background: 'var(--border)', margin: '.25rem 0' }} />
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '.5rem .75rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className="gr-btn" style={{ textDecoration: 'none' }}>{t('nav.signIn')}</NavLink>
                <NavLink to="/signup" className="gr-btn" style={{ textDecoration: 'none' }}>{t('nav.join')}</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}