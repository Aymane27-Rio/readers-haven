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
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "linear-gradient(90deg, #003300, #660000)",
        color: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Left side (brand) */}
      <Link
        to="/home"
        style={{
          color: "var(--secondary-color, #90EE90)",
          fontSize: "1.5rem",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        Readers Haven
      </Link>

      {/* Right side (menu links) */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link
          to="/home"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Home
        </Link>

        <Link
          to="/books"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          My Books
        </Link>

        <Link
          to="/genre/Fantasy"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Genres
        </Link>

        {token ? (
          <>
            <Link
              to="/profile-setup"
              style={{
                color: "#90EE90",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#900",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: "#90EE90",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              style={{
                color: "#90EE90",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Signup
            </Link>

            <Link to="/genres"
             style={{ color: "#90EE90",
              textDecoration: "none",
               fontWeight: "500" }}
               >Genres
               </Link>

          </>
        )}
      </div>
    </nav>
  );
}