import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Books from "./pages/Books.jsx";
import Home from "./pages/Home.jsx";
import GenrePage from "./pages/GenrePage.jsx";
import Profile from "./pages/Profile.jsx";
import ProfileSetup from "./pages/ProfileSetup.jsx";
import Community from "./pages/Community.jsx";
import Navbar from "./components/Navbar.jsx";
import "./index.css";
import "./styles/global.css";

//  ProtectedRoute component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

//  Page transition setup
const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

//  AnimatedRoutes keeps transitions between pages
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
      {/* We'll re-enable Navbar later once duplication is fixed */}
      {/* <Navbar /> */}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/*  Home */}
          <Route
            path="/home"
            element={
              <motion.div {...pageTransition}>
                <Home />
              </motion.div>
            }
          />

          {/*  Genre Page */}
          <Route
            path="/genre/:name"
            element={
              <motion.div {...pageTransition}>
                <GenrePage />
              </motion.div>
            }
          />

          {/*  Signup */}
          <Route
            path="/signup"
            element={
              <motion.div {...pageTransition}>
                <Signup />
              </motion.div>
            }
          />

          {/*  Login */}
          <Route
            path="/login"
            element={
              <motion.div {...pageTransition}>
                <Login />
              </motion.div>
            }
          />

          {/*  Profile Setup — Protected Route */}
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <ProfileSetup />
                </motion.div>
              </ProtectedRoute>
            }
          />

          {/*  Books — Protected Route */}
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}>
                  <Books />
                </motion.div>
              </ProtectedRoute>
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
          <Route
            path="/community"
            element={
              <motion.div {...pageTransition}>
                <Community />
              </motion.div>
            }
          />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

// ✅ App Wrapper
function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
