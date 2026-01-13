import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

// PUBLIC_INTERFACE
/**
 * Sidebar navigation component
 * @param {object} props - Component props
 * @param {boolean} props.isAdmin - Whether current user is admin
 */
const Sidebar = ({ isAdmin = false }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>🔐 SecLearn</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/labs" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">🧪</span>
          Labs
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">📈</span>
          Progress
        </NavLink>
        <NavLink to="/ctf" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="nav-icon">🏴‍☠️</span>
          CTF Side Quest
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-icon">⚙️</span>
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
