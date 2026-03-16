/**
 * HTTP Request Handler Module
 *
 * Encapsulates the HTTP response logic for the Hello World server.
 * This is a pure function module with no imports — it handles all
 * incoming HTTP requests by responding with a deterministic plain-text
 * "Hello, World!" message regardless of method, path, or headers.
 *
 * Extracted from the original monolithic server.js (lines 6-9).
 */

/**
 * Handles an incoming HTTP request by sending a plain-text "Hello, World!" response.
 *
 * @param {import('http').IncomingMessage} req - The incoming HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP server response object.
 */
function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
}

module.exports = handler;
