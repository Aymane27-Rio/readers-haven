import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";

// Simple, accessible breadcrumbs. Adapts to current route.
export default function Breadcrumbs() {
  const location = useLocation();
  const params = useParams();

  const segments = location.pathname.split("/").filter(Boolean);
  const trail = [];
  let pathAcc = "";
  segments.forEach((seg) => {
    pathAcc += `/${seg}`;
    trail.push({ label: formatSeg(seg, params), to: pathAcc });
  });

  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="wrap" style={{ marginTop: ".5rem", marginBottom: ".25rem" }}>
      <ol style={{ listStyle: "none", display: "flex", gap: ".4rem", padding: 0, margin: 0 }}>
        <li><Link className="gr-link" to="/home">Home</Link></li>
        {trail.map((c, idx) => (
          <li key={c.to} style={{ display: "inline-flex", alignItems: "center", gap: ".4rem" }}>
            <span aria-hidden>›</span>
            {idx === trail.length - 1 ? (
              <span className="tagline" aria-current="page">{c.label}</span>
            ) : (
              <Link className="gr-link" to={c.to}>{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function formatSeg(seg, params) {
  if (seg === "genre" && params?.name) return `Genre: ${decodeURIComponent(params.name)}`;
  return seg.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
