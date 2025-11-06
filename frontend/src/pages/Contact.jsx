import React from "react";
import Navbar from "../components/Navbar.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default function Contact() {
  return (
    <>
      <Navbar />
      <Breadcrumbs />
      <main className="page-container pattern-bg section centered">
        <div className="wrap">
          <div className="vintage-card vintage-card--padded">
            <h1 className="brand-title brand-title--lg" style={{ textAlign: 'center', marginBottom: '.5rem' }}>Contact</h1>
            <p className="tagline" style={{ textAlign: 'center' }}>
              For feedback or support, email us at support@readershaven.example.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
