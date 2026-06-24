import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { setSearchQuery } from '../store/slices/projectSlice';
import { LogOut, User, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { searchQuery } = useSelector((state) => state.projects);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="navbar">
      <div className="navbar-search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
        <input 
          type="text" 
          placeholder="Search environments..." 
          className="search-input" 
          value={searchQuery || ''}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          style={{ paddingLeft: '40px' }}
        />
      </div>
      
      <div className="navbar-profile">
        <div className="user-info">
          <User size={18} className="user-icon" />
          <span className="user-name">{user?.username || 'Developer'}</span>
        </div>
        <button onClick={handleLogout} className="logout-button" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
