import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = ({ style }) => (
  <div className="skeleton-card" style={style}>
    <div className="skeleton-card__row">
      <div className="skeleton" style={{ height: '18px', width: '55%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '18px', width: '22px', borderRadius: '50%' }} />
    </div>
    <div className="skeleton" style={{ height: '36px', width: '100%', borderRadius: '8px' }} />
    <div className="skeleton-card__tags">
      <div className="skeleton" style={{ height: '24px', width: '70px', borderRadius: '20px' }} />
      <div className="skeleton" style={{ height: '24px', width: '50px', borderRadius: '20px' }} />
    </div>
  </div>
);

export const SkeletonList = ({ rows = 4 }) => (
  <div className="skeleton-list">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{
          height: '48px',
          width: '100%',
          borderRadius: '8px',
          opacity: 1 - i * 0.15,
        }}
      />
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 3 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} style={{ animationDelay: `${i * 0.08}s` }} />
    ))}
  </div>
);

export { SkeletonCard };
export default SkeletonCard;
