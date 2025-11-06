import React from "react";

export default function LoadingSkeleton({ rows = 3, variant = 'card' }) {
  const Row = () => (
    <div className="vintage-card" style={{ padding: '1rem' }}>
      <div className="skeleton-line lg" style={{ width: '60%', marginBottom: '.6rem' }}></div>
      <div className="skeleton-line" style={{ width: '40%' }}></div>
    </div>
  );
  return (
    <div className={variant === 'grid' ? 'grid grid--cards' : ''}>
      {Array.from({ length: rows }).map((_, i) => <Row key={i} />)}
    </div>
  );
}
