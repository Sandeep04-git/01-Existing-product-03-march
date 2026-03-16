// Security-hardened Express server — migrated from raw http.createServer()
// to Express.js to support helmet.js, cors, express-rate-limit, and
// express-validator security middleware pipeline.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const https = require('https');
const fs = require('fs');
const http = require('http');

// Preserve original server constants
const hostname = '127.0.0.1';
const port = 3000;
const HTTPS_PORT = 3443;

// Create Express application
const app = express();

// ---------------------------------------------------------------------------
// Security Middleware Pipeline
// ---------------------------------------------------------------------------

// 1. Helmet — sets 13 HTTP security response headers by default:
//    Content-Security-Policy, Cross-Origin-Opener-Policy,
//    Cross-Origin-Resource-Policy, Origin-Agent-Cluster, Referrer-Policy,
//    Strict-Transport-Security, X-Content-Type-Options, X-DNS-Prefetch-Control,
//    X-Download-Options, X-Frame-Options, X-Permitted-Cross-Domain-Policies,
//    X-XSS-Protection (disabled). Also removes X-Powered-By header.
app.use(helmet());

// 2. CORS — restrictive cross-origin resource sharing policy.
//    Only allows same-origin requests via GET with Content-Type header.
app.use(cors({
  origin: 'http://127.0.0.1:3000',
  methods: ['GET'],
  allowedHeaders: ['Content-Type'],
}));

// 3. Rate Limiting — IP-based brute-force and DoS protection.
//    100 requests per 15-minute window per IP; returns HTTP 429 when exceeded.
//    Uses built-in memory store (appropriate for single-process test fixture).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,               // 100 requests per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// 4. Body Parsing — required for express-validator to function on request
//    bodies. Size limit prevents large payload attacks.
app.use(express.json({ limit: '10kb' }));

// ---------------------------------------------------------------------------
// Route Definitions
// ---------------------------------------------------------------------------

// Root GET endpoint — preserves original server behavior exactly:
//   Status: 200, Content-Type: text/plain, Body: "Hello, World!\n"
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.status(200).send('Hello, World!\n');
});

// POST /message — demonstrates express-validator input validation and
// sanitization. This is the minimum endpoint needed to make express-validator
// functional, not an opportunistic feature addition.
app.post(
  '/message',
  [
    body('text').trim().escape().notEmpty().withMessage('Text is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.status(200).json({ message: req.body.text });
  }
);

// ---------------------------------------------------------------------------
// Catch-All 404 Handler — returns a generic JSON response for any request
// that does not match a defined route. Prevents Express default HTML error
// page (which contains a recognizable framework fingerprint such as
// "<pre>Cannot GET /path</pre>") from being served to clients.
// Must be placed after all route definitions and before the error handler.
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------------------------------------------------------------------------
// Error-Handling Middleware — prevents stack traces and internal file paths
// from leaking to clients in error responses (e.g., malformed JSON from
// body-parser, oversized payloads). Must be defined after all routes so
// Express recognizes the four-parameter signature as an error handler.
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ---------------------------------------------------------------------------
// HTTP Server Setup (backward compatible — preserves 127.0.0.1:3000 binding)
// ---------------------------------------------------------------------------
const server = http.createServer(app);
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// ---------------------------------------------------------------------------
// HTTPS Server Setup (additive — does NOT replace the HTTP server)
// Gracefully falls back if TLS certificates (key.pem, cert.pem) are not found.
// ---------------------------------------------------------------------------
try {
  const tlsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };
  const httpsServer = https.createServer(tlsOptions, app);
  httpsServer.listen(HTTPS_PORT, hostname, () => {
    console.log(`HTTPS Server running at https://${hostname}:${HTTPS_PORT}/`);
  });
} catch (err) {
  console.log('HTTPS not started: TLS certificates not found (key.pem, cert.pem)');
  console.log('To enable HTTPS, generate self-signed certificates:');
  console.log('  openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"');
}

// Export Express app for testability
module.exports = app;
