# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification

### 0.1.1 Core Testing Objective

Based on the provided requirements, the Blitzy platform understands that the testing objective is to **create a comprehensive, new unit test suite** for the existing `server.js` file — a 14-line, zero-dependency Node.js HTTP server that uses the built-in `http` module to serve a static `Hello, World!\n` response on `127.0.0.1:3000`.

**Request Category:** Add new tests (greenfield test creation — no prior test infrastructure exists)

The user's requirements, restated with enhanced technical clarity:

- **Test HTTP responses:** Verify that every HTTP request to the server receives the exact response body `Hello, World!\n` (14 bytes), regardless of request method, path, headers, or body content. This validates the uniform handler behavior documented in functional requirement F-002.
- **Test status codes:** Assert that the HTTP response status code is always `200 OK` for all inbound requests, confirming F-002-RQ-001.
- **Test headers:** Confirm the `Content-Type` response header is set to `text/plain` on every response, validating F-002-RQ-002.
- **Test server startup/shutdown:** Validate that the server successfully binds to `127.0.0.1:3000`, emits the expected `console.log` message on startup, and can be gracefully shut down after testing. This covers functional requirements F-001 and F-003.
- **Test error handling:** Exercise scenarios where the server encounters atypical conditions — such as malformed requests, connection interruptions, and port conflicts — to document the server's behavior under stress.
- **Test edge cases:** Probe boundary conditions including unusual HTTP methods (e.g., `PATCH`, `OPTIONS`, `HEAD`), deeply nested URL paths, requests with large payloads, empty request bodies, and special characters in paths.

**Implicit testing needs surfaced:**
- The current `server.js` does not export any modules and auto-starts via `server.listen()` at load time. A minimal 1-line addition (`module.exports = server;`) is required to enable programmatic testing with supertest. This is the sole source code modification needed.
- Test lifecycle management (server setup/teardown between test suites) must be implemented via Jest's `beforeAll`/`afterAll` hooks.
- Since the server has zero conditional branches, edge case testing will focus on confirming the *uniform behavior guarantee* — that every possible request variation produces the identical response.

### 0.1.2 Special Instructions and Constraints

**User-specified implementation rule:**
- "Make minimal changes — Confine all changes to the defined scope and nowhere else. Maintain all public interfaces, side effects, data flows, and dependencies unless the spec explicitly mandates adjustments. Do not refactor opportunistically. Avoid cascading changes, cross-file edits, or global updates. Changes must be minimal, isolated, and fully aligned with the scoped objective."

**Derived testing constraints:**
- Source code modifications to `server.js` are limited to a single export statement necessary for testability — no refactoring, no restructuring, no behavioral changes.
- All test files must reside in a dedicated `__tests__/` directory following Jest's default discovery pattern.
- Tests must follow Node.js/Jest community conventions for HTTP server testing.
- The existing `package.json` `test` script placeholder must be updated to invoke Jest.
- No additional runtime dependencies may be introduced; only `devDependencies` for testing.

### 0.1.3 Technical Interpretation

These testing requirements translate to the following technical test implementation strategy:

- To **test HTTP responses**, we will **create** `__tests__/server.test.js` containing supertest-driven assertions that send requests to the server and validate the response body matches `Hello, World!\n` exactly.
- To **test status codes**, we will add assertions within the same test file verifying `res.statusCode === 200` across GET, POST, PUT, DELETE, PATCH, and OPTIONS methods.
- To **test headers**, we will assert `Content-Type: text/plain` is present in every response using supertest's `.expect('Content-Type', /text\/plain/)` chaining.
- To **test server startup/shutdown**, we will create tests that verify the server binds successfully, emits the correct log message (by spying on `console.log`), and closes cleanly via `server.close()`.
- To **test error handling**, we will create tests that verify default Node.js behavior when the server encounters abnormal conditions such as a port already in use.
- To **test edge cases**, we will create a dedicated `describe` block exercising unusual methods, deep paths, large payloads, special characters, and concurrent requests.

