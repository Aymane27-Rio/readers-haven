import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Books from "./pages/Books.jsx";
import Home from "./pages/Home.jsx";
import GenrePage from "./pages/GenrePage.jsx";
import Profile from "./pages/Profile.jsx";
import Navbar from "./components/Navbar.jsx";
import "./index.css";
import "./styles/global.css";

function AnimatedRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tok = params.get("token");
    const nm = params.get("name");
    if (tok) {
      localStorage.setItem("token", tok);
      try { window.dispatchEvent(new Event('auth:token')); } catch (_) {}
      // clean the URL (remove token param) without reloading
      const cleanSearch = Array.from(params.entries()).filter(([k]) => k !== 'token');
      const cleanUrl = location.pathname + (cleanSearch.length ? '?' + cleanSearch.map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&') : '');
      window.history.replaceState({}, '', cleanUrl);
    }
    if (nm) {
      localStorage.setItem("name", nm);
      try { window.dispatchEvent(new Event('auth:name')); } catch (_) {}
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
      {/* <Navbar /> */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/home"
            element={
              <motion.div {...pageTransition}>
                <Home />
              </motion.div>
            }
          />
          <Route
            path="/genre/:name"
            element={
              <motion.div {...pageTransition}>
                <GenrePage />
              </motion.div>
            }
          />
          <Route
            path="/signup"
            element={
              <motion.div {...pageTransition}>
                <Signup />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div {...pageTransition}>
                <Login />
              </motion.div>
            }
          />
          <Route
            path="/books"
            element={
              <motion.div {...pageTransition}>
                {token ? <Books /> : <Navigate to="/login" />}
              </motion.div>
            }
          />
          <Route
            path="/profile"
            element={
              <motion.div {...pageTransition}>
                {token ? <Profile /> : <Navigate to="/login" />}
              </motion.div>
            }
          />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);