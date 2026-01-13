import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import Button from '../components/Button';
import '../styles/AuthPages.css';

// PUBLIC_INTERFACE
/**
 * Login page component
 * @param {object} props - Component props
 * @param {function} props.onLogin - Callback after successful login
 */
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <h1>🔐 SecLearn Login</h1>
        <p className="auth-subtitle">Intentionally Vulnerable Learning Platform</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
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
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        
        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts:</p>
          <p className="demo-info">Admin: admin@test.com / admin123</p>
          <p className="demo-info">User: user@test.com / user123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