### 0.1.4 Coverage Requirements Interpretation

- **Explicit coverage targets:** None specified by the user.
- **Implicit coverage expectations:**
  - For a Node.js HTTP server project, industry-standard unit test coverage targets are ≥80% line coverage and ≥80% branch coverage.
  - Since `server.js` contains zero conditional branches, 100% branch coverage is inherently achievable.
  - The repository currently has 0% coverage (no tests exist), so the target is to achieve ≥90% line coverage of `server.js`.
- **To achieve comprehensive testing, coverage should include:**
  - The `http.createServer()` callback (request handler) — lines 6–9
  - The `server.listen()` callback (startup logger) — lines 12–14
  - The constant declarations (`hostname`, `port`) — lines 3–4
  - Response body, status code, and header assertions across all HTTP method variants

## 0.2 Test Discovery and Analysis

### 0.2.1 Existing Test Infrastructure Assessment

A comprehensive repository search was conducted to assess the current state of test infrastructure. The repository contains exactly four files at root level (`server.js`, `package.json`, `package-lock.json`, `README.md`) with zero subdirectories, zero test files, and zero test-related configuration.

**Repository analysis reveals a completely absent testing setup with zero existing coverage.**

| Search Pattern | Files Found | Result |
|---|---|---|
| `*test*`, `*spec*`, `test_*`, `*_test.*`, `*_spec.*` | 0 | No test files exist anywhere in the repository |
| `jest.config.*`, `.jest*` | 0 | No Jest configuration files |
| `mocha*`, `.mocharc.*` | 0 | No Mocha configuration files |
| `__tests__/`, `test/`, `spec/` | 0 | No test directories exist |
| `.coveragerc`, `.nycrc`, `c8` config | 0 | No coverage configuration |

**Infrastructure assessment results:**

| Component | Status | Evidence |
|---|---|---|
| Current testing framework | ❌ Absent | No `devDependencies` in original `package.json` |
| Test runner configuration | ❌ Absent | No `jest.config.js`, `.mocharc`, or equivalent |
| Coverage tools in use | ❌ Absent | No Istanbul (`nyc`), `c8`, or `--experimental-coverage` config |
| Mock/stub libraries | ❌ Absent | Zero dependencies of any kind in original manifest |
| Test data fixtures/factories | ❌ Absent | No fixture files; system is entirely stateless |
| CI/CD pipeline | ❌ Absent | No `.github/workflows/`, `.gitlab-ci.yml`, or `Jenkinsfile` |
| Test script | Placeholder | `package.json` script: `echo "Error: no test specified" && exit 1` |

**Critical testability finding:** The `server.js` file does not use `module.exports` and triggers `server.listen()` as a side effect at module load time. This means `require('./server')` will both start the server and return an empty object. To enable supertest-based testing, a single line `module.exports = server;` must be appended — the only source code change required.

### 0.2.2 Web Search Research Conducted

The following research was conducted to inform the testing strategy:

| Research Topic | Key Finding | Source |
|---|---|---|
| Jest 29 Node.js 20 compatibility | Jest 29.x supports Node.js 14.15, 16.10, 18.0 and above — fully compatible with Node.js 20.20.1 | jestjs.io upgrade guide |
| Jest latest stable release | Jest 30.3.0 is the latest major release, but Jest 29.7.0 remains the well-established stable branch | npm registry |
| Supertest for HTTP server testing | Supertest 7.x accepts `http.Server` or `Function`; auto-binds to ephemeral port if not already listening | npm supertest docs |
| Best practices for Node.js HTTP testing | Separate server creation from listening; export server for testability; use `afterAll` for cleanup | Community consensus from multiple guides |
| Jest + supertest integration patterns | Standard pattern: `const request = require('supertest'); request(server).get('/').expect(200)` | Jest/supertest documentation |
| CommonJS testing considerations | Jest 29.x works natively with CommonJS `require()` — no Babel or ESM configuration needed for this project | Jest migration guide |

