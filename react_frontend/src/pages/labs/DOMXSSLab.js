import React, { useState, useEffect } from 'react';
import './LabPage.css';

// PUBLIC_INTERFACE
/**
 * Level 3: DOM-based XSS Lab
 * OWASP A03:2021 - Injection
 * 
 * This lab demonstrates DOM XSS where client-side JavaScript
 * unsafely reads from window.location.hash and writes to innerHTML.
 */
function DOMXSSLab() {
  const [hashValue, setHashValue] = useState('');
  const [displayContent, setDisplayContent] = useState('');

  useEffect(() => {
    updateFromHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', updateFromHash);
    
    // CTF FLAG #3 in local storage
    localStorage.setItem('dom-xss-flag', 'CTF{d0m_xss_cl13nt_s1d3}');
    
    return () => {
      window.removeEventListener('hashchange', updateFromHash);
    };
  }, []);

  const updateFromHash = () => {
    // VULNERABLE: Reading from window.location.hash
    const hash = window.location.hash.substring(1); // Remove the # symbol
    setHashValue(hash);
    
    if (hash) {
      // VULNERABLE: Setting innerHTML with user-controlled data
      setDisplayContent(hash);
    }
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 3: DOM-based XSS Attack</h1>
        <span className="lab-badge difficulty-medium">Medium</span>
        <span className="lab-badge">OWASP A03</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Use the URL fragment (hash) to inject JavaScript that executes in the DOM.
          This vulnerability is purely client-side - the malicious payload never touches the server.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> DOM-based XSS (Client-side)</li>
          <li><strong>Impact:</strong> Pure client-side execution, harder to detect</li>
          <li><strong>Root Cause:</strong> innerHTML assignment with location.hash</li>
          <li><strong>Difference from Reflected:</strong> Payload never sent to server</li>
          <li><strong>OWASP:</strong> A03:2021 - Injection</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>📍 URL Hash Display (Vulnerable)</h2>
        
        <div className="url-display">
          <strong>Current URL:</strong><br />
          {window.location.href}
        </div>

        <div className="url-display">
          <strong>Hash Value:</strong> {hashValue || '(none)'}
        </div>

        {/* VULNERABLE: dangerouslySetInnerHTML with hash content */}
        <div 
          className="hash-display-box"
          style={{
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            marginTop: '15px',
            minHeight: '100px'
          }}
        >
          <strong>Content from Hash:</strong>
          <div dangerouslySetInnerHTML={{ __html: displayContent || '<em>No hash content</em>' }} />
        </div>

        <div style={{marginTop: '20px'}}>
          <p><strong>Try these in the URL:</strong></p>
          <div className="payload-display">
            #&lt;h1&gt;Hello&lt;/h1&gt;<br/>
            #&lt;img src=x onerror="alert('DOM XSS')"&gt;<br/>
            #&lt;svg onload="alert(document.domain)"&gt;
          </div>
        </div>
      </div>

      <div className="lab-section">
        <h2>🔍 Key Difference: DOM XSS vs Reflected XSS</h2>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f3f4f6'}}>
              <th style={{padding: '10px', textAlign: 'left', border: '1px solid #e5e7eb'}}>Aspect</th>
              <th style={{padding: '10px', textAlign: 'left', border: '1px solid #e5e7eb'}}>Reflected XSS</th>
              <th style={{padding: '10px', textAlign: 'left', border: '1px solid #e5e7eb'}}>DOM XSS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}><strong>Source</strong></td>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}>Server response</td>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}>Client-side JavaScript</td>
            </tr>
            <tr>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}><strong>Server involvement</strong></td>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}>Payload sent to server</td>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}>Payload stays in browser</td>
            </tr>
            <tr>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}><strong>Detection</strong></td>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}>Visible in server logs</td>
              <td style={{padding: '10px', border: '1px solid #e5e7eb'}}>Not in server logs</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
element.innerHTML = location.hash.substring(1);

// Good (Safe):
element.textContent = location.hash.substring(1);

// Or sanitize if HTML is needed:
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(location.hash.substring(1));

// Avoid dangerous sinks with user input:
// - innerHTML
// - outerHTML
// - document.write()
// - eval()
// - setTimeout/setInterval with strings

// Use safe DOM methods:
const textNode = document.createTextNode(userInput);
element.appendChild(textNode);`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> Try adding #&lt;img src=x onerror="alert('XSS')"&gt; to the end of the URL!
      </div>
    </div>
  );
}

export default DOMXSSLab;
