import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    // Remove from DOM after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }, 350);
  }, []);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type, leaving: false }]);

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const success = useCallback((msg, duration) => show(msg, 'success', duration), [show]);
  const error   = useCallback((msg, duration) => show(msg, 'error', duration), [show]);
  const info    = useCallback((msg, duration) => show(msg, 'info', duration), [show]);
  const warn    = useCallback((msg, duration) => show(msg, 'warn', duration), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warn, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

// ─── Toast Container (portal-like, fixed positioned) ─────────────────────────
const COLORS = {
  success: { bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.35)', icon: '✓', iconColor: '#4ade80' },
  error:   { bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.35)', icon: '✕', iconColor: '#f87171' },
  warn:    { bg: 'rgba(245, 158, 11, 0.12)',  border: 'rgba(245, 158, 11, 0.35)',  icon: '⚠', iconColor: '#f59e0b' },
  info:    { bg: 'rgba(0, 240, 255, 0.08)',   border: 'rgba(0, 240, 255, 0.25)',   icon: 'ℹ', iconColor: '#00f0ff' },
};

const ToastContainer = ({ toasts, onDismiss }) => (
  <div
    aria-live="polite"
    aria-atomic="false"
    style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px',
      width: '100%',
      pointerEvents: 'none',
    }}
  >
    {toasts.map(toast => (
      <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
    ))}
  </div>
);

const ToastItem = ({ toast, onDismiss }) => {
  const cfg = COLORS[toast.type] || COLORS.info;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '10px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        pointerEvents: 'all',
        animation: toast.leaving
          ? 'toastSlideOut 0.35s ease forwards'
          : 'toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        cursor: 'default',
      }}
    >
      {/* Icon */}
      <span style={{
        flexShrink: 0,
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: `${cfg.iconColor}22`,
        border: `1px solid ${cfg.iconColor}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        color: cfg.iconColor,
        fontWeight: 700,
        marginTop: '1px',
      }}>
        {cfg.icon}
      </span>

      {/* Message */}
      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
        {toast.message}
      </span>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          fontSize: '1rem',
          lineHeight: 1,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.target.style.color = 'var(--text-main)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

export default ToastProvider;