## 0.3 Testing Scope Analysis

### 0.3.1 Test Target Identification

**Primary code to be tested:**

| Module/File | Path | Test Types Required |
|---|---|---|
| HTTP Server | `server.js` | Unit tests (handler response), integration tests (HTTP request/response cycle), edge case tests, error handling tests |

**Functions and code elements requiring test coverage:**

| Code Element | Lines | Test Categories Needed |
|---|---|---|
| `http.createServer()` callback (request handler) | 6–9 | Response body, status code, headers, method invariance, path invariance |
| `server.listen()` invocation | 12 | Server binding, port correctness, hostname correctness |
| `server.listen()` callback (startup logger) | 12–14 | Console output verification, single-emission guarantee |
| `hostname` constant | 3 | Value assertion (`127.0.0.1`) |
| `port` constant | 4 | Value assertion (`3000`) |

**Existing test file mapping:**

| Source File | Existing Test File | Test Categories Present |
|---|---|---|
| `server.js` | None — to be created | None — greenfield |

**Dependencies requiring mocking:**

| Dependency | Mock Strategy | Rationale |
|---|---|---|
| `console.log` | `jest.spyOn(console, 'log')` | Verify startup message content and emission count without polluting test output |
| `http` module | No mocking required | Supertest interacts with the real HTTP server; mocking `http` would defeat the test purpose |
| Port 3000 | Dynamic port via supertest | Supertest auto-binds to an ephemeral port, avoiding port conflicts with any running server instance |

### 0.3.2 Version Compatibility Research

Based on the current Node.js version (v20.20.1) and the project's CommonJS architecture, the recommended testing stack is:

| Tool | Recommended Version | Compatibility Rationale |
|---|---|---|
| Jest | 29.7.0 | Latest stable Jest 29.x release; fully supports Node.js 18+ including v20; well-established with extensive ecosystem support. Jest 30 is available but too new for stability guarantees. |
| Supertest | 7.0.0 | Compatible with Jest 29.x and Node.js 20; provides HTTP assertion capabilities for `http.Server` instances. Supertest 7.1.3+ is recommended by maintainers, but 7.0.0 is stable for this simple use case. |
| Jest Coverage (`--coverage`) | Built into Jest 29.7.0 | Jest includes Istanbul-based coverage reporting by default — no additional packages needed |
| Assertion Library | Built into Jest | Jest's `expect()` API provides comprehensive matchers — no external assertion library required (no Chai needed) |
| Mocking Library | Built into Jest | Jest's `jest.spyOn()` and `jest.fn()` cover all mocking needs — no Sinon required |

**Version conflict analysis:** No version conflicts exist. The project has zero production dependencies, and the two devDependencies (jest@29.7.0, supertest@7.0.0) have compatible transitive dependency trees verified via `npm install` completing with zero vulnerability warnings.

## 0.4 Test Implementation Design

### 0.4.1 Test Strategy Selection

**Test types to implement:**

- **Unit tests:** Focus on the isolated behavior of the HTTP request handler — verifying that the callback passed to `http.createServer()` sets the correct status code, header, and body for every request.
- **Integration tests:** Cover the full HTTP request/response cycle by sending real HTTP requests to the running server via supertest and asserting the complete response.
- **Edge case tests:** Address boundary conditions including unusual HTTP methods (`HEAD`, `OPTIONS`, `PATCH`, `TRACE`), deeply nested URL paths, requests with large payloads, special characters in URLs, and concurrent simultaneous requests.
- **Error handling tests:** Verify the server's behavior under abnormal conditions such as port-already-in-use scenarios, abrupt client disconnections, and server shutdown while requests are in-flight.
- **Startup/shutdown tests:** Validate server lifecycle events including successful binding, startup log emission, and graceful shutdown.

### 0.4.2 Test Case Blueprint

