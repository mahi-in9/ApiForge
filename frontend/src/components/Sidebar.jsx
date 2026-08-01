import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, GitGraph, Terminal, BookOpen, Settings, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import KeyboardShortcuts from './KeyboardShortcuts';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    tourId: 'dashboard',
    description: 'Manage projects & API keys',
  },
  {
    to: '/schemas',
    icon: <Database size={20} />,
    label: 'Schema Builder',
    tourId: 'schemas',
    description: 'Define collections & fields',
  },
  {
    to: '/visual-studio',
    icon: <GitGraph size={20} />,
    label: 'Visual Studio',
    tourId: 'visual-studio',
    description: 'Visualize your data model',
  },
  {
    to: '/playground',
    icon: <Terminal size={20} />,
    label: 'API Playground',
    tourId: 'playground',
    description: 'Test endpoints live',
    badge: 'NEW',
  },
  {
    to: '/docs',
    icon: <BookOpen size={20} />,
    label: 'Documentation',
    tourId: 'docs',
    description: 'Guides & reference',
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <>
      <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo" title="API Forge">
          <div className="neon-dot" />
          {!collapsed && <span>API-Forge</span>}
        </div>

        {/* Navigation */}
        <nav aria-label="Primary navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              data-tour={item.tourId}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && (
                <div className="nav-label-group">
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span style={{
                      padding: '1px 6px',
                      background: 'rgba(0,240,255,0.15)',
                      border: '1px solid rgba(0,240,255,0.3)',
                      borderRadius: '10px',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: 'var(--accent-neon)',
                      letterSpacing: '0.06em',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          {/* Keyboard shortcuts hint */}
          {!collapsed && (
            <button
              onClick={() => setShortcutsOpen(true)}
              className="nav-item"
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <span className="nav-icon">
                <span style={{ fontSize: '0.85rem' }}>⌨️</span>
              </span>
              <span>Shortcuts (press ?)</span>
            </button>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            aria-label="Settings"
            title={collapsed ? 'Settings' : undefined}
          >
            <span className="nav-icon"><Settings size={20} /></span>
            {!collapsed && <span>Settings</span>}
          </NavLink>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', justifyContent: collapsed ? 'center' : 'flex-start' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <span className="nav-icon">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </span>
            {!collapsed && <span style={{ fontSize: '0.82rem' }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        navigate={navigate}
        isOpen={shortcutsOpen}
        onOpen={() => setShortcutsOpen(true)}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
};

export default Sidebar;
