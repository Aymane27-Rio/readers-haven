import React from "react";
import { FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    // Themed footer with gold top border and soft parchment gradient
    <footer className="vintage-footer">
      <p>
        Made with
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            verticalAlign: 'middle',
            margin: '0 .35rem',
            width: '1.25rem',
            height: '1.25rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #f87171, #be123c)',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(190,18,60,0.25)'
          }}
        >
          <FaHeart color="white" size={12} />
        </span>
        by <strong>Aymane & Abdelilah</strong> | {new Date().getFullYear()}
      </p>
    </footer>
  );
}