```
Component: HTTP Request Handler (server.js lines 6-9)
Test Categories:
- Happy path: GET / returns 200, text/plain, "Hello, World!\n"
- Happy path: POST / returns identical response
- Happy path: PUT, DELETE, PATCH, OPTIONS all return identical response
- Edge cases: Deeply nested paths (/a/b/c/d/e) return identical response
- Edge cases: Special characters in path (/hello%20world) return identical response
- Edge cases: HEAD request returns correct headers with empty body
- Edge cases: Request with large body payload still returns correct response
- Edge cases: Concurrent requests all return correct responses
- Error cases: Server handles abrupt connection close gracefully
```

```
Component: Server Startup (server.js lines 12-14)
Test Categories:
- Happy path: Server binds to 127.0.0.1:3000 without errors
- Happy path: Console.log emits "Server running at http://127.0.0.1:3000/"
- Edge cases: Startup log emitted exactly once per lifecycle
- Error cases: Port already in use produces expected error
```

```
Component: Server Shutdown
Test Categories:
- Happy path: server.close() callback fires without error
- Happy path: Server stops accepting connections after close
- Edge cases: Double close does not throw
```

### 0.4.3 Existing Test Extension Strategy

Not applicable — there are no existing test files to extend. All tests will be created from scratch.

### 0.4.4 Test Data and Fixtures Design

**Required test data structures:** None — the server is entirely stateless. All request data is generated inline within test cases.

**Fixture organization strategy:** No external fixtures needed. Test inputs (HTTP methods, paths, headers, bodies) are defined as constants within the test file's `describe` blocks.

**Mock object specifications:**

| Mock Target | Jest API | Usage |
|---|---|---|
| `console.log` | `jest.spyOn(console, 'log').mockImplementation(() => {})` | Suppress startup log output during tests; verify log message content and call count |

**Test database/state management:** Not applicable — the server maintains zero state between requests. No setup/teardown of data stores is required.

**Server lifecycle management:**

```
beforeAll: require server.js → server auto-starts → capture server reference
afterAll: call server.close() → wait for close callback → release port
```

This ensures each test suite starts with a running server and cleans up after all tests complete, preventing port leaks and dangling server processes.

## 0.5 Test File Transformation Mapping

### 0.5.1 File-by-File Test Plan

| Target Test File | Transformation | Source File/Test | Purpose/Changes |
|---|---|---|---|
| `__tests__/server.test.js` | CREATE | `server.js` | Comprehensive unit and integration test suite covering HTTP responses, status codes, headers, server startup/shutdown, error handling, and edge cases |
| `jest.config.js` | CREATE | N/A | Jest configuration file specifying test environment (`node`), coverage thresholds, and test match patterns |
| `server.js` | UPDATE | `server.js` | Add single line `module.exports = server;` to enable programmatic test access — no behavioral change |
| `package.json` | UPDATE | `package.json` | Update `scripts.test` from placeholder to `jest --coverage --verbose` |

### 0.5.2 New Test Files Detail

**`__tests__/server.test.js`** — Comprehensive server unit test suite

- **Test categories:**
  - Happy path: Standard HTTP methods return 200, `text/plain`, `Hello, World!\n`
  - Edge cases: Unusual methods, deep paths, special characters, large payloads, concurrent requests, HEAD method
  - Error cases: Port conflict detection, server shutdown behavior
  - Startup/shutdown: Binding verification, console log assertion, graceful close
- **Mock dependencies:**
  - `console.log` — spied via `jest.spyOn` to verify startup message
- **Assertions focus:**
  - Response status code equality (`200`)
  - Response header matching (`Content-Type: text/plain`)
  - Response body exact match (`Hello, World!\n`)
  - Console.log call count and argument verification
  - Server `.close()` callback invocation
  - Uniform behavior across all HTTP methods and paths

**`jest.config.js`** — Jest runner configuration

