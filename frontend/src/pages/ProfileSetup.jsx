import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function ProfileSetup() {
  const token = localStorage.getItem("token");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        "http://localhost:5000/api/user/profile",
        {
          bio,
          interests: interests.split(",").map((i) => i.trim()),
          favoriteQuote,
          profilePic,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile.");
    }
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-6">
        <div className="bg-white border border-emerald-200 shadow-lg rounded-2xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
            🧭 Complete Your Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-emerald-700 font-semibold mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-emerald-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-emerald-700 font-semibold mb-1">
                Interests (comma separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full border border-emerald-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. philosophy, tech, fantasy"
              />
            </div>

            <div>
              <label className="block text-emerald-700 font-semibold mb-1">
                Favorite Quote
              </label>
              <input
                type="text"
                value={favoriteQuote}
                onChange={(e) => setFavoriteQuote(e.target.value)}
                className="w-full border border-emerald-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Your life motto..."
              />
            </div>

            <div>
              <label className="block text-emerald-700 font-semibold mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePicChange}
                className="w-full text-emerald-700"
              />
              {profilePic && (
                <img
                  src={profilePic}
                  alt="preview"
                  className="mt-3 w-24 h-24 rounded-full object-cover mx-auto border border-emerald-300"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              Save Profile
            </button>
          </form>

          {message && (
            <p className="text-center mt-4 text-emerald-700 font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}