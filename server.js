/**
 * @module server
 * @description A minimal Node.js HTTP server that listens on a specified
 * hostname and port, responding to every incoming request with a plain-text
 * "Hello, World!" message.
 * @author hxu
 * @license MIT
 * @requires http
 */

// Import the built-in Node.js HTTP module for creating the HTTP server
const http = require('http');

// Server configuration constants — hostname and port for the HTTP server
/**
 * @constant {string} hostname
 * @description The hostname the server binds to. Set to localhost (loopback)
 * to only accept connections from the local machine.
 * @default '127.0.0.1'
 */
const hostname = '127.0.0.1';

/**
 * @constant {number} port
 * @description The TCP port number the server listens on for incoming HTTP requests.
 * @default 3000
 */
const port = 3000;

/**
 * @description Creates an HTTP server that handles all incoming requests with a
 * uniform response. The request handler callback processes every request regardless
 * of HTTP method or URL path, returning a plain-text "Hello, World!" message.
 * @param {http.IncomingMessage} req - The incoming HTTP request object.
 * @param {http.ServerResponse} res - The server response object used to send data back to the client.
 */
const server = http.createServer((req, res) => {
  // Set the HTTP status code to 200 (OK) indicating a successful response
  res.statusCode = 200;
  // Set the Content-Type header to indicate plain text response format
  res.setHeader('Content-Type', 'text/plain');
  // Send the response body and signal that the response is complete
  res.end('Hello, World!\n');
});

/**
 * @description Binds the server to the specified hostname and port. Once the server
 * is ready to accept connections, the callback logs the server URL to the console.
 */
server.listen(port, hostname, () => {
  // Log the server URL to confirm successful startup
  console.log(`Server running at http://${hostname}:${port}/`);
});
