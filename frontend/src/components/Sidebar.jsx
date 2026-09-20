import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, GitGraph, Terminal, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import KeyboardShortcuts from './KeyboardShortcuts';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: <LayoutDashboard size={18} />, label: 'Dashboard',      tourId: 'dashboard' },
  { to: '/schemas',       icon: <Database size={18} />,        label: 'Schema Builder',  tourId: 'schemas' },
  { to: '/visual-studio', icon: <GitGraph size={18} />,        label: 'Visual Studio',   tourId: 'visual-studio' },
  { to: '/playground',    icon: <Terminal size={18} />,        label: 'API Playground',  tourId: 'playground', badge: 'NEW' },
  { to: '/docs',          icon: <BookOpen size={18} />,        label: 'Documentation',   tourId: 'docs' },
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
          <div className="logo-dot" />
          {!collapsed && <span>API Forge</span>}
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
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          {!collapsed && (
            <button
              onClick={() => setShortcutsOpen(true)}
              className="nav-item"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <span className="nav-icon">⌨️</span>
              <span>Shortcuts (press ?)</span>
            </button>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            aria-label="Settings"
            title={collapsed ? 'Settings' : undefined}
          >
            <span className="nav-icon"><Settings size={18} /></span>
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <button
            onClick={() => setCollapsed(v => !v)}
            className="nav-item nav-collapse-btn"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <span className="nav-icon">
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

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
