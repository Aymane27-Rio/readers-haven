import React from "react";
import Navbar from "../components/Navbar.jsx";
import { t } from "../i18n.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { API_ORIGIN } from "../services/apiBase.js";
import { fetchJson } from "../services/unwrap.js";

export default function Settings() {
  const token = React.useMemo(() => localStorage.getItem("token"), []);
  const name = localStorage.getItem("name") || "there";

  const [theme, setTheme] = React.useState('system');
  const [emailUpdates, setEmailUpdates] = React.useState(true);
  const [showShelvesPublic, setShowShelvesPublic] = React.useState(true);
  const [language, setLanguage] = React.useState('en');
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    // Load from backend profile to get current preferences
    (async () => {
      if (!token) return;
      try {
        const data = await fetchJson(`${API_ORIGIN}/users`, { headers: { Authorization: `Bearer ${token}` } });
        const p = data.preferences || {};
        if (p.theme) setTheme(p.theme);
        if (typeof p.emailUpdates === 'boolean') setEmailUpdates(p.emailUpdates);
        if (typeof p.showShelvesPublic === 'boolean') setShowShelvesPublic(p.showShelvesPublic);
        if (p.language) setLanguage(p.language);
      } catch (_) { }
    })();
  }, [token]);

  const applyLanguage = (lang) => {
    try {
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    } catch (_) { }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) { setError('Please sign in.'); return; }
    setError("");
    setStatus("Saving...");
    try {
      const data = await fetchJson(`${API_ORIGIN}/users`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ preferences: { theme, emailUpdates, showShelvesPublic, language } }) });
      const p = data.preferences || {};
      // persist locally as well
      try { localStorage.setItem('settings', JSON.stringify(p)); } catch (_) { }
      applyLanguage(p.language || 'en');
      // apply theme immediately
      if (p.theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else if (p.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      try { window.dispatchEvent(new Event('settings:changed')); } catch (_) { }
      setStatus('Saved');
      setTimeout(() => setStatus(""), 1200);
    } catch (_) {
      setError('Network error');
      setStatus("");
    }
  };

  return (
    <>
      <Navbar />
      <Breadcrumbs />
      <main className="page-container pattern-bg section centered" style={{ marginTop: 'clamp(1.5rem, 4vh, 3rem)' }}>
        <div className="wrap">
          <div className="vintage-card vintage-card--padded">
            <h1 className="brand-title brand-title--lg" style={{ textAlign: 'center', marginBottom: '.5rem' }}>{t('settings.title')}</h1>
            <p className="tagline" style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('settings.hello')}, {name.split(' ')[0]}. {t('settings.manage')}</p>
            {!token ? (
              <p className="form-meta" style={{ textAlign: 'center' }}>{t('settings.signin_required')}</p>
            ) : (
              <form className="form" onSubmit={handleSave}>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <label className="form-meta" style={{ width: 160 }}>{t('settings.theme')}</label>
                  <select
                    className="input"
                    value={theme}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTheme(val);
                      // apply immediately without save
                      if (val === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
                      else if (val === 'light') document.documentElement.setAttribute('data-theme', 'light');
                      else document.documentElement.removeAttribute('data-theme');
                      try {
                        const cur = JSON.parse(localStorage.getItem('settings') || '{}');
                        localStorage.setItem('settings', JSON.stringify({ ...cur, theme: val }));
                        window.dispatchEvent(new Event('settings:changed'));
                      } catch (_) { }
                    }}
                  >
                    <option value="system">{t('settings.system')}</option>
                    <option value="light">{t('settings.light')}</option>
                    <option value="dark">{t('settings.dark')}</option>
                  </select>
                </div>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <label className="form-meta" style={{ width: 160 }}>{t('settings.email')}</label>
                  <button
                    type="button"
                    aria-pressed={emailUpdates}
                    onClick={() => setEmailUpdates((v) => !v)}
                    style={{
                      width: 52,
                      height: 28,
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      background: emailUpdates ? 'var(--accent)' : 'var(--card)',
                      position: 'relative',
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)'
                    }}
                    title={emailUpdates ? 'On' : 'Off'}
                  >
                    <span style={{
                      position: 'absolute',
                      top: 2,
                      left: emailUpdates ? 26 : 2,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left .15s ease'
                    }} />
                  </button>
                  <span className="form-meta" style={{ marginLeft: '.6rem' }}>{t('settings.email_hint')}</span>
                </div>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <label className="form-meta" style={{ width: 160 }}>{t('settings.privacy')}</label>
                  <button
                    type="button"
                    aria-pressed={showShelvesPublic}
                    onClick={() => setShowShelvesPublic((v) => !v)}
                    style={{
                      width: 52,
                      height: 28,
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      background: showShelvesPublic ? 'var(--accent)' : 'var(--card)',
                      position: 'relative',
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)'
                    }}
                    title={showShelvesPublic ? 'On' : 'Off'}
                  >
                    <span style={{
                      position: 'absolute',
                      top: 2,
                      left: showShelvesPublic ? 26 : 2,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left .15s ease'
                    }} />
                  </button>
                  <span className="form-meta" style={{ marginLeft: '.6rem' }}>{t('settings.shelves_public')}</span>
                </div>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <label className="form-meta" style={{ width: 160 }}>{t('settings.language')}</label>
                  <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="zgh">ⵜⴰⵎⴰⵣⵉⵖⵜ (Tamazight)</option>
                  </select>
                </div>
                {error && <p className="form-meta" style={{ color: '#b91c1c' }}>{error}</p>}
                {status && <p className="form-meta" style={{ color: '#166534' }}>{status}</p>}
                <button type="submit" className="vintage-button">{t('settings.save')}</button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
