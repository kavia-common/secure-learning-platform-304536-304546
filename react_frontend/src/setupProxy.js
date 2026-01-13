const { createProxyMiddleware } = require('http-proxy-middleware');

// PUBLIC_INTERFACE
/**
 * Configure proxy middleware for React development server
 * This helps avoid CORS issues and ad-blocker interference by proxying API requests
 * Ensures proper handling of OPTIONS preflight requests for CORS
 */
module.exports = function(app) {
  // Use HTTP for backend connection (backend runs on HTTP, not HTTPS)
  const target = process.env.REACT_APP_API_BASE || 'http://localhost:3001';
  
  console.log(`[Proxy] Configuring proxy to target: ${target}`);
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false, // Accept self-signed certificates (not needed for HTTP, but safe to keep)
      logLevel: 'debug',
      ws: false, // Disable WebSocket proxying on this middleware
      followRedirects: true,
      // Ensure proper headers for CORS preflight
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.path} -> ${target}${req.path}`);
        
        // Ensure OPTIONS requests pass through correctly
        if (req.method === 'OPTIONS') {
          console.log('[Proxy] Handling OPTIONS preflight request');
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log response for debugging
        console.log(`[Proxy Response] ${proxyRes.statusCode} for ${req.method} ${req.path}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', {
          message: err.message,
          code: err.code,
          method: req.method,
          path: req.path,
          target: target
        });
        
        // Return proper error response
        if (!res.headersSent) {
          res.writeHead(502, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ 
            error: 'Backend Gateway Error',
            message: `Unable to reach backend at ${target}`,
            details: err.message,
            hint: 'Ensure backend is running on port 3001 with HTTP (not HTTPS)'
          }));
        }
      }
    })
  );
};
