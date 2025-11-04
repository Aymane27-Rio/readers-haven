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

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (res.ok) {
        navigate("/login");
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
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
      <div className="bg-[#1a1a1a] shadow-2xl rounded-2xl p-8 w-full max-w-md border border-[#2e8b57]/40">
        <h1 className="text-3xl font-semibold text-center mb-6 text-[#2e8b57]">
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-[#262626] text-white border border-[#2e8b57]/40 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
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
            className="w-full p-3 rounded-md bg-[#262626] text-white border border-[#2e8b57]/40 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
            required
          />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-[#262626] text-white border border-[#2e8b57]/40 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
          )}

          {/* CAPTCHA Placeholder */}
          <div className="flex flex-col items-center space-y-2">
            {/* Uncomment if using Google reCAPTCHA */}
            
            <ReCAPTCHA
              sitekey="6LeBOQIsAAAAAEbE8uJpa_RaFJYjr8W0nWZSogHT"
              onChange={() => setCaptchaValid(true)}
            />
           
            <button
              type="button"
              onClick={() => setCaptchaValid(true)}
              className="text-sm bg-[#2e8b57]/50 px-3 py-1 rounded hover:bg-[#2e8b57]/70 transition-colors"
            >
              Simulate CAPTCHA
            </button>
            {errors.captcha && (
              <p className="text-red-400 text-sm">{errors.captcha}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <p className="text-red-400 text-sm text-center">{errors.general}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#2e8b57] text-white py-3 rounded-md hover:bg-[#276c47] transition-colors"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#8b0000] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
