import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, GitGraph } from 'lucide-react';
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
        
        <NavLink 
          to="/schemas" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <Database size={20} />
          <span>Schema Builder</span>
        </NavLink>
        <NavLink 
          to="/visual-studio" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <GitGraph size={20} />
          <span>Visual Studio</span>
        </NavLink>
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
