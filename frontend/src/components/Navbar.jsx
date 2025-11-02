import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center bg-gray-900 text-white px-6 py-3">
      <h1
        onClick={() => navigate("/books")}
        className="text-lg font-semibold cursor-pointer"
      >
        📖 Readers Haven
      </h1>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/books")}
          className="hover:text-blue-300 transition"
        >
          My Books
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
