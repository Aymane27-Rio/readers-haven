import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const API_URL = "http://localhost:5000/api/auth/register";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [captchaValid, setCaptchaValid] = useState(false);
  const navigate = useNavigate();
  const SITE_KEY = import.meta.env?.VITE_RECAPTCHA_SITE_KEY || "";

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email))
      newErrors.email = "Invalid email format";
    if (formData.email !== formData.confirmEmail)
      newErrors.confirmEmail = "Emails do not match";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!captchaValid)
      newErrors.captcha = "Please verify the captcha before signing up";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // reCAPTCHA v2 (optional): include token if available, but do NOT block submission
    let recaptchaToken = "";
    try {
      if (SITE_KEY && window.grecaptcha) {
        recaptchaToken = window.grecaptcha.getResponse() || "";
      } else {
        // Explicitly send a dev bypass marker when no captcha is configured
        recaptchaToken = "DEV_BYPASS";
      }
    } catch (_) {}

    if (formData.password !== formData.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, recaptchaToken }),
      });

      if (res.ok) {
        const data = await res.json();
        try { if (SITE_KEY && window.grecaptcha) window.grecaptcha.reset(); } catch (_) {}
        // persist token and name so navbar updates immediately
        if (data?.token) {
          try { localStorage.setItem("token", data.token); window.dispatchEvent(new Event('auth:token')); } catch (_) {}
        }
        if (data?.name) {
          try { localStorage.setItem("name", data.name); window.dispatchEvent(new Event('auth:name')); } catch (_) {}
        }
        // Always take user to main page after successful signup
        navigate("/home");
      } else {
        const data = await res.json();
        setErrors({ general: data.message || "Something went wrong!" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: "Network error — please try again." });
    }
  };

  return (
    <main className="page-container pattern-bg centered">
      <section className="auth-card vintage-card vintage-card--padded fade-in">
        <header className="auth-header">
          <div className="auth-crest" aria-hidden="true"></div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-tagline">Join Readers Haven</p>
        </header>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

          {/* Confirm Email */}
          <input
            type="email"
            name="confirmEmail"
            placeholder="Confirm Email"
            value={formData.confirmEmail}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-[#262626] text-white border border-[#2e8b57]/40 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
            required
          />
          {errors.confirmEmail && (
            <p className="text-red-400 text-sm">{errors.confirmEmail}</p>
          )}

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars)"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
          />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}

          <input
            type="password"
            name="confirm"
            placeholder="Confirm password"
            value={formData.confirm}
            onChange={handleChange}
            className="input"
            required
          />

          {/* Google reCAPTCHA v2 checkbox */}
          {Boolean(SITE_KEY) && (
            <div className="form-row" style={{ alignItems: "center" }}>
              <div className="g-recaptcha" data-sitekey={SITE_KEY}></div>
            </div>
          )}

          {error && <p className="form-meta" style={{ color: "#b91c1c" }}>{error}</p>}

          <button type="submit" className="vintage-button">Sign Up</button>
        </form>

        {/* Social auth */}
        <div className="social-buttons">
          <button
            type="button"
            className="btn-social btn-google"
            onClick={() => { window.location.href = "http://localhost:5000/auth/google"; }}
            aria-label="Continue with Google"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 11.989h10.5c.1.56.15 1.14.15 1.74 0 6.09-4.09 10.41-10.65 10.41A11.85 11.85 0 0 1 0 12 11.85 11.85 0 0 1 12 0c3.2 0 5.88 1.17 7.9 3.07l-3.2 3.02C15.5 4.94 13.92 4.3 12 4.3 8.23 4.3 5.1 7.45 5.1 11.2s3.13 6.9 6.9 6.9c3.5 0 5.6-2 5.85-4.78H12v-1.33z"/></svg>
            Continue with Google
          </button>
        </div>

        <p className="form-meta" style={{ marginTop: ".8rem" }}>
          Already have an account? <Link to="/login" className="link">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}
