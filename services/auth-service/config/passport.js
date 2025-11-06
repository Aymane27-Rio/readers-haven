import passport from "passport";
import User from "../models/User.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import jwt from "jsonwebtoken";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Serialize/deserialize (JWT is primary, but keep minimal session support off)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

const issueToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const configurePassport = () => {
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  const hasFacebook = !!process.env.FACEBOOK_APP_ID && !!process.env.FACEBOOK_APP_SECRET;
  console.log("[OAuth] FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("[OAuth] OAUTH_CALLBACK_BASE:", process.env.OAUTH_CALLBACK_BASE);
  console.log("[OAuth] Google creds present:", hasGoogle, 
    process.env.GOOGLE_CLIENT_ID ? `(id: ${String(process.env.GOOGLE_CLIENT_ID).slice(0,6)}... )` : "");
  console.log("[OAuth] Facebook creds present:", hasFacebook);
  // Google
  if (hasGoogle) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.OAUTH_CALLBACK_BASE || "http://localhost:5000"}/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            let user = await User.findOne({ provider: "google", providerId: profile.id });
            if (!user && email) {
              // If user exists locally by email, attach provider
              user = await User.findOne({ email });
            }
            if (!user) {
              user = await User.create({
                name: profile.displayName || "Google User",
                email: email || `${profile.id}@google.local`,
                provider: "google",
                providerId: profile.id,
              });
            } else {
              // ensure provider fields are set
              user.provider = user.provider || "google";
              user.providerId = user.providerId || profile.id;
              await user.save();
            }
            const token = issueToken(user);
            return done(null, { user, token });
          } catch (err) {
            done(err);
          }
        }
      )
    );
    console.log("[OAuth] Google strategy registered");
  }

  // Facebook
  if (hasFacebook) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `${process.env.OAUTH_CALLBACK_BASE || "http://localhost:5000"}/auth/facebook/callback`,
          profileFields: ["id", "displayName", "emails"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            let user = await User.findOne({ provider: "facebook", providerId: profile.id });
            if (!user && email) {
              user = await User.findOne({ email });
            }
            if (!user) {
              user = await User.create({
                name: profile.displayName || "Facebook User",
                email: email || `${profile.id}@facebook.local`,
                provider: "facebook",
                providerId: profile.id,
              });
            } else {
              user.provider = user.provider || "facebook";
              user.providerId = user.providerId || profile.id;
              await user.save();
            }
            const token = issueToken(user);
            return done(null, { user, token });
          } catch (err) {
            done(err);
          }
        }
      )
    );
    console.log("[OAuth] Facebook strategy registered");
  }
};

export const oauthSuccessRedirect = (req, res) => {
  // passport attaches { user, token } in req.user when using custom callback, but default flow stores in req.account
  const token = req.user?.token || req.account?.token;
  const name = (req.user?.user?.name || req.account?.user?.name || "").toString();
  const redirectTo = `${FRONTEND_URL}/home?token=${encodeURIComponent(token || "")}&name=${encodeURIComponent(name)}`;
  return res.redirect(redirectTo);
};

export default passport;
