import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../services/apiBase.js";
import { fetchJson } from "../services/unwrap.js";

const RESET_URL = `${API_BASE}/auth/reset`;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");

  const token = React.useMemo(() => new URLSearchParams(location.search).get("token") || "", [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Resetting...");
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); setStatus(""); return; }
    if (password !== confirm) { setError("Passwords do not match"); setStatus(""); return; }

    try {
      const data = await fetchJson(RESET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      // Backend now sets a secure HttpOnly cookie; we also keep token in storage
      // for compatibility with existing route guards until we fully migrate.
      try { if (data.token) { localStorage.setItem("token", data.token); window.dispatchEvent(new Event('auth:token')); } } catch (_) { }
      try { if (data.name) { localStorage.setItem("name", data.name); window.dispatchEvent(new Event('auth:name')); } } catch (_) { }
      setStatus("Password updated. Redirecting...");
      setTimeout(() => navigate("/home"), 600);
    } catch (_) {
      setError("Network error");
      setStatus("");
    }
  };

  return (
    <main className="page-container pattern-bg centered">
      <section className="auth-card vintage-card vintage-card--padded fade-in" style={{ maxWidth: 460 }}>
        <header className="auth-header">
          <div className="auth-crest" aria-hidden="true"></div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-tagline">Choose a new password to access your account</p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="password">New password</label>
          <input id="password" type="password" required className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" required className="input" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

          {error && <p className="form-meta" style={{ color: '#b91c1c' }}>{error}</p>}
          {status && <p className="form-meta" style={{ color: '#166534' }}>{status}</p>}

          <button type="submit" className="vintage-button">Reset Password</button>
        </form>
      </section>
    </main>
  );
}
