import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ToastProvider from "./components/ToastProvider.jsx";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Books from "./pages/Books.jsx";
import Home from "./pages/Home.jsx";
import GenrePage from "./pages/GenrePage.jsx";
import Profile from "./pages/Profile.jsx";
import Community from "./pages/Community.jsx";
import Settings from "./pages/Settings.jsx";
import Buy from "./pages/Buy.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Navbar from "./components/Navbar.jsx";
import { API_BASE } from "./services/apiBase.js";
import { fetchJson } from "./services/unwrap.js";

import "./index.css";
import "./styles/global.css";

function AnimatedRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Apply persisted language and theme
  React.useEffect(() => {

    try {
      const s = JSON.parse(localStorage.getItem('settings') || '{}');
      const lang = (localStorage.getItem('lang') || s.language || 'en');
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      const theme = s.theme || 'system';
      if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      window.addEventListener('settings:changed', () => {
        const s2 = JSON.parse(localStorage.getItem('settings') || '{}');
        const lang2 = (localStorage.getItem('lang') || s2.language || 'en');
        document.documentElement.lang = lang2;
        document.documentElement.dir = lang2 === 'ar' ? 'rtl' : 'ltr';
        const theme2 = s2.theme || 'system';
        if (theme2 === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        else if (theme2 === 'light') document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
      });
    } catch (_) { }
  }, []);

  // Initialize CSRF token cookie on first load
  React.useEffect(() => {
    (async () => {
      try {
        await fetchJson(`${API_BASE}/auth/csrf`);
      } catch (_) { }
    })();
  }, []);

  // Hydrate auth state from cookie-based session (e.g., OAuth login)
  React.useEffect(() => {
    if (localStorage.getItem("token") || sessionStorage.getItem("token")) return;
    (async () => {
      try {
        const data = await fetchJson(`${API_BASE}/auth/me`);

        if (data?.token) {
          localStorage.setItem("token", data.token);
          try { window.dispatchEvent(new Event('auth:token')); } catch (_) { }
        }
        if (data?.name) {
          localStorage.setItem("name", data.name);
          try { window.dispatchEvent(new Event('auth:name')); } catch (_) { }
        }
      } catch (_) { }
    })();
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tok = params.get("token");
    const nm = params.get("name");
    if (tok) {
      localStorage.setItem("token", tok);
      try { window.dispatchEvent(new Event('auth:token')); } catch (_) { }
      // clean the URL (remove token param) without reloading
      const cleanSearch = Array.from(params.entries()).filter(([k]) => k !== 'token');
      const cleanUrl = location.pathname + (cleanSearch.length ? '?' + cleanSearch.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : '');
      window.history.replaceState({}, '', cleanUrl);
    }
    if (nm) {
      localStorage.setItem("name", nm);
      try { window.dispatchEvent(new Event('auth:name')); } catch (_) { }
    }
  }, [location]);

  const pageTransition = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: 0.4, ease: "easeInOut" },
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/home" element={
            <motion.div {...pageTransition}>
              <Home />
            </motion.div>
          } />
          <Route path="/books" element={
            <motion.div {...pageTransition}>
              {token ? <Books /> : <Navigate to="/login" />}
            </motion.div>
          } />
          <Route path="/buy" element={
            <motion.div {...pageTransition}>
              {token ? <Buy /> : <Navigate to="/login" />}
            </motion.div>
          } />
          <Route path="/genre/:name" element={
            <motion.div {...pageTransition}>
              <GenrePage />
            </motion.div>
          } />
          <Route path="/profile" element={
            <motion.div {...pageTransition}>
              {token ? <Profile /> : <Navigate to="/login" />}
            </motion.div>
          } />
          <Route path="/community" element={
            <motion.div {...pageTransition}>
              <Community />
            </motion.div>
          } />
          <Route path="/settings" element={
            <motion.div {...pageTransition}>
              {token ? <Settings /> : <Navigate to="/login" />}
            </motion.div>
          } />
          <Route path="/about" element={
            <motion.div {...pageTransition}>
              <About />
            </motion.div>
          } />
          <Route path="/contact" element={
            <motion.div {...pageTransition}>
              <Contact />
            </motion.div>
          } />
          <Route path="/login" element={
            <motion.div {...pageTransition}>
              <Login />
            </motion.div>
          } />
          <Route path="/signup" element={
            <motion.div {...pageTransition}>
              <Signup />
            </motion.div>
          } />
          <Route path="/forgot" element={
            <motion.div {...pageTransition}>
              <ForgotPassword />
            </motion.div>
          } />
          <Route path="/reset" element={
            <motion.div {...pageTransition}>
              <ResetPassword />
            </motion.div>
          } />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ToastProvider>
          <AnimatedRoutes />
        </ToastProvider>
      </ErrorBoundary>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);