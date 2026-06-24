import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';
import './Login.css'; // Reusing the same sleek styles

const Register = () => {
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
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
    setLocalError('');
    dispatch(clearError());

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Adjust these payload keys based on what your backend expects
    dispatch(register({ title, email, password }));
  };

  return (
    <div className="login-container">
      <GlassCard className="login-card">
        <div className="login-logo">
          <div className="neon-dot"></div>
          <h2>API-Forge</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {(error || localError) && (
            <div className="error-message">{localError || error}</div>
          )}
          
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
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
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              minLength="6"
            />
          </div>
          
          <button type="submit" disabled={isLoading} className="neon-button">
            {isLoading ? 'Creating Account...' : 'Initialize Developer Profile'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have access? </span>
            <Link to="/login" style={{ color: 'var(--accent-neon)', textDecoration: 'none' }}>Authenticate</Link>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default Register;
