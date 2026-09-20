import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import { Moon, Sun, RotateCcw } from 'lucide-react';
import './Settings.css';

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
    <div className="settings">
      <h1 className="settings__title">Settings</h1>

      <GlassCard style={{ padding: '24px' }}>
        <h2 className="settings__section-title">Appearance</h2>
        <div className="settings__row">
          <div className="settings__row-label">
            <h3>Theme Mode</h3>
            <p>Toggle between dark and light mode. Your preference will be saved.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-glass"
            style={{ minWidth: '130px', justifyContent: 'center' }}
          >
            {theme === 'dark' ? <><Sun size={15} /> Light Mode</> : <><Moon size={15} /> Dark Mode</>}
          </button>
        </div>
      </GlassCard>

      <GlassCard style={{ padding: '24px' }}>
        <h2 className="settings__section-title">Onboarding &amp; Help</h2>
        <div className="settings__row">
          <div className="settings__row-label">
            <h3>Getting Started Tour</h3>
            <p>Restart the 5-step walkthrough to rediscover API Forge's features.</p>
          </div>
          <button
            onClick={handleRestartTour}
            className="btn-glass"
            style={{ minWidth: '130px', justifyContent: 'center' }}
          >
            <RotateCcw size={14} /> Restart Tour
          </button>
        </div>
      </GlassCard>

      <GlassCard style={{ padding: '24px' }}>
        <h2 className="settings__section-title">Keyboard Shortcuts</h2>
        <p className="settings-kbd-desc">
          Press <kbd className="settings-kbd-inline">?</kbd> anywhere in the app to see all available keyboard shortcuts.
        </p>
        <div className="settings-shortcuts">
          {[
            { keys: '?',       desc: 'Shortcuts panel' },
            { keys: 'Ctrl+↵', desc: 'Send request (Playground)' },
            { keys: 'Esc',     desc: 'Close modals' },
          ].map(({ keys, desc }) => (
            <div key={keys} className="settings-shortcut-chip">
              <kbd className="settings-kbd">{keys}</kbd>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
