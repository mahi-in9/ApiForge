import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Key, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="neon-dot"></div>
        API-Forge
      </div>
      
      <nav>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {/* Placeholders for future pages */}
        <div className="nav-item">
          <Database size={20} />
          <span>Schema Builder</span>
        </div>
        <div className="nav-item">
          <Key size={20} />
          <span>API Keys</span>
        </div>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          style={{ marginTop: 'auto' }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
