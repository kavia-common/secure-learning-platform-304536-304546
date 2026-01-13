import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './LabPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * Level 2: Reflected XSS Lab
 * OWASP A03:2021 - Injection
 * 
 * This lab demonstrates Reflected XSS where malicious input from URL
 * parameters is reflected back and rendered without sanitization.
 */
function ReflectedXSSLab() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [reflectedQuery, setReflectedQuery] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
    
    // CTF FLAG #2 hidden in console
    console.log('Debug mode enabled. CTF{r3fl3ct3d_xss_fr0m_url}');
  }, [searchParams]);

  const performSearch = async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/api/vulnerable/search`, {
        params: { q: query },
      });
      
      setResults(response.data.results || []);
      setReflectedQuery(response.data.query || query);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 2: Reflected XSS Attack</h1>
        <span className="lab-badge difficulty-easy">Easy</span>
        <span className="lab-badge">OWASP A03</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Craft a search URL that causes JavaScript to execute when the search results are displayed.
          The vulnerability exists because query parameters are reflected directly into the page without encoding.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> Reflected (Non-Persistent) XSS</li>
          <li><strong>Impact:</strong> Executes when victim clicks malicious link</li>
          <li><strong>Root Cause:</strong> URL parameters reflected without encoding</li>
          <li><strong>Attack Vector:</strong> Phishing emails with malicious links</li>
          <li><strong>OWASP:</strong> A03:2021 - Injection</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>🔍 Search System (Vulnerable)</h2>
        
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Try: <script>alert('XSS')</script>"
          />
          <button type="submit" className="btn-primary" style={{marginTop: '10px'}}>
            Search
          </button>
        </form>

        {reflectedQuery && (
          <div className="search-results">
            <h3>Search Results</h3>
            {/* VULNERABLE: Reflected query rendered without sanitization */}
            <div className="result-header">
              Showing results for: <span dangerouslySetInnerHTML={{ __html: reflectedQuery }} />
            </div>

            <div style={{marginTop: '20px'}}>
              {results.map((result) => (
                <div key={result.id} className="result-card">
                  <h4>{result.title}</h4>
                  <p>{result.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="url-display" style={{marginTop: '20px'}}>
          <strong>Current URL:</strong><br />
          {window.location.href}
        </div>
      </div>

      <div className="lab-section">
        <h2>💡 Example Attack</h2>
        <div className="payload-display">
          ?q=&lt;script&gt;alert('XSS')&lt;/script&gt;<br/>
          ?q=&lt;img src=x onerror="alert('XSS')"&gt;<br/>
          ?q=&lt;svg onload="alert('XSS')"&gt;
        </div>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Good (Safe):
<div>{userInput}</div>  // React auto-escapes

// Server-side encoding (Node.js):
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Always validate and encode output
res.json({ query: escapeHtml(req.query.q) });`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> Add a <code>&lt;script&gt;</code> tag or an <code>&lt;img&gt;</code> tag with onerror event to the search query parameter in the URL!
      </div>
    </div>
  );
}

export default ReflectedXSSLab;
