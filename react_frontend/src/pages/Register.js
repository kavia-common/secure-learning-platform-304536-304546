import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import Button from '../components/Button';
import '../styles/AuthPages.css';

// PUBLIC_INTERFACE
/**
 * Registration page component
 * @param {object} props - Component props
 * @param {function} props.onLogin - Callback after successful registration
 */
const Register = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register(email, password, displayName);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      // Display stack trace in dev mode (intentionally insecure)
      if (process.env.NODE_ENV === 'development' && err.response?.data?.stack) {
        console.error('Backend error stack:', err.response.data.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔐 Create Account</h1>
        <p className="auth-subtitle">Join the Secure Learning Platform</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Your Name"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
