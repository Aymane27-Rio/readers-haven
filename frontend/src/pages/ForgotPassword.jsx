import React from "react";
import { API_BASE } from "../services/apiBase.js";
import { fetchJson } from "../services/unwrap.js";

const FORGOT_URL = `${API_BASE}/auth/forgot`;

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [devLink, setDevLink] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    setError("");
    setDevLink("");
    try {
      const data = await fetchJson(FORGOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setStatus("If that email exists, a reset link has been sent.");
      if (data?.resetUrl) setDevLink(data.resetUrl);
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
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-tagline">We will email you a reset link</p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

          {error && <p className="form-meta" style={{ color: '#b91c1c' }}>{error}</p>}
          {status && <p className="form-meta" style={{ color: '#166534' }}>{status}</p>}

          <button type="submit" className="vintage-button">Send reset link</button>
        </form>

        {devLink && (
          <p className="form-meta" style={{ marginTop: '.8rem' }}>
            Dev reset link: <a className="link" href={devLink}>Open reset</a>
          </p>
        )}
      </section>
    </main>
  );
}
