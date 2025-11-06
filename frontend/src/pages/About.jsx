import React from "react";
import Navbar from "../components/Navbar.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default function About() {
  return (
    <>
      <Navbar />
      <Breadcrumbs />
      <main className="page-container pattern-bg section centered">
        <div className="wrap">
          <div className="vintage-card vintage-card--padded">
            <h1 className="brand-title brand-title--lg" style={{ textAlign: 'center', marginBottom: '.5rem' }}>About Readers Haven</h1>
            <p className="tagline" style={{ textAlign: 'center' }}>
              A cozy place to track your reading, collect quotes, and explore genres.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
