import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { motion } from "framer-motion";

const genreData = {
  Philosophy: [
    { title: "Meditations", author: "Marcus Aurelius" },
    { title: "The Republic", author: "Plato" },
    { title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche" },
  ],
  Science: [
    { title: "A Brief History of Time", author: "Stephen Hawking" },
    { title: "The Selfish Gene", author: "Richard Dawkins" },
    { title: "Cosmos", author: "Carl Sagan" },
  ],
  Fiction: [
    { title: "1984", author: "George Orwell" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  ],
  History: [
    { title: "Sapiens", author: "Yuval Noah Harari" },
    { title: "Guns, Germs, and Steel", author: "Jared Diamond" },
    { title: "The Silk Roads", author: "Peter Frankopan" },
  ],
};

export default function GenrePage() {
  const { name } = useParams();
  const [books, setBooks] = useState([]);
  const [genreExists, setGenreExists] = useState(true);

  useEffect(() => {
    if (genreData[name]) {
      setBooks(genreData[name]);
      setGenreExists(true);
    } else {
      setGenreExists(false);
    }
  }, [name]);

  return (
    <>
      <Navbar />
      <motion.main
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-emerald-50 to-white fade-in-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        {genreExists ? (
          <div className="w-full max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold text-emerald-700 mb-4">
              {name} Books
            </h1>
            <p className="text-gray-600 mb-10">
              Explore our handpicked collection of must-read {name.toLowerCase()} books.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow-lg border border-emerald-100 hover:shadow-2xl transition transform hover:-translate-y-1"
                  whileHover={{ scale: 1.03 }}
                >
                  <h3 className="text-lg font-semibold text-emerald-800">{book.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">by {book.author}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center mt-20">
            <h2 className="text-3xl text-crimson-600 font-semibold mb-3">
              Genre Not Found
            </h2>
            <p className="text-gray-500">
              Sorry, we don’t have any recommendations for this genre yet.
            </p>
          </div>
        )}
      </motion.main>
      <Footer />
    </>
  );
}