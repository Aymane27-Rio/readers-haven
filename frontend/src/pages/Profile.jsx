import React from "react";
import Navbar from "../components/Navbar.jsx";

export default function Profile() {
  const [name, setName] = React.useState(() => localStorage.getItem("name") || "");
  const [bio, setBio] = React.useState("");
  const [location, setLocation] = React.useState("");

  const first = name ? name.split(" ")[0] : "there";

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: you can wire this to a backend endpoint later
    alert("Profile saved!\nName: " + name + "\nLocation: " + location + "\nBio: " + bio);
  };

  return (
    <>
      <Navbar />
      <main className="page-container pattern-bg section centered">
        <div className="wrap">
          <div className="vintage-card vintage-card--padded">
            <h1 className="brand-title brand-title--lg" style={{ textAlign: "center", marginBottom: ".75rem" }}>
              Welcome, {first}
            </h1>
            <p className="tagline" style={{ textAlign: "center", marginBottom: "1rem" }}>
              Complete your profile information.
            </p>

            <form className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input className="input" type="text" placeholder="Your name" value={name}
                  onChange={(e) => { setName(e.target.value); localStorage.setItem("name", e.target.value); }} />
              </div>
              <div className="form-row">
                <input className="input" type="text" placeholder="Location" value={location}
                  onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="form-row">
                <textarea className="input" placeholder="Short bio" value={bio}
                  onChange={(e) => setBio(e.target.value)} rows={4} />
              </div>
              <button type="submit" className="vintage-button">Save Profile</button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
