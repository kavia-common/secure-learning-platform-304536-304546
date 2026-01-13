import React, { useState } from 'react';
import axios from 'axios';
import './LabPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// PUBLIC_INTERFACE
/**
 * Level 8: Unrestricted File Upload Lab
 * OWASP A05:2021 - Security Misconfiguration
 * 
 * Demonstrates file upload vulnerability with no validation,
 * allowing upload of executable files.
 */
function FileUploadLab() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [maliciousFile, setMaliciousFile] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setResponse({ status: 'error', message: 'Please select a file' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = sessionStorage.getItem('token');
      const result = await axios.post(
        `${API_BASE}/api/vulnerable/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setResponse(result.data);
    } catch (err) {
      setResponse({ 
        status: 'error', 
        message: err.response?.data?.message || err.message 
      });
    }
  };

  const generateMaliciousFile = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Malicious Upload</title>
</head>
<body>
  <h1>This is a malicious HTML file!</h1>
  <script>
    // This script executes when someone accesses the uploaded file
    alert('XSS via File Upload!');
    
    // Could steal cookies, session tokens, etc.
    console.log('Document Cookie:', document.cookie);
    
    // Could redirect to phishing site
    // window.location = 'https://evil.com/phishing';
  </script>
  <p>If this file is served from the application domain, it can access application resources!</p>
</body>
</html>`;
    
    setMaliciousFile(html);
  };

  return (
    <div className="lab-page">
      <div className="lab-header">
        <h1>🎯 Level 8: File Upload Vulnerability</h1>
        <span className="lab-badge difficulty-medium">Medium</span>
        <span className="lab-badge">OWASP A05</span>
      </div>

      <div className="lab-section">
        <h2>📝 Objective</h2>
        <p>
          Upload an executable file (like .html, .js, or .php) that should normally be blocked.
          The endpoint has no file type validation, content checking, or security controls,
          allowing arbitrary file uploads.
        </p>
      </div>

      <div className="lab-section vulnerability-warning">
        <h3>⚠️ Vulnerability Details</h3>
        <ul>
          <li><strong>Type:</strong> Unrestricted File Upload</li>
          <li><strong>Impact:</strong> Remote code execution, stored XSS, server compromise</li>
          <li><strong>Root Cause:</strong> No file validation or content filtering</li>
          <li><strong>Attack Vectors:</strong> Upload .html, .js, .php, .exe, shell scripts</li>
          <li><strong>OWASP:</strong> A05:2021 - Security Misconfiguration</li>
        </ul>
      </div>

      <div className="lab-interactive">
        <h2>📤 File Upload (Vulnerable)</h2>
        
        <form onSubmit={handleUpload} className="comment-form">
          <div className="form-group">
            <label>Select File:</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="*/*"
            />
            {selectedFile && (
              <div style={{marginTop: '8px', fontSize: '14px', color: '#6b7280'}}>
                Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
          
          <button type="submit" className="btn-primary">Upload File</button>
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
            {response.filePath && (
              <div style={{marginTop: '10px'}}>
                <strong>Access uploaded file at:</strong><br />
                <code>{API_BASE}{response.filePath}</code>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lab-section">
        <h2>🎭 Create Malicious File</h2>
        <button onClick={generateMaliciousFile} className="btn-primary">
          Generate Malicious HTML
        </button>

        {maliciousFile && (
          <div style={{marginTop: '15px'}}>
            <h3>Malicious HTML Content:</h3>
            <textarea
              value={maliciousFile}
              readOnly
              rows="15"
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
            <div style={{marginTop: '10px'}}>
              <p><strong>To exploit:</strong></p>
              <ol>
                <li>Copy the HTML above into a file named "malicious.html"</li>
                <li>Upload it using the form above</li>
                <li>Access the uploaded file URL (check response for path)</li>
                <li>The JavaScript will execute in victim's browser!</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <div className="lab-section">
        <h2>💀 Attack Scenarios</h2>
        <ul>
          <li><strong>Stored XSS:</strong> Upload HTML/SVG with malicious scripts</li>
          <li><strong>Web Shell:</strong> Upload PHP/JSP file for remote command execution</li>
          <li><strong>Phishing:</strong> Upload fake login page HTML</li>
          <li><strong>Malware Distribution:</strong> Upload .exe files disguised as documents</li>
          <li><strong>Path Traversal:</strong> Use filename like "../../etc/passwd" to overwrite system files</li>
          <li><strong>DoS:</strong> Upload massive files to exhaust storage</li>
        </ul>
      </div>

      <div className="lab-section">
        <h2>🛡️ Remediation</h2>
        <pre className="code-block">
{`// Bad (Vulnerable):
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Uses original name!
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  // No validation at all!
  res.json({ path: \`/uploads/\${req.file.filename}\` });
});

// Good (Secure):
const crypto = require('crypto');
const path = require('path');

// 1. Whitelist allowed file types
const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

const storage = multer.diskStorage({
  destination: 'uploads/',  // Store OUTSIDE web root!
  filename: (req, file, cb) => {
    // 2. Generate random filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, randomName + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // 3. Validate MIME type AND extension
  if (!allowedMimes.includes(file.mimetype) || 
      !allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file type'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // 4. Limit size (5MB)
});

router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  // 5. Scan for malware (in production)
  // 6. Store metadata in database
  // 7. Serve files through CDN or separate domain
  // 8. Set proper Content-Type and Content-Disposition headers
  res.json({ 
    success: true,
    fileId: req.file.filename  // Don't expose full path
  });
});

// 9. Serve files securely
router.get('/files/:fileId', requireAuth, async (req, res) => {
  // Verify user has access to this file
  // Set security headers
  res.setHeader('Content-Disposition', 'attachment');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Serve file...
});`}
        </pre>
      </div>

      <div className="lab-hint">
        💡 <strong>Hint:</strong> Try uploading a .html file with a <code>&lt;script&gt;</code> tag.
        The file will be saved without validation and can be accessed directly!
      </div>
    </div>
  );
}

export default FileUploadLab;
