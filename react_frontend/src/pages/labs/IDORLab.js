import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LabPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * Level 6: IDOR (Insecure Direct Object Reference) Lab
 * OWASP A01:2021 - Broken Access Control
 * 
 * Demonstrates access control failure where any authenticated user
 * can access any other user's data by manipulating the userId parameter.
 */
function IDORLab() {
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load current user to get their ID
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUserId(res.data.user.id);
        loadProfile(res.data.user.id);
      })
      .catch(err => console.error(err));
    }

    // CTF FLAG #13 in API discovery
    console.log('API endpoint discovered: /api/vulnerable/user/:userId - CTF{4p1_3ndp01nt_d1sc0v3ry}');
  }, []);

  const loadProfile = async (id) => {
    setError('');
    setProfile(null);
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/vulnerable/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleLoadProfile = () => {
    if (userId) {
      loadProfile(userId);
    }
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 6: IDOR Vulnerability</h1>
        <span className="lab-badge difficulty-easy">Easy</span>
        <span className="lab-badge">OWASP A01</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Access another user's profile data by manipulating the userId parameter.
          The API endpoint has no authorization check to verify if you're allowed
          to view the requested profile. Find the admin user's secret data!
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> Insecure Direct Object Reference (IDOR)</li>
          <li><strong>Impact:</strong> Unauthorized data access, privacy breach</li>
          <li><strong>Root Cause:</strong> Missing authorization check</li>
          <li><strong>Attack Method:</strong> Enumerate user IDs or guess ObjectIds</li>
          <li><strong>OWASP:</strong> A01:2021 - Broken Access Control</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>👤 User Profile Viewer (Vulnerable)</h2>
        
        <div className="user-selector">
          <div className="form-group">
            <label>User ID (MongoDB ObjectId):</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter any user ObjectId"
              style={{fontFamily: 'monospace'}}
            />
          </div>
          
          <button onClick={handleLoadProfile} className="btn-primary">
            Load Profile
          </button>
        </div>

        {error && (
          <div className="message error" style={{background: '#fee2e2', border: '1px solid #ef4444'}}>
            ❌ {error}
          </div>
        )}

        {profile && (
          <div className="profile-card">
            <h3>Profile Data</h3>
            <div className="profile-field">
              <label>ID:</label>
              <span style={{fontFamily: 'monospace'}}>{profile.id}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{profile.email}</span>
            </div>
            <div className="profile-field">
              <label>Display Name:</label>
              <span>{profile.displayName}</span>
            </div>
            <div className="profile-field">
              <label>Roles:</label>
              <span>{profile.roles?.join(', ')}</span>
            </div>
            <div className="profile-field">
              <label>Created:</label>
              <span>{new Date(profile.createdAt).toLocaleString()}</span>
            </div>
            {profile.secretData && (
              <div className="profile-field" style={{background: '#fef3c7', padding: '10px', borderRadius: '6px'}}>
                <label>🎉 Secret Data:</label>
                <span style={{fontWeight: 'bold', color: '#92400e'}}>{profile.secretData}</span>
              </div>
            )}
          </div>
        )}

        <div className="lab-section" style={{marginTop: '20px'}}>
          <h3>💡 Hints for Finding User IDs</h3>
          <ul>
            <li>Check the response from /api/auth/me to see your own user ID format</li>
            <li>MongoDB ObjectIds are 24-character hex strings</li>
            <li>Try accessing admin@example.com's profile</li>
            <li>User IDs might be visible in other API responses or URLs</li>
            <li>Try incrementing/decrementing the last characters of your ID</li>
          </ul>
        </div>
      </div>

      <div className="lab-section">
        <h2>🔍 Understanding the Vulnerability</h2>
        <pre className="code-block">
{`// Vulnerable backend code:
router.get('/user/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  
  // VULNERABILITY: No check if req.user._id === userId
  // Any authenticated user can view any profile!
  const user = await User.findById(userId);
  
  return res.json({ user });
});

// The attack:
// 1. Login as regular user
// 2. Get your own user ID from /api/auth/me
// 3. Change the ID in the URL to access other users
// 4. No authorization check prevents this!`}
        </pre>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
router.get('/user/:userId', requireAuth, async (req, res) => {
  const user = await User.findById(req.params.userId);
  return res.json({ user });
});

// Good (Secure):
router.get('/user/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  
  // 1. Check ownership
  if (req.user._id.toString() !== userId) {
    // 2. Or check if user is admin
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        error: 'Forbidden: Cannot access other users profiles' 
      });
    }
  }
  
  const user = await User.findById(userId);
  return res.json({ user });
});

// Better: Use indirect references
// Instead of exposing database IDs, use UUIDs or session-based lookups:
router.get('/profile/me', requireAuth, async (req, res) => {
  // req.user is already loaded by requireAuth middleware
  return res.json({ user: req.user });
});

// Access control principles:
// 1. Verify user owns the resource
// 2. Use ACLs (Access Control Lists)
// 3. Implement RBAC (Role-Based Access Control)
// 4. Never trust client-supplied IDs
// 5. Use indirect object references when possible`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> Create a second test user and try accessing their profile. Or find the admin user's ID from the database or API responses!
      </div>
    </div>
  );
}

export default IDORLab;