- **Configuration elements:**
  - `testEnvironment: 'node'` — Server-side testing environment
  - `testMatch: ['**/__tests__/**/*.test.js']` — Test discovery pattern
  - `coverageDirectory: 'coverage'` — Coverage output location
  - `collectCoverageFrom: ['server.js']` — Scope coverage to the source file
  - `verbose: true` — Detailed test output

### 0.5.3 Test Files to Modify Detail

**`server.js`** — Add export for testability (1 line)
- **Change:** Append `module.exports = server;` after line 14
- **Impact:** Enables `require('./server')` to return the `http.Server` instance for supertest
- **Behavioral change:** None — the server still auto-starts on `require()` and the export does not alter runtime behavior when executed via `node server.js`

**`package.json`** — Update test script
- **Change:** Replace `"test": "echo \"Error: no test specified\" && exit 1"` with `"test": "jest --coverage --verbose"`
- **Impact:** Enables `npm test` to run the Jest test suite with coverage reporting

### 0.5.4 Test Configuration Updates

| Config File | Update Description |
|---|---|
| `jest.config.js` | Create new file with `testEnvironment: 'node'`, coverage thresholds, and test match patterns |
| `package.json` `scripts.test` | Update from placeholder to `jest --coverage --verbose` |

### 0.5.5 Cross-File Test Dependencies

| Dependency Type | Location | Usage |
|---|---|---|
| Server instance | `server.js` (via `module.exports`) | Imported in `__tests__/server.test.js` as the system under test for supertest |
| Supertest library | `node_modules/supertest` | Used in `__tests__/server.test.js` to send HTTP requests and assert responses |
| Jest globals | Built-in | `describe`, `test`, `expect`, `beforeAll`, `afterAll`, `jest.spyOn` used throughout test file |

No shared fixtures, no test utility helpers, and no mock factories are required given the extreme simplicity of the system under test.

## 0.6 Dependency Inventory

### 0.6.1 Testing Dependencies

All testing packages are installed as `devDependencies` only — no production dependencies are added or modified.

| Registry | Package Name | Version | Purpose |
|---|---|---|---|
| npm | jest | 29.7.0 | Testing framework — provides test runner, assertion library (`expect`), mocking (`jest.fn`, `jest.spyOn`), and built-in coverage reporting (Istanbul) |
| npm | supertest | 7.0.0 | HTTP assertion library — sends real HTTP requests to the `http.Server` instance and provides chainable response assertions (`.expect(200)`, `.expect('Content-Type', ...)`) |

**Version verification:** Both versions were confirmed installed and functional in the project environment:
- `npx jest --version` → `29.7.0` ✓
- `npm ls --depth=0` confirms both packages resolved without conflicts ✓
- `npm install` completed with 0 vulnerabilities ✓

**Packages NOT required (and why):**

| Package | Reason Not Needed |
|---|---|
| `chai` | Jest includes a comprehensive assertion library (`expect`) built-in |
| `sinon` | Jest includes mocking/spying capabilities (`jest.fn()`, `jest.spyOn()`) built-in |
| `nyc` / `c8` | Jest includes Istanbul-based coverage reporting via `--coverage` flag |
| `mocha` | Jest is the selected framework — Mocha is not needed alongside Jest |
| `nock` | No outbound HTTP calls to mock — the server only receives requests |
| `@jest/globals` | CommonJS project uses global Jest APIs automatically |

### 0.6.2 Import Updates

**Test files requiring imports:**

- `__tests__/server.test.js`:
  - `const request = require('supertest');` — Import supertest for HTTP assertions
  - `const server = require('../server');` — Import the server instance (requires the `module.exports` addition to `server.js`)

**Import transformation rules:**
- Old: `server.js` has no exports → `require('./server')` returns `{}`
- New: `server.js` exports `server` → `require('./server')` returns `http.Server` instance
- Apply to: `__tests__/server.test.js` (the only consumer)

## 0.7 Coverage and Quality Targets

### 0.7.1 Coverage Metrics

