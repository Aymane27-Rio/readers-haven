import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { motion } from "framer-motion";
import { genreData } from "../data/genres.js";

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
        className="page-container pattern-bg section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {genreExists ? (
          <div className="wrap" style={{ textAlign: "center" }}>
            <h1 className="brand-title brand-title--lg" style={{ marginBottom: ".6rem" }}>
              {name} Books
            </h1>
            <p className="tagline" style={{ marginBottom: "1rem" }}>
              Explore our handpicked collection of must‑read {name.toLowerCase()} books.
            </p>

            <div className="grid grid--cards">
              {books.map((book, index) => (
                <motion.div
                  key={index}
                  className="vintage-card"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="brand-title" style={{ fontSize: "1.1rem" }}>{book.title}</h3>
                  <p className="tagline" style={{ marginTop: ".35rem" }}>by {book.author}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="wrap" style={{ textAlign: "center", marginTop: "2rem" }}>
            <h2 className="brand-title brand-title--lg" style={{ color: "#8b1a1a", marginBottom: ".5rem" }}>
              Genre Not Found
            </h2>
            <p className="tagline">Sorry, we don’t have any recommendations for this genre yet.</p>
          </div>
        )}
      </motion.main>
      <Footer />
    </>
  );
}