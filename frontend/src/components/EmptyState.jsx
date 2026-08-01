import React from 'react';

/**
 * Reusable EmptyState component.
 * @param {object} props
 * @param {React.ReactNode} props.icon  - Large icon/illustration
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} [props.action] - Optional CTA button
 */
const EmptyState = ({ icon, title, description, action }) => (
  <div
    className="animate-fade-up"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '64px 32px',
      border: '1px dashed var(--border-glass-bright)',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(0, 0, 0, 0.08)',
      gap: '16px',
    }}
  >
    {/* Animated icon container */}
    <div
      className="animate-float"
      style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'var(--accent-neon-dim)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
      }}
    >
      {icon}
    </div>

    <h3 style={{
      margin: 0,
      fontSize: '1.15rem',
      fontWeight: 600,
      color: 'var(--text-main)',
    }}>
      {title}
    </h3>

    <p style={{
      margin: 0,
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      maxWidth: '360px',
      lineHeight: 1.6,
    }}>
      {description}
    </p>

    {action && (
      <div style={{ marginTop: '8px' }}>
        {action}
      </div>
    )}
  </div>
);

export default EmptyState;
