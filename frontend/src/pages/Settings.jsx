import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import { Moon, Sun, Play, Sparkles, RotateCcw } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { start: startOnboarding } = useOnboarding();
  const toast = useToast();

  const handleRestartTour = () => {
    localStorage.removeItem('apiforge_onboarding_done');
    startOnboarding();
    toast.success('Walkthrough restarted!');
  };

  return (
    <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Settings</h1>

      {/* Appearance */}
      <GlassCard style={{ padding: '28px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
          Appearance
        </h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Theme Mode</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Toggle between dark and light mode. Your preference will be saved.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="btn-glass"
            style={{ minWidth: '140px', justifyContent: 'center' }}
          >
            {theme === 'dark' ? (
              <><Sun size={17} color="var(--accent-neon)" /> Light Mode</>
            ) : (
              <><Moon size={17} color="var(--accent-neon)" /> Dark Mode</>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Onboarding */}
      <GlassCard style={{ padding: '28px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
          Onboarding & Help
        </h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Getting Started Tour
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Restart the 5-step walkthrough to rediscover API Forge's features.
            </p>
          </div>

          <button
            onClick={handleRestartTour}
            className="btn-glass"
            style={{ minWidth: '140px', justifyContent: 'center' }}
          >
            <RotateCcw size={16} color="var(--accent-neon)" />
            Restart Tour
          </button>
        </div>
      </GlassCard>

      {/* Keyboard shortcuts reminder */}
      <GlassCard style={{ padding: '28px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
          Keyboard Shortcuts
        </h2>
        <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Press <kbd style={{ padding: '2px 7px', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-glass)', borderRadius: '5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-neon)', fontSize: '0.85rem' }}>?</kbd>{' '}
          anywhere in the app to see all available keyboard shortcuts.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            { keys: '?',         desc: 'Shortcuts panel' },
            { keys: 'Ctrl+↵',    desc: 'Send request (Playground)' },
            { keys: 'Esc',       desc: 'Close modals' },
          ].map(({ keys, desc }) => (
            <div key={keys} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
              <kbd style={{ padding: '2px 7px', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-glass)', borderRadius: '5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-neon)', fontSize: '0.78rem' }}>{keys}</kbd>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
