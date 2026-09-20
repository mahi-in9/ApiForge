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
      <div className="navbar-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search environments..."
          className="search-input"
          value={searchQuery || ''}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        />
      </div>

      <div className="navbar-profile">
        <div className="user-info">
          <User size={16} className="user-icon" />
          <span>{user?.name || user?.title || 'Developer'}</span>
        </div>
        <button onClick={handleLogout} className="logout-button" title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
