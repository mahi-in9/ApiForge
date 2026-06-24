import React from 'react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/GlassCard';
import { Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 40px 0', color: 'var(--text-main)' }}>Settings</h1>
      
      <GlassCard style={{ padding: '30px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
          Appearance
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>Theme Mode</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Toggle between dark and light mode. Your preference will be saved.
            </p>
          </div>
          
          <button 
            onClick={toggleTheme}
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-main)',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              minWidth: '150px',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={18} color="var(--accent-neon)" /> 
                Light Mode
              </>
            ) : (
              <>
                <Moon size={18} color="var(--accent-neon)" /> 
                Dark Mode
              </>
            )}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
