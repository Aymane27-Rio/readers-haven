import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ok, created, error as sendError, unauthorized, badRequest } from "../utils/response.js";

const fallbackSecret = process.env.NODE_ENV === 'production' ? null : 'dev-secret';
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret' : fallbackSecret);
// Treat localhost FRONTEND_URL as non-production for cookie security and dev helpers
const isProd = process.env.NODE_ENV === 'production' && !(process.env.FRONTEND_URL || '').includes('localhost');

const generateToken = (id) => {
  if (!JWT_SECRET) {
    throw new Error('JWT secret not configured');
  }

  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

const setSessionCookie = (res, token, { remember = true } = {}) => {
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  };

  if (remember) {
    return res.cookie("rh_session", token, {
      ...baseOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  return res.cookie("rh_session", token, baseOptions);
};

export const csrf = (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("rh_csrf", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 12, // 12 hours
  });
  return ok(res, { csrfToken: token }, "CSRF token issued");
};

const sendAuthResponse = (res, user, { created: isCreated, message, remember = true }) => {
  const token = generateToken(user.id);
  setSessionCookie(res, token, { remember });

  const payload = {
    _id: user.id,
    name: user.name,
    email: user.email,
    token, // kept for now for backward compatibility with frontend
  };

  return isCreated ? created(res, payload, message) : ok(res, payload, message);
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

    const isProd = process.env.NODE_ENV === 'production' && !(process.env.FRONTEND_URL || '').includes('localhost');
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset?token=${resetToken}`;

    // In dev or localhost cluster, return token/resetUrl for convenience; in real prod, you'd send an email
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

    const newToken = generateToken(user.id);
    setSessionCookie(res, newToken);

    return ok(res, { token: newToken, name: user.name }, "Password has been reset");
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
    const hasSecret = !!process.env.RECAPTCHA_SECRET;
    const devBypass = recaptchaToken === 'DEV_BYPASS';
    const bypass = devBypass || process.env.RECAPTCHA_BYPASS === 'true' || !isProd || !hasSecret;

    if (hasSecret && !bypass) {
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
    } else if (devBypass) {
      // Explicitly allow DEV_BYPASS in any non-strict environment (including this K8s cluster)
      console.log('[reCAPTCHA] DEV_BYPASS token accepted.');
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return badRequest(res, "User already exists");

    const user = await User.create({ name, email, password });
    return sendAuthResponse(res, user, { created: true, message: 'User registered' });
  } catch (error) {
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
};

export const logout = (req, res) => {
  res.clearCookie("rh_session", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  });
  return ok(res, null, "Logged out");
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password, remember } = req.body;

  const rememberBool =
    remember === true ||
    remember === "true" ||
    remember === 1 ||
    remember === "1";

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return sendAuthResponse(res, user, { created: false, message: 'Login success', remember: rememberBool });
    } else {
      return unauthorized(res, "Invalid email or password");
    }
  } catch (error) {
    return sendError(res, 500, error.message || 'Internal Server Error');
  }
};

// @desc Get current authenticated user from JWT (supports cookie-based session)
// @route GET /api/auth/me
export const me = async (req, res) => {
  if (!req.user) {
    return unauthorized(res, "Not authenticated");
  }

  // Refresh token + cookie to extend session
  const token = generateToken(req.user.id);
  setSessionCookie(res, token);

  return ok(res, {
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    token,
  }, "Auth session");
};