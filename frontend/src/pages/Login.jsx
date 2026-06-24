import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(login({ email, password }));
  };

  return (
    <div className="login-container">
      <GlassCard className="login-card">
        <div className="login-logo">
          <div className="neon-dot"></div>
          <h2>API-Forge</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={isLoading} className="neon-button">
            {isLoading ? 'Authenticating...' : 'Access Command Center'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Need a developer account? </span>
            <Link to="/register" style={{ color: 'var(--accent-neon)', textDecoration: 'none' }}>Initialize Profile</Link>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default Login;
