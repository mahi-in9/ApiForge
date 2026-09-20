import React, { useEffect, useCallback } from 'react';
import './KeyboardShortcuts.css';

const SHORTCUTS = [
  { keys: ['?'],          description: 'Show keyboard shortcuts' },
  { keys: ['Ctrl', 'K'], description: 'Quick navigation / command palette (coming soon)' },
  { keys: ['G', 'D'],    description: 'Go to Dashboard' },
  { keys: ['G', 'S'],    description: 'Go to Schema Builder' },
  { keys: ['G', 'V'],    description: 'Go to Visual Studio' },
  { keys: ['G', 'P'],    description: 'Go to API Playground' },
  { keys: ['Esc'],       description: 'Close modals / overlays' },
];

const KeyboardShortcuts = ({ navigate, isOpen, onOpen, onClose }) => {
  const handleKeyDown = useCallback((e) => {
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); isOpen ? onClose() : onOpen(); }
    if (e.key === 'Escape' && isOpen) { onClose(); }
  }, [isOpen, onOpen, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      <div className="ks-backdrop" onClick={onClose} />
      <div className="ks-panel animate-scale-in" role="dialog" aria-label="Keyboard shortcuts" aria-modal="true">
        <div className="ks-panel__header">
          <h2 className="ks-panel__title">⌨️ Keyboard Shortcuts</h2>
          <button className="ks-panel__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ks-list">
          {SHORTCUTS.map(({ keys, description }) => (
            <div key={keys.join('+')} className="ks-row">
              <span className="ks-row__desc">{description}</span>
              <div className="ks-row__keys">
                {keys.map((key, i) => (
                  <React.Fragment key={key}>
                    {i > 0 && <span className="ks-plus">+</span>}
                    <kbd className="ks-key">{key}</kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="ks-footer">
          Press <kbd className="ks-key-inline">?</kbd> anytime to toggle this panel
        </p>
      </div>
    </>
  );
};

export default KeyboardShortcuts;
