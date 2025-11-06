import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ok, created, error as sendError, unauthorized, badRequest } from "../utils/response.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc Start password reset (request email)
// @route POST /api/auth/forgot
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return ok(res, null, "If that email exists, a reset link has been sent.");

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const isProd = process.env.NODE_ENV === 'production';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset?token=${resetToken}`;

    // In dev, return token for convenience; in prod, you'd send an email
    return ok(res, { resetUrl: isProd ? undefined : resetUrl, resetToken: isProd ? undefined : resetToken }, "Reset link generated.");
  } catch (error) {
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
};

// @desc Complete password reset
// @route POST /api/auth/reset
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return badRequest(res, "Invalid or expired reset token");

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return ok(res, { token: generateToken(user.id), name: user.name }, "Password has been reset");
  } catch (error) {
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
};

// @desc Register new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA if secret configured (with dev bypass)
    const isProd = process.env.NODE_ENV === 'production';
    const bypass = process.env.RECAPTCHA_BYPASS === 'true' || !isProd;
    if (process.env.RECAPTCHA_SECRET && !bypass) {
      if (!recaptchaToken) {
        return badRequest(res, "reCAPTCHA required");
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
          return badRequest(res, "reCAPTCHA verification failed");
        }
      } catch (e) {
        console.error("[reCAPTCHA] verification error:", e?.message || e);
        return sendError(res, 500, "reCAPTCHA verification error");
      }
    } else {
      // In non-production or when bypass enabled, accept a dummy token for logging
      if (recaptchaToken === 'DEV_BYPASS') {
        console.log('[reCAPTCHA] DEV_BYPASS token accepted (non-production).');
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return badRequest(res, "User already exists");

    const user = await User.create({ name, email, password });
    return created(res, {
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    }, 'User registered');
  } catch (error) {
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return ok(res, {
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      }, 'Login success');
    } else {
      return unauthorized(res, "Invalid email or password");
    }
  } catch (error) {
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
};