import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CTFFlags.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * CTF Side Quest Page
 * Track progress on finding hidden flags throughout the application
 */
function CTFFlags() {
  const [capturedFlags, setCapturedFlags] = useState([]);
  const [flagInput, setFlagInput] = useState('');
  const [flagId, setFlagId] = useState('');
  const [message, setMessage] = useState('');

  // All 20 flag IDs
  const allFlags = [
    { id: 'flag-1', name: 'Stored XSS Discovery', hint: 'Check HTML comments in API responses' },
    { id: 'flag-2', name: 'Reflected XSS Console', hint: 'Look in browser console logs' },
    { id: 'flag-3', name: 'DOM XSS LocalStorage', hint: 'Check localStorage in DevTools' },
    { id: 'flag-4', name: 'NoSQL Injection Success', hint: 'Returned in successful injection response' },
    { id: 'flag-5', name: 'JWT Secret Discovery', hint: 'Find the weak JWT secret' },
    { id: 'flag-6', name: 'IDOR Admin Data', hint: 'Access admin user profile via IDOR' },
    { id: 'flag-7', name: 'CSRF Header Flag', hint: 'Check response headers on CSRF endpoint' },
    { id: 'flag-8', name: 'File Upload Debug', hint: 'In file upload response debug info' },
    { id: 'flag-9', name: 'Command Injection Output', hint: 'Hidden in command execution output' },
    { id: 'flag-10', name: 'Hidden Header', hint: 'Custom HTTP response header' },
    { id: 'flag-11', name: 'Cookie Secret', hint: 'Examine cookies and session data' },
    { id: 'flag-12', name: 'Session Storage Leak', hint: 'Check sessionStorage in DevTools' },
    { id: 'flag-13', name: 'API Discovery', hint: 'Found via API endpoint enumeration' },
    { id: 'flag-14', name: 'Verbose Error', hint: 'In detailed error messages' },
    { id: 'flag-15', name: 'Debug Mode', hint: 'Application running in debug mode' },
    { id: 'flag-16', name: 'Source Code Comment', hint: 'HTML/JS source comments' },
    { id: 'flag-17', name: 'Robots.txt', hint: 'Check robots.txt file' },
    { id: 'flag-18', name: 'Swagger Docs', hint: 'Information leak in API docs' },
    { id: 'flag-19', name: 'Git Repository', hint: 'Exposed .git directory' },
    { id: 'flag-20', name: 'Master Hacker', hint: 'Final achievement for finding all flags' },
  ];

  useEffect(() => {
    loadCapturedFlags();
  }, []);

  const loadCapturedFlags = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/progress/flags`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCapturedFlags(response.data.flags || []);
    } catch (err) {
      console.error('Error loading flags:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!flagId || !flagInput) {
      setMessage('Please enter both flag ID and flag value');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/api/vulnerable/flags/${flagId}`,
        { flag: flagInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.correct) {
        setMessage('🎉 Correct flag! Well done!');
        setFlagInput('');
        setFlagId('');
        loadCapturedFlags();
      } else {
        setMessage('❌ Incorrect flag. Keep searching!');
      }
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const progress = (capturedFlags.length / allFlags.length) * 100;

  return (
    <div className="ctf-page">
      <div className="ctf-header">
        <h1>🏴‍☠️ CTF Side Quest: Flag Hunter</h1>
        <p>Find 20 hidden flags scattered throughout the application</p>
      </div>

      <div className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress > 10 && <span>{Math.round(progress)}%</span>}
          </div>
        </div>
        <div className="progress-text">
          {capturedFlags.length} / {allFlags.length} Flags Captured
        </div>
      </div>

      <div className="submit-section">
        <h2>Submit a Flag</h2>
        <form onSubmit={handleSubmit} className="flag-form">
          <div className="form-group">
            <label>Flag ID:</label>
            <select
              value={flagId}
              onChange={(e) => setFlagId(e.target.value)}
              required
            >
              <option value="">Select a flag...</option>
              {allFlags.map((flag) => (
                <option key={flag.id} value={flag.id}>
                  {flag.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Flag Value:</label>
            <input
              type="text"
              value={flagInput}
              onChange={(e) => setFlagInput(e.target.value)}
              placeholder="CTF{...}"
              required
            />
          </div>

          <button type="submit" className="btn-primary">Submit Flag</button>
        </form>

        {message && (
          <div className={`message ${message.includes('Correct') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="flags-grid">
        <h2>All Flags</h2>
        <div className="flags-list">
          {allFlags.map((flag) => {
            const captured = capturedFlags.some(f => f.flagId === flag.id);
            return (
              <div key={flag.id} className={`flag-card ${captured ? 'captured' : ''}`}>
                <div className="flag-header">
                  <span className="flag-status">
                    {captured ? '✅' : '🔒'}
                  </span>
                  <strong>{flag.name}</strong>
                </div>
                <div className="flag-id">ID: {flag.id}</div>
                <div className="flag-hint">💡 {flag.hint}</div>
                {captured && (
                  <div className="captured-badge">Captured!</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="tips-section">
        <h2>🔍 Flag Hunting Tips</h2>
        <ul>
          <li>Check browser DevTools (Console, Network, Application tabs)</li>
          <li>Inspect HTTP response headers</li>
          <li>Read source code and HTML comments</li>
          <li>Examine API responses and error messages</li>
          <li>Look in localStorage and sessionStorage</li>
          <li>Test various injection payloads</li>
          <li>Explore API documentation</li>
          <li>Use browser extensions like Wappalyzer</li>
          <li>Check for hidden files (robots.txt, .git, etc.)</li>
          <li>Analyze JWT tokens</li>
        </ul>
      </div>
    </div>
  );
}

export default CTFFlags;