| Metric | Current | Target | Rationale |
|---|---|---|---|
| Line coverage | 0% (no tests) | ≥90% | All 14 lines of `server.js` should be executed during tests; the `server.listen` callback and `createServer` handler together cover all executable code |
| Branch coverage | 0% (no tests) | 100% | The server contains zero conditional branches (`if`, `switch`, ternary) — 100% branch coverage is achieved by default |
| Function coverage | 0% (no tests) | 100% | Two functions exist (the `createServer` callback and the `listen` callback) — both will be exercised by the test suite |
| Statement coverage | 0% (no tests) | ≥90% | All ~10 statements in `server.js` are executed during normal server lifecycle |

**Coverage gaps to address:**

| Component | Current Coverage | Target Coverage | Focus Areas |
|---|---|---|---|
| Request handler (lines 6–9) | 0% | 100% | Supertest sends HTTP requests that invoke the handler, covering `res.statusCode`, `res.setHeader`, and `res.end` |
| Server startup (lines 12–14) | 0% | 100% | Requiring the module triggers `server.listen`, which fires the callback containing `console.log` |
| Constants (lines 3–4) | 0% | 100% | Constants are evaluated at module load — covered automatically when `server.js` is required |

### 0.7.2 Test Quality Criteria

| Criterion | Standard | Implementation |
|---|---|---|
| Assertion density | ≥2 assertions per test case | Each test validates at minimum the status code and one additional property (header, body, or behavior) |
| Test isolation | Each test is independent | Tests share a server instance started in `beforeAll` but make no state-altering changes; each test is self-contained |
| Performance constraints | Total suite execution < 10 seconds | With a stateless server and no external I/O, the full suite should complete in under 3 seconds |
| Maintainability standards | Clear test names, grouped by `describe` | Tests are organized into logical `describe` blocks (HTTP responses, startup, shutdown, edge cases, error handling) with descriptive `test` names |
| Repository conventions | Follow established patterns | Since no prior tests exist, Jest community conventions for Node.js HTTP server testing are adopted as the baseline |
| Deterministic results | Zero flaky tests | The server is deterministic (uniform response) — test results are reproducible on every run |

## 0.8 Scope Boundaries

### 0.8.1 Exhaustively In Scope

**New test files:**
- `__tests__/server.test.js` — Complete unit and integration test suite for `server.js`

**New test configuration:**
- `jest.config.js` — Jest runner and coverage configuration

**Source file modifications (minimal, testability-only):**
- `server.js` — Append `module.exports = server;` (1 line addition; no behavioral change)

**Package configuration updates:**
- `package.json` `scripts.test` — Replace placeholder with `jest --coverage --verbose`
- `package.json` `devDependencies` — Add `jest@29.7.0` and `supertest@7.0.0`

