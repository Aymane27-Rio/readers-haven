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
import ProfileSetup from "./pages/ProfileSetup.jsx";
import Genres from "./pages/Genres.jsx";


import Navbar from "./components/Navbar.jsx";
import "@picocss/pico/css/pico.min.css";
import "./index.css";

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
          path="/genres"
           element=
           {
            <ProtectedRoute>
            <motion.div {...pageTransition}>
              <Genres />
            </motion.div>
          </ProtectedRoute>
           } />


          {/* 🚪 Default Redirect */}
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
