import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      <div className="logo" style={{ fontWeight: "700", fontSize: "1.3rem" }}>
        <Link to="/" style={{ color: "white" }}>
          Readers Haven
        </Link>
      </div>

      <div className="links">
        <Link to="/home">Home</Link>
        <Link to="/books">Books</Link>
        {token ? (
          <button
            onClick={handleLogout}
            style={{
              background: "var(--secondary-color)",
              border: "none",
              padding: "0.4rem 0.9rem",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              marginLeft: "1rem",
            }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}