import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Books from "./pages/Books";
import Buy from "./pages/Buy.jsx";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home.jsx";
import GenrePage from "./pages/GenrePage.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/genre/:name" element={<GenrePage />} />

        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buy"
          element={
            <ProtectedRoute>
              <Buy />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;