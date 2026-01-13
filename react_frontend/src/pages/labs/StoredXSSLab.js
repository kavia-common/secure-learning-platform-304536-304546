import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LabPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * Level 1: Stored XSS Lab
 * OWASP A03:2021 - Injection
 * 
 * This lab demonstrates Stored (Persistent) XSS vulnerability.
 * User input is stored in the database without sanitization and
 * rendered using dangerouslySetInnerHTML, allowing script execution.
 */
function StoredXSSLab() {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadComments();
    
    // CTF FLAG #12 hidden in session storage
    if (!sessionStorage.getItem('xss-flag-found')) {
      sessionStorage.setItem('xss-hint', 'CTF{s3ss10n_st0r4g3_l34k}');
    }
  }, []);

  const loadComments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/vulnerable/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API_BASE}/api/vulnerable/comments`, {
        name,
        comment,
      });
      
      setMessage('Comment posted successfully!');
      setName('');
      setComment('');
      loadComments();
    } catch (err) {
      setMessage('Error posting comment: ' + err.message);
    }
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 1: Stored XSS Attack</h1>
        <span className="lab-badge difficulty-easy">Easy</span>
        <span className="lab-badge">OWASP A03</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Post a comment containing JavaScript that executes an alert() when the page loads.
          The vulnerability exists because user input is stored without sanitization and rendered
          directly in the DOM.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> Stored (Persistent) XSS</li>
          <li><strong>Impact:</strong> Script executes for ALL users viewing comments</li>
          <li><strong>Root Cause:</strong> No input sanitization + dangerouslySetInnerHTML</li>
          <li><strong>OWASP:</strong> A03:2021 - Injection</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>💬 Comment System (Vulnerable)</h2>
        
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Try: <script>alert('XSS')</script>"
              rows="4"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary">Post Comment</button>
        </form>

        {message && <div className="message">{message}</div>}

        <div className="comments-list">
          <h3>Recent Comments</h3>
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="comment-card">
                <div className="comment-header">
                  <strong>{c.name}</strong>
                  <span className="comment-date">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                {/* VULNERABLE: dangerouslySetInnerHTML renders raw HTML/JS */}
                <div
                  className="comment-body"
                  dangerouslySetInnerHTML={{ __html: c.comment }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Good (Safe):
<div>{userInput}</div>  // React auto-escapes

// Server-side (Node.js):
const sanitizeHtml = require('sanitize-html');
const clean = sanitizeHtml(userInput, {
  allowedTags: ['b', 'i', 'em', 'strong'],
  allowedAttributes: {}
});

// Content Security Policy Header:
Content-Security-Policy: default-src 'self'; script-src 'self'`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> The comment form doesn't validate or sanitize input.
        Try posting HTML tags or JavaScript code as a comment!
      </div>
    </div>
  );
}

export default StoredXSSLab;
