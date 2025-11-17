import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { GiDragonSpiral, GiRocket, GiMagnifyingGlass, GiHearts, GiKnifeFork, GiBookmarklet } from "react-icons/gi";
import { LuBookOpen } from "react-icons/lu";

const genres = [
  { name: "Fantasy", Icon: GiDragonSpiral, color: "bg-emerald-100" },
  { name: "Science Fiction", Icon: GiRocket, color: "bg-red-100" },
  { name: "Mystery", Icon: GiMagnifyingGlass, color: "bg-emerald-50" },
  { name: "Romance", Icon: GiHearts, color: "bg-pink-100" },
  { name: "Thriller", Icon: GiKnifeFork, color: "bg-gray-100" },
  { name: "Non-fiction", Icon: GiBookmarklet, color: "bg-blue-100" },
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
        <h1 className="text-3xl font-extrabold text-center text-emerald-800 mb-8 flex items-center justify-center gap-3">
          <span aria-hidden="true" className="inline-flex">
            <LuBookOpen size={40} />
          </span>
          <span>Explore by Genre</span>
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {genres.map((genre) => (
            <div
              key={genre.name}
              onClick={() => handleGenreClick(genre.name)}
              className={`cursor-pointer ${genre.color} border border-emerald-200 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition transform text-center`}
            >
              <span className="text-4xl inline-flex justify-center" aria-hidden="true">
                <genre.Icon size={48} />
              </span>
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
