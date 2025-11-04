import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc Register new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA if secret configured
    if (process.env.RECAPTCHA_SECRET) {
      if (!recaptchaToken) {
        return res.status(400).json({ message: "reCAPTCHA required" });
      }
      try {
        const doFetch = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default;
        const params = new URLSearchParams();
        params.append("secret", process.env.RECAPTCHA_SECRET);
        params.append("response", recaptchaToken);
        const r = await doFetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });
        const data = await r.json();
        if (!data.success) {
          console.warn("[reCAPTCHA] verification failed:", data);
          return res.status(400).json({ message: "reCAPTCHA verification failed" });
        }
      } catch (e) {
        console.error("[reCAPTCHA] verification error:", e?.message || e);
        return res.status(500).json({ message: "reCAPTCHA verification error" });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" }); //hhhhhhh
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};