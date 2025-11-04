import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      if (res.data?.name) {
        try { localStorage.setItem("name", res.data.name); window.dispatchEvent(new Event('auth:name')); } catch (_) {}
      }
      try { window.dispatchEvent(new Event('auth:token')); } catch (_) {}
      console.log("✅ Login success, navigating...");
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <main className="page-container pattern-bg centered">
      <section className="auth-card vintage-card vintage-card--padded fade-in">
        <header className="auth-header">
          <div className="auth-crest" aria-hidden="true"></div>
          <h1 className="auth-title">Readers Haven</h1>
          <p className="auth-tagline">Where stories are etched in time</p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          <div className="form-row">
            <label className="checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <Link className="link" to="#">Forgot password?</Link>
          </div>

          <button className="vintage-button" type="submit">Login</button>

          {error && (
            <p className="form-meta" style={{ color: "#b91c1c" }}>{error}</p>
          )}

          <p className="form-meta">
            Don’t have an account? <Link className="link" to="/signup">Create account</Link>
          </p>
        </form>

        {/* Social auth */}
        <div className="social-buttons">
          <button
            type="button"
            className="btn-social btn-google"
            onClick={() => { window.location.href = "http://localhost:5000/auth/google"; }}
            aria-label="Continue with Google"
          >
            {/* Google G icon */}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 11.989h10.5c.1.56.15 1.14.15 1.74 0 6.09-4.09 10.41-10.65 10.41A11.85 11.85 0 0 1 0 12 11.85 11.85 0 0 1 12 0c3.2 0 5.88 1.17 7.9 3.07l-3.2 3.02C15.5 4.94 13.92 4.3 12 4.3 8.23 4.3 5.1 7.45 5.1 11.2s3.13 6.9 6.9 6.9c3.5 0 5.6-2 5.85-4.78H12v-1.33z"/></svg>
            Continue with Google
          </button>
        </div>
      </section>
    </main>
  );
}