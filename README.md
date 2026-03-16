# hao-backprop-test

A simple "Hello World" Node.js HTTP server used as a test project for Backprop integration validation.

> **Note:** This is a test fixture — not intended for production use.

## Overview

This project implements a minimal, deterministic HTTP server that responds with `Hello, World!` to every request. It serves as a controlled test fixture for Backprop integration testing. The server binds to `127.0.0.1:3000` and uses zero external dependencies.

## Project Structure

```
├── index.js                 # Root entry point — wires modules together
├── server.js                # Backward-compatible shim (delegates to index.js)
├── package.json             # npm manifest
├── package-lock.json        # Dependency lock file
├── README.md                # Project documentation
└── src/
    ├── config.js            # Server configuration constants (hostname, port)
    ├── handler.js           # HTTP request handler
    └── server.js            # Server creation and startup logic
```

## Usage

### Start the server

```bash
npm start
```

Or directly:

```bash
node index.js
```

For backward compatibility:

```bash
node server.js
```

### Test the server

Once running, the server responds to any HTTP request on `http://127.0.0.1:3000/`:

```bash
curl http://127.0.0.1:3000/
# Output: Hello, World!
```

## Architecture

The project follows a modular structure with separated concerns:

- **`src/config.js`** — Exports server configuration constants (`hostname`, `port`)
- **`src/handler.js`** — Exports the HTTP request handler function
- **`src/server.js`** — Creates and starts the HTTP server using config and handler modules
- **`index.js`** — Root entry point that invokes the server start function

## Design Principles

- **Zero Dependencies:** No external npm packages; uses only Node.js built-in modules
- **Deterministic Behavior:** Every request returns status `200`, `Content-Type: text/plain`, and body `Hello, World!\n`
- **Backward Compatible:** `node server.js` continues to work alongside `npm start`

## License

MIT
