import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';
import './Login.css';

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
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    dispatch(register({ title, email, password }));
  };

  return (
    <div className="login-container">
      <GlassCard className="login-card">
        <div className="login-logo">
          <div className="login-logo-dot"></div>
          <h2>API Forge</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {(error || localError) && (
            <div className="error-message">{localError || error}</div>
          )}
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" />
          </div>
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? 'Creating Account...' : 'Initialize Developer Profile'}
          </button>
          <div className="auth-link-row">
            <span>Already have access? </span>
            <Link to="/login">Authenticate</Link>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default Register;
