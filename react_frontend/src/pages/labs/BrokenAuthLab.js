import React, { useState, useEffect } from 'react';
import './LabPage.css';

// PUBLIC_INTERFACE
/**
 * Level 5: Broken Authentication Lab
 * OWASP A07:2021 - Identification and Authentication Failures
 * 
 * Demonstrates weak authentication mechanisms including:
 * - Weak JWT secret
 * - No token expiration
 * - Predictable tokens
 * - Verbose error messages
 */
function BrokenAuthLab() {
  const [findings, setFindings] = useState([]);

  useEffect(() => {
    // Analyze authentication weaknesses
    analyzeAuth();
  }, []);

  const analyzeAuth = () => {
    const foundIssues = [];

    // Check for JWT in session storage (insecure)
    const token = sessionStorage.getItem('token');
    if (token) {
      foundIssues.push({
        type: 'Token Storage',
        severity: 'High',
        description: 'JWT stored in sessionStorage (vulnerable to XSS)',
        recommendation: 'Use httpOnly cookies instead'
      });

      // Decode JWT (it's not encrypted, just base64 encoded)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          
          foundIssues.push({
            type: 'JWT Payload Exposed',
            severity: 'Medium',
            description: 'JWT payload is not encrypted: ' + JSON.stringify(payload, null, 2),
            recommendation: 'Be aware JWTs are readable by anyone'
          });

          // Check for expiration
          if (!payload.exp) {
            foundIssues.push({
              type: 'No Token Expiration',
              severity: 'High',
              description: 'JWT has no expiration time (exp claim)',
              recommendation: 'Always set token expiration'
            });
          }
        }
      } catch (e) {
        console.error('Error decoding JWT:', e);
      }
    }

    // Check environment hints
    foundIssues.push({
      type: 'Weak JWT Secret',
      severity: 'Critical',
      description: 'The JWT_SECRET is set to "dev-secret" (default)',
      recommendation: 'Use strong, random secrets in production',
      flag: 'CTF{w34k_jwt_s3cr3t_f0und}'
    });

    setFindings(foundIssues);
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 5: Broken Authentication</h1>
        <span className="lab-badge difficulty-medium">Medium</span>
        <span className="lab-badge">OWASP A07</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Identify and exploit weaknesses in the authentication system. Discover the weak JWT secret,
          understand token vulnerabilities, and learn how authentication can be compromised.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> Multiple Authentication Weaknesses</li>
          <li><strong>Impact:</strong> Account takeover, unauthorized access</li>
          <li><strong>Issues:</strong> Weak secrets, insecure storage, no expiration</li>
          <li><strong>OWASP:</strong> A07:2021 - Identification and Authentication Failures</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>🔍 Authentication Analysis</h2>
        
        <div className="findings-list">
          {findings.map((finding, idx) => (
            <div key={idx} className="finding-card" style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              borderLeft: `4px solid ${
                finding.severity === 'Critical' ? '#ef4444' :
                finding.severity === 'High' ? '#f59e0b' :
                finding.severity === 'Medium' ? '#3b82f6' : '#6b7280'
              }`
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <strong>{finding.type}</strong>
                <span className="lab-badge" style={{
                  background: 
                    finding.severity === 'Critical' ? '#ef4444' :
                    finding.severity === 'High' ? '#f59e0b' :
                    finding.severity === 'Medium' ? '#3b82f6' : '#6b7280'
                }}>
                  {finding.severity}
                </span>
              </div>
              <div style={{marginBottom: '8px', color: '#374151'}}>
                {finding.description}
              </div>
              <div style={{fontSize: '13px', color: '#6b7280', fontStyle: 'italic'}}>
                💡 {finding.recommendation}
              </div>
              {finding.flag && (
                <div style={{marginTop: '10px', padding: '10px', background: '#fef3c7', borderRadius: '6px'}}>
                  🎉 <strong>CTF Flag Found:</strong> <code>{finding.flag}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="lab-section">
        <h2>🔐 JWT Security Issues</h2>
        <h3>What is JWT?</h3>
        <p>
          JSON Web Tokens (JWT) are a popular way to handle authentication. A JWT consists of three parts:
        </p>
        <ul>
          <li><strong>Header:</strong> Algorithm and token type</li>
          <li><strong>Payload:</strong> Claims (user data, expiration, etc.)</li>
          <li><strong>Signature:</strong> Ensures integrity using a secret key</li>
        </ul>
        
        <h3>Common JWT Vulnerabilities:</h3>
        <ul>
          <li><strong>Weak Secret:</strong> Easy to guess or brute force</li>
          <li><strong>None Algorithm:</strong> Accept unsigned tokens</li>
          <li><strong>No Expiration:</strong> Tokens valid forever</li>
          <li><strong>Insecure Storage:</strong> localStorage/sessionStorage vulnerable to XSS</li>
          <li><strong>No Revocation:</strong> Can't invalidate compromised tokens</li>
        </ul>
      </div>

      <div className="lab-section">
        <h2>🎭 JWT Exploitation Demo</h2>
        <div className="code-block">
{`# 1. Decode the JWT (it's just base64, not encrypted!)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const [header, payload, signature] = token.split('.');
const decodedPayload = JSON.parse(atob(payload));
console.log(decodedPayload);
// Output: { sub: "user123", email: "user@example.com", roles: ["user"] }

# 2. With weak secret "dev-secret", forge a new token:
// Using jwt.io or a JWT library:
const forgedToken = jwt.sign(
  { sub: "user123", email: "user@example.com", roles: ["admin"] },
  "dev-secret"  // Weak secret discovered!
);

# 3. Use the forged token to gain admin access
// Replace your token with the forged one

# 4. Brute force weak secrets:
hashcat -a 0 -m 16500 jwt.txt wordlist.txt`}
        </div>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
const JWT_SECRET = 'dev-secret';  // Weak!
const token = jwt.sign(payload, JWT_SECRET);
// No expiration!

// Good (Secure):
// 1. Use strong, random secret (at least 256 bits)
const JWT_SECRET = crypto.randomBytes(32).toString('hex');
// Store in secure environment variables

// 2. Set expiration
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '15m'  // Short-lived access token
});

// 3. Use refresh tokens
const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
  expiresIn: '7d'
});

// 4. Store tokens securely
res.cookie('token', token, {
  httpOnly: true,    // Not accessible via JavaScript
  secure: true,      // HTTPS only
  sameSite: 'strict' // CSRF protection
});

// 5. Implement token revocation
// Use Redis or database to track valid tokens
// Check against blacklist on each request

// 6. Validate claims
const decoded = jwt.verify(token, JWT_SECRET);
if (!decoded.exp || decoded.exp < Date.now() / 1000) {
  throw new Error('Token expired');
}

// 7. Use strong algorithms
const token = jwt.sign(payload, privateKey, {
  algorithm: 'RS256'  // Asymmetric, more secure
});

// 8. Rate limiting on auth endpoints
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts
});
app.post('/login', loginLimiter, loginHandler);

// 9. Multi-Factor Authentication (MFA)
// 10. Password policies (length, complexity)
// 11. Account lockout after failed attempts
// 12. Secure password reset flows`}
        </pre>
      </div>

      <div className="lab-section">
        <h2>🔍 Testing Tools</h2>
        <ul>
          <li><strong>jwt.io:</strong> Online JWT decoder and debugger</li>
          <li><strong>jwt_tool:</strong> Python tool for JWT testing</li>
          <li><strong>hashcat:</strong> Crack JWT secrets with wordlists</li>
          <li><strong>Burp Suite:</strong> Intercept and modify JWT tokens</li>
        </ul>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> Check your browser's developer tools (Application/Storage tab) to see the JWT token.
        Use jwt.io to decode it and examine the secret used!
      </div>
    </div>
  );
}

export default BrokenAuthLab;
