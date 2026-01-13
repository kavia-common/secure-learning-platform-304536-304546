import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './api/auth';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Labs from './pages/Labs';
import LabDetail from './pages/LabDetail';
import Progress from './pages/Progress';
import Admin from './pages/Admin';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Main application component with routing and authentication
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        getCurrentUser()
          .then((userData) => {
            setUser(userData.user);
            sessionStorage.setItem('user', JSON.stringify(userData.user));
          })
          .catch(() => {
            // Token invalid, clear session
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch (err) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user ? (
          <div className="app-layout">
            <Sidebar isAdmin={user.roles?.includes('admin')} />
            <div className="main-content">
              <Topbar user={user} onLogout={handleLogout} />
              <div className="page-content">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute user={user}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/labs"
                    element={
                      <ProtectedRoute user={user}>
                        <Labs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/labs/:id"
                    element={
                      <ProtectedRoute user={user}>
                        <LabDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/progress"
                    element={
                      <ProtectedRoute user={user}>
                        <Progress />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute user={user} requireAdmin={true}>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
