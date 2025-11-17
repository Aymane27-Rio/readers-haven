import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const genres = [
  { name: "Fantasy", emoji: "🐉", color: "bg-emerald-100" },
  { name: "Science Fiction", emoji: "🚀", color: "bg-red-100" },
  { name: "Mystery", emoji: "🕵️‍♂️", color: "bg-emerald-50" },
  { name: "Romance", emoji: "💖", color: "bg-pink-100" },
  { name: "Thriller", emoji: "🔪", color: "bg-gray-100" },
  { name: "Non-fiction", emoji: "📘", color: "bg-blue-100" },
];

export default function Genres() {
  const navigate = useNavigate();

  const handleGenreClick = (name) => {
    navigate(`/genre/${encodeURIComponent(name)}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-10 px-6">
        <h1 className="text-3xl font-extrabold text-center text-emerald-800 mb-8">
          📚 Explore by Genre
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {genres.map((genre) => (
            <div
              key={genre.name}
              onClick={() => handleGenreClick(genre.name)}
              className={`cursor-pointer ${genre.color} border border-emerald-200 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition transform text-center`}
            >
              <span className="text-4xl">{genre.emoji}</span>
              <h2 className="text-xl font-semibold mt-3 text-emerald-800">
                {genre.name}
              </h2>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
