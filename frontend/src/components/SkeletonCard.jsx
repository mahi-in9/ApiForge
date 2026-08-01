import React from 'react';

/**
 * SkeletonCard — loading placeholder that mimics a project/schema card.
 * Uses the CSS skeleton shimmer animation from index.css.
 */
const SkeletonCard = ({ style }) => (
  <div
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      ...style,
    }}
  >
    {/* Title row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton" style={{ height: '18px', width: '55%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '18px', width: '22px', borderRadius: '50%' }} />
    </div>

    {/* Key row */}
    <div className="skeleton" style={{ height: '36px', width: '100%', borderRadius: '8px' }} />

    {/* Tag row */}
    <div style={{ display: 'flex', gap: '8px' }}>
      <div className="skeleton" style={{ height: '24px', width: '70px', borderRadius: '20px' }} />
      <div className="skeleton" style={{ height: '24px', width: '50px', borderRadius: '20px' }} />
    </div>
  </div>
);

/**
 * SkeletonList — a vertical list of skeleton rows (used in schema field list).
 */
export const SkeletonList = ({ rows = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

/**
 * SkeletonGrid — a responsive grid of SkeletonCards.
 */
export const SkeletonGrid = ({ count = 3 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} style={{ animationDelay: `${i * 0.08}s` }} />
    ))}
  </div>
);

export { SkeletonCard };
export default SkeletonCard;
