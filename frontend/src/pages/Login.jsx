import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { t } from "../i18n";
import { API_ORIGIN, AUTH_BASE } from "../services/apiBase.js";
import { fetchJson } from "../services/unwrap.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GiBookCover } from "react-icons/gi";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await fetchJson(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!data?.token) {
        throw new Error("Login response missing token");
      }

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      if (data?.name) {
        try { storage.setItem("name", data.name); window.dispatchEvent(new Event('auth:name')); } catch (_) { }
      }

      try { window.dispatchEvent(new Event('auth:token')); } catch (_) { }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <main className="page-container pattern-bg centered">
      <section className="auth-card vintage-card vintage-card--padded fade-in">
        <header className="auth-header">
          <div className="auth-crest" aria-hidden="true">
            <GiBookCover size={28} />
          </div>
          <h1 className="auth-title">{t('auth.app')}</h1>
          <p className="auth-tagline">{t('auth.tagline')}</p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t('auth.email_ph')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password">{t('auth.password')}</label>
            <div className="form-row" style={{ gap: '.5rem' }}>
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder={t('auth.password_ph')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="vintage-button vintage-button--ghost"
                aria-label={showPwd ? t('auth.hide_password') || 'Hide password' : t('auth.show_password') || 'Show password'}
                title={showPwd ? (t('auth.hide_password') || 'Hide password') : (t('auth.show_password') || 'Show password')}
              >
                {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-row">
            <label className="checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>{t('auth.remember')}</span>
            </label>

            <Link className="link" to="/forgot">{t('auth.forgot')}</Link>
          </div>

          <button className="vintage-button" type="submit">{t('auth.login')}</button>

          {error && (
            <p className="form-meta" style={{ color: "#b91c1c" }}>{error}</p>
          )}

          <p className="form-meta">
            {t('auth.no_account')} <Link className="link" to="/signup">{t('auth.create_account')}</Link>
          </p>
        </form>

        {/* Social auth */}
        <div className="social-buttons">
          <button
            type="button"
            className="btn-social btn-google"
            onClick={() => { window.location.href = `${AUTH_BASE}/auth/google`; }}
            aria-label={t('auth.continue_google')}
          >
            {/* Google G icon */}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 11.989h10.5c.1.56.15 1.14.15 1.74 0 6.09-4.09 10.41-10.65 10.41A11.85 11.85 0 0 1 0 12 11.85 11.85 0 0 1 12 0c3.2 0 5.88 1.17 7.9 3.07l-3.2 3.02C15.5 4.94 13.92 4.3 12 4.3 8.23 4.3 5.1 7.45 5.1 11.2s3.13 6.9 6.9 6.9c3.5 0 5.6-2 5.85-4.78H12v-1.33z" /></svg>
            {t('auth.continue_google')}
          </button>
        </div>
      </section>
    </main>
  );
}