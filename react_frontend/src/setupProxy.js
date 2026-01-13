const { createProxyMiddleware } = require('http-proxy-middleware');

// PUBLIC_INTERFACE
/**
 * Configure proxy middleware for React development server
 * This helps avoid CORS issues and ad-blocker interference by proxying API requests
 */
module.exports = function(app) {
  // Only proxy in development when using localhost
  const target = process.env.REACT_APP_API_BASE || 'http://localhost:3001';
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log(`[Proxy] ${req.method} ${req.path} -> ${target}${req.path}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          error: 'Proxy error',
          message: err.message 
        }));
      }
    })
  );
};