**Test coverage domains:**
- HTTP response body verification (`Hello, World!\n`)
- HTTP status code verification (`200 OK`)
- HTTP response header verification (`Content-Type: text/plain`)
- Server startup verification (binding to `127.0.0.1:3000`)
- Startup console log verification (`Server running at http://127.0.0.1:3000/`)
- Server shutdown verification (graceful `server.close()`)
- HTTP method invariance (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
- URL path invariance (`/`, `/foo`, `/bar/baz`, deeply nested paths)
- Edge cases (special characters, large payloads, concurrent requests)
- Error scenarios (port conflicts, connection handling)

### 0.8.2 Explicitly Out of Scope

| Exclusion | Rationale |
|---|---|
| Refactoring `server.js` beyond the single export line | User rule: "Make minimal changes" — no restructuring, no extracting functions, no converting to ES modules |
| Adding routing, middleware, or new functionality | Tests validate existing behavior only — no feature additions |
| Modifying `README.md` | README states "Do not touch!" and is not a test artifact |
| Modifying `package-lock.json` manually | Lock file is auto-generated by `npm install` |
| End-to-end (E2E) testing with browser automation | No UI exists; supertest-based HTTP testing is sufficient |
| Performance/load testing | Sub-millisecond response with no variability — benchmarking is unnecessary |
| Security testing (SAST/DAST/SCA) | Zero dependencies, no input processing, no auth — no security surface to test |
| CI/CD pipeline configuration | No pipeline exists; automated test integration is out of scope per the minimal change principle |
| Docker/containerization | No container infrastructure exists or is needed |
| TypeScript conversion | Project uses CommonJS JavaScript; no type system changes |
| Test files unrelated to `server.js` | The user's request is scoped exclusively to `server.js` |
| Production dependency additions | Only `devDependencies` are modified |

## 0.9 Execution Parameters

### 0.9.1 Testing-Specific Instructions

| Command | Purpose | Exact Invocation |
|---|---|---|
| Run all tests | Execute the full test suite with coverage | `npm test` (resolves to `jest --coverage --verbose`) |
| Run tests directly via Jest | Bypass npm script; useful for debugging | `npx jest --verbose` |
| Coverage measurement | Generate Istanbul coverage report | `npx jest --coverage` |
| Single test execution | Run a specific test file | `npx jest __tests__/server.test.js` |
| Single test by name | Run a specific test case by match | `npx jest -t "returns 200 status code"` |
| Debug mode | Run with Node.js inspector | `node --inspect-brk node_modules/.bin/jest --runInBand` |
| CI mode (no watch) | Non-interactive execution for automation | `CI=true npx jest --watchAll=false --ci --coverage` |

**Test patterns to follow in the repository:**
- No prior test patterns exist. The Jest + supertest community convention for Node.js HTTP server testing is adopted as the standard:
  - Test files placed in `__tests__/` directory
  - Test files named `*.test.js`
  - Tests organized into `describe` blocks by concern
  - Server lifecycle managed via `beforeAll`/`afterAll` hooks
  - Supertest used for HTTP request/response assertions

**Excluded test categories:**
- No E2E tests (no browser UI)
- No snapshot tests (responses are static strings, not serializable component trees)
- No performance benchmarks

**Environment setup requirements for tests:**
- Node.js v20.x runtime (v20.20.1 confirmed)
- npm v11.x package manager (v11.1.0 confirmed)
- `npm install` must complete before first test run to install `devDependencies`
- No environment variables required
- No database or external service connections needed
- No Docker containers or network configuration needed

## 0.10 Special Instructions for Testing

### 0.10.1 Testing-Specific Requirements

The following directives are derived from the user's explicit implementation rule and the nature of the testing task:

- **Minimal change principle:** ONLY modify `server.js` with a single `module.exports = server;` line and update `package.json` `scripts.test`. All other modifications are confined to new test-related files (`__tests__/server.test.js`, `jest.config.js`).
- **DO NOT modify source code** beyond the single export statement. No refactoring of the request handler, no extraction of constants, no restructuring of the `server.listen()` call.
- **No existing test patterns to follow** — adopt Jest + supertest community conventions for Node.js HTTP server testing as the standard.
- **Maintain test isolation** — each test case must be independent and produce the same result regardless of execution order. The server's stateless design inherently supports this.
- **Use Jest built-in mocking** for `console.log` spying — no external mocking libraries (Sinon, testdouble) are permitted.
- **Ensure all tests can run independently** — the shared server instance in `beforeAll` does not introduce state coupling since the server produces identical responses to every request.
- **Match CommonJS conventions** — all test files must use `require()`/`module.exports` syntax consistent with the project's existing JavaScript style.
- **Server lifecycle management** — the test suite must cleanly start and stop the server to prevent port leaks. Use `afterAll(() => server.close())` to guarantee cleanup.
- **No cascading changes** — the addition of testing must not alter the runtime behavior of `server.js` when executed via `node server.js`. The export statement is inert in the direct-execution context.
- **Preserve determinism** — all test assertions validate the server's deterministic, uniform behavior. No tests should rely on timing, randomness, or external state.

