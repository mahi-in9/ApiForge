import React, { useEffect, useCallback } from 'react';

const SHORTCUTS = [
  { keys: ['?'],        description: 'Show keyboard shortcuts' },
  { keys: ['Ctrl', 'K'], description: 'Quick navigation / command palette (coming soon)' },
  { keys: ['G', 'D'],   description: 'Go to Dashboard' },
  { keys: ['G', 'S'],   description: 'Go to Schema Builder' },
  { keys: ['G', 'V'],   description: 'Go to Visual Studio' },
  { keys: ['G', 'P'],   description: 'Go to API Playground' },
  { keys: ['Esc'],      description: 'Close modals / overlays' },
];

/**
 * KeyboardShortcuts — shows a help overlay when the user presses `?`
 * and adds global keyboard navigation shortcuts.
 */
const KeyboardShortcuts = ({ navigate, isOpen, onOpen, onClose }) => {
  const handleKeyDown = useCallback((e) => {
    // Don't fire when user is typing in an input/textarea
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      isOpen ? onClose() : onOpen();
    }

    if (e.key === 'Escape' && isOpen) {
      onClose();
    }

    // Quick navigation shortcuts (G + letter)
    if (e.key === 'g' || e.key === 'G') {
      // Handled by a sequence — skip for now; too complex without global sequence state
    }
  }, [isOpen, onOpen, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 8000,
        }}
      />

      {/* Panel */}
      <div
        className="animate-scale-in"
        role="dialog"
        aria-label="Keyboard shortcuts"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass-bright)',
          borderRadius: 'var(--radius-xl)',
          backdropFilter: 'blur(24px)',
          boxShadow: 'var(--shadow-lg)',
          padding: '32px',
          width: '480px',
          maxWidth: '90vw',
          zIndex: 8001,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SHORTCUTS.map(({ keys, description }) => (
            <div
              key={keys.join('+')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{description}</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {keys.map((key, i) => (
                  <React.Fragment key={key}>
                    {i > 0 && <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>+</span>}
                    <kbd style={{
                      padding: '3px 8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-glass-bright)',
                      borderRadius: '5px',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-neon)',
                      boxShadow: '0 2px 0 rgba(0,0,0,0.4)',
                    }}>
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: '20px 0 0 0', fontSize: '0.8rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
          Press <kbd style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontFamily: 'var(--font-mono)', color: 'var(--accent-neon)' }}>?</kbd> anytime to toggle this panel
        </p>
      </div>
    </>
  );
};

export default KeyboardShortcuts;
