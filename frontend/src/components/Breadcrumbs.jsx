import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { LuChevronRight } from "react-icons/lu";

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
    <nav aria-label="Breadcrumb" className="wrap breadcrumbs">
      <ol className="breadcrumbs__list">
        <li className="breadcrumbs__item">
          <Link className="breadcrumbs__link" to="/home">Home</Link>
        </li>
        {trail.map((c, idx) => {
          const isLast = idx === trail.length - 1;
          return (
            <li className="breadcrumbs__item" key={c.to}>
              <span className="breadcrumbs__icon" aria-hidden="true"><LuChevronRight size={16} /></span>
              {isLast ? (
                <span className="breadcrumbs__current" aria-current="page">{c.label}</span>
              ) : (
                <Link className="breadcrumbs__link" to={c.to}>{c.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function formatSeg(seg, params) {
  if (seg === "genre" && params?.name) return `Genre: ${decodeURIComponent(params.name)}`;
  return seg.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
