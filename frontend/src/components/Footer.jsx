import React from "react";

export default function Footer() {
  return (
    // Themed footer with gold top border and soft parchment gradient
    <footer className="vintage-footer">
      <p>
        Made with ❤️ by <strong>Aymane</strong> | {new Date().getFullYear()}
      </p>
    </footer>
  );
}
