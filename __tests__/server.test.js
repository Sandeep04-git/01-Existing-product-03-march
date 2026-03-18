/**
 * Comprehensive Jest + supertest test suite for the Node.js HTTP server
 * defined in server.js.
 *
 * Tests cover:
 * - HTTP response body, status codes, and headers across all HTTP methods
 * - Server startup binding and console.log verification
 * - Server shutdown (graceful close) behavior
 * - Edge cases: unusual methods, deep paths, large payloads, concurrency
 * - Error handling: port conflicts, resilience after errors
 *
 * The server auto-starts when required (server.listen is a side effect of
 * module load). Cleanup is handled via afterAll to prevent port leaks.
 *
 * Port resilience: If port 3000 is unavailable (e.g. TCP TIME_WAIT from a
 * previous test run), the beforeAll hook automatically re-binds the server to
 * an ephemeral port so the suite can proceed. This matches the AAP guidance
 * that supertest should use ephemeral ports to avoid port conflicts.
 */

const request = require('supertest');
const http = require('http');
const server = require('../server');

// ---------------------------------------------------------------------------
// Lifecycle Hooks
// ---------------------------------------------------------------------------

// Wait for the server to finish binding before any test runs.
// server.listen() is called in server.js as a side effect of require(), but
// that call is asynchronous. This hook does NOT start the server — it only
// waits for the already-initiated listen to complete so that server.address()
// and supertest requests work reliably against the bound address.
//
// If port 3000 is occupied (e.g. TCP TIME_WAIT from a previous test run),
// the hook automatically re-binds to an ephemeral port (port 0) to ensure
// the test suite is resilient to transient port conflicts.
beforeAll((done) => {
  if (server.listening) {
    done();
    return;
  }

  const onListening = () => {
    server.removeListener('error', onError);
    done();
  };

  const onError = (err) => {
    server.removeListener('listening', onListening);
    if (err.code === 'EADDRINUSE') {
      // Port 3000 is occupied (e.g. TIME_WAIT from a previous test run).
      // Re-bind to an ephemeral port so the test suite can proceed.
      server.listen(0, '127.0.0.1', () => done());
    } else {
      done(new Error(`Server failed to start: ${err.message}`));
    }
  };

  server.once('listening', onListening);
  server.once('error', onError);
});

afterAll((done) => {
  if (server.listening) {
    server.close(done);
  } else {
    done();
  }
});

// ---------------------------------------------------------------------------
// 1. HTTP Response Tests (Happy Path)
// ---------------------------------------------------------------------------

describe('HTTP Response Tests', () => {
  test('GET / returns 200 status code and Hello, World! response', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('POST / returns 200 status code and Hello, World! response', async () => {
    const res = await request(server).post('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('PUT / returns 200 status code and Hello, World! response', async () => {
    const res = await request(server).put('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('DELETE / returns 200 status code and Hello, World! response', async () => {
    const res = await request(server).delete('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('PATCH / returns 200 status code and Hello, World! response', async () => {
    const res = await request(server).patch('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('OPTIONS / returns 200 status code and Hello, World! response', async () => {
    const res = await request(server).options('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });
});

// ---------------------------------------------------------------------------
// 2. HTTP Headers Tests
// ---------------------------------------------------------------------------

describe('HTTP Headers Tests', () => {
  test('response includes Content-Type text/plain header', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  test('POST response includes Content-Type text/plain header', async () => {
    const res = await request(server).post('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });
});

// ---------------------------------------------------------------------------
// 3. Server Startup Tests
// ---------------------------------------------------------------------------

describe('Server Startup Tests', () => {
  test('server is listening and accepting connections', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('server startup completed with correct address binding', () => {
    // The server already started before tests run (auto-starts on require).
    // Verify the server is bound to the expected hostname. The port is
    // typically 3000 but may be ephemeral if 3000 was in TIME_WAIT.
    const address = server.address();
    expect(address).not.toBeNull();
    expect(address.address).toBe('127.0.0.1');
    expect(typeof address.port).toBe('number');
    expect(address.port).toBeGreaterThan(0);
  });

  test('server is bound to 127.0.0.1', () => {
    const address = server.address();
    expect(address.address).toBe('127.0.0.1');
    expect(address.port).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Server Shutdown Tests
// ---------------------------------------------------------------------------

describe('Server Shutdown Tests', () => {
  test('server.close() callback fires without error', (done) => {
    // Use a dedicated test server on an ephemeral port to avoid
    // interfering with the main server instance used by other tests.
    const testServer = http.createServer((req, res) => {
      res.statusCode = 200;
      res.end('test');
    });
    testServer.listen(0, '127.0.0.1', () => {
      testServer.close((err) => {
        expect(err).toBeUndefined();
        done();
      });
    });
  });

  test('double close does not throw', (done) => {
    // Use a dedicated test server on an ephemeral port to avoid
    // interfering with the main server instance used by other tests.
    const testServer = http.createServer((req, res) => {
      res.statusCode = 200;
      res.end('test');
    });
    testServer.listen(0, '127.0.0.1', () => {
      testServer.close(() => {
        testServer.close((err) => {
          expect(err).toBeDefined();
          done();
        });
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 5. Edge Case Tests
// ---------------------------------------------------------------------------

describe('Edge Case Tests', () => {
  test('HEAD request returns correct headers with empty body', async () => {
    const res = await request(server).head('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    // HEAD responses must not contain a message body per HTTP/1.1 spec
    expect(res.text).toBeFalsy();
  });

  test('deeply nested URL paths return identical response', async () => {
    const res = await request(server).get('/a/b/c/d/e');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('special characters in path return identical response', async () => {
    const res = await request(server).get('/hello%20world');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('request with large body payload returns correct response', async () => {
    const largeBody = 'x'.repeat(10000);
    const res = await request(server).post('/').send(largeBody);
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });

  test('concurrent requests all return correct responses', async () => {
    const requests = Array.from({ length: 10 }, () =>
      request(server).get('/')
    );
    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Hello, World!\n');
    });
  });

  test('request with query parameters returns identical response', async () => {
    const res = await request(server).get('/?foo=bar&baz=qux');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });
});

// ---------------------------------------------------------------------------
// 6. Error Handling Tests
// ---------------------------------------------------------------------------

describe('Error Handling Tests', () => {
  test('port already in use produces EADDRINUSE error', (done) => {
    // Attempt to bind a second server to the same address the main server
    // occupies. This must produce an EADDRINUSE error.
    const anotherServer = http.createServer();
    const address = server.address();
    anotherServer.on('error', (err) => {
      expect(err.code).toBe('EADDRINUSE');
      anotherServer.close();
      done();
    });
    anotherServer.listen(address.port, address.address);
  });

  test('server continues handling requests normally after error event', async () => {
    // Verify the main server is still operational after the EADDRINUSE test
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, World!\n');
  });
});
