import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import '../styles/Topbar.css';

// PUBLIC_INTERFACE
/**
 * Top navigation bar with user info and logout
 * @param {object} props - Component props
 * @param {object} props.user - Current user object
 * @param {function} props.onLogout - Logout handler
 */
const Topbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div className="topbar-title">
          <h1>Secure Learning Platform</h1>
          <span className="warning-badge">⚠️ Intentionally Vulnerable - Learning Only</span>
        </div>
        <div className="topbar-actions">
          {user && (
            <>
              <span className="user-info">
                👤 {user.displayName || user.email}
                {user.roles?.includes('admin') && <span className="admin-badge">Admin</span>}
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
