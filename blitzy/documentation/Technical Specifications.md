# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification

### 0.1.1 Core Security Objective

Based on the security concern described, the Blitzy platform understands that the security vulnerabilities to resolve are a comprehensive set of **configuration weaknesses** and **missing security controls** in a minimal Node.js HTTP server that currently operates with zero security infrastructure. The server (`server.js`) uses only the Node.js built-in `http` module with no framework, no middleware pipeline, no security headers, no input validation, no rate limiting, no HTTPS/TLS, and no CORS policies.

- **Vulnerability category:** Multiple vulnerabilities — Configuration weakness + Missing security controls
- **Severity level:** High — The server lacks all standard web security defenses recommended by OWASP for Node.js applications
- **Security requirements identified:**
  - Implement security HTTP response headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, etc.) via helmet.js middleware
  - Add input validation to sanitize and verify incoming request data before processing
  - Implement rate limiting to protect against brute-force and denial-of-service attacks
  - Add HTTPS/TLS support for encrypted transport
  - Update project dependencies (currently zero) by introducing security-focused packages
  - Integrate helmet.js as the primary security header middleware
  - Configure proper CORS policies to control cross-origin resource access
- **Implicit security needs surfaced:**
  - Migration from raw `http.createServer()` to Express.js framework, since helmet.js, cors, and express-rate-limit are Express middleware that require the Express middleware pipeline
  - Backward compatibility: the server must continue to respond with `Hello, World!` on port 3000
  - Zero downtime is not a concern — this is a test fixture, not a production service
  - No compliance requirements (GDPR, PCI-DSS, SOC2) apply, as confirmed by the existing tech spec (Section 6.4.4.3)

### 0.1.2 Special Instructions and Constraints

- **CRITICAL user directive:** "Confine all changes to the defined scope and nowhere else. Maintain all public interfaces, side effects, data flows, and dependencies unless the spec explicitly mandates adjustments. Do not refactor opportunistically. Avoid cascading changes, cross-file edits, or global updates. Changes must be minimal, isolated, and fully aligned with the scoped objective."
- **Project context:** "This codebase is a simple 'Hello World' Node.js server intended as a test project for integrating with Backprop, a tool or service likely used for code analysis, refactoring, or AI-assisted development. It's clearly marked as a test project and not meant for production use."
- **Change scope preference:** Minimal — only changes necessary to implement the specified security features
- **Behavioral preservation:** The server must continue to listen on `127.0.0.1:3000` and return `Hello, World!\n` with status 200 and `Content-Type: text/plain`
- **No web search requirements remain:** All security research has been completed

### 0.1.3 Technical Interpretation

This security vulnerability translates to the following technical fix strategy:

The current `server.js` operates as a bare Node.js HTTP server using `http.createServer()` with no security controls whatsoever. To implement the requested security features, the server architecture must be migrated from the raw `http` module to Express.js, which provides the middleware pipeline required by helmet.js, cors, express-rate-limit, and express-validator. This migration is the minimum necessary change to support the user's explicit request for helmet.js integration.

- To resolve **missing security headers**, we will add `helmet@8.1.0` as Express middleware, which sets 13 HTTP security response headers including Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, and X-Frame-Options
- To resolve **missing input validation**, we will add `express-validator@7.3.1` as middleware for sanitizing and validating incoming request data
- To resolve **missing rate limiting**, we will add `express-rate-limit@7.5.0` to limit repeated requests per IP address within configurable time windows
- To resolve **missing HTTPS support**, we will add HTTPS server capability using Node.js built-in `https` module alongside the Express application, with self-signed certificate generation instructions for the test environment
- To resolve **missing CORS policies**, we will add `cors@2.8.6` as Express middleware with a restrictive default configuration
- To resolve **zero dependency state**, we will add all above security packages plus `express@4.21.2` as the foundational framework

The user's understanding level is **explicit security concern** — specific features and tools (helmet.js) are named, indicating clear awareness of the security measures needed.

## 0.2 Vulnerability Research and Analysis

### 0.2.1 Initial Assessment

The following security-related information was extracted from the user's request and the existing codebase:

- **CVE numbers mentioned:** None — this is a proactive security hardening request, not a response to a specific CVE
- **Vulnerability names:** Missing security headers, absent input validation, no rate limiting, no HTTPS/TLS, no CORS configuration
- **Affected packages:** No external packages currently exist; the vulnerability is in the absence of security infrastructure itself
- **Symptoms described:** The server at `server.js` uses raw `http.createServer()` with zero security controls — no middleware, no headers, no validation, no encryption
- **Security advisories referenced:** None — this is a posture improvement initiative

### 0.2.2 Required Web Research Findings

Extensive web research was conducted across authoritative sources. Key findings:

- **Helmet.js (v8.1.0):** The latest stable version sets 13 HTTP security response headers by default. It is the standard security middleware for Express/Connect applications, with over 6,800 dependent npm packages. Helmet removes the `X-Powered-By` header and adds Content-Security-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Origin-Agent-Cluster, Referrer-Policy, Strict-Transport-Security, X-Content-Type-Options, X-DNS-Prefetch-Control, X-Download-Options, X-Frame-Options, X-Permitted-Cross-Domain-Policies, and X-XSS-Protection (disabled). No known vulnerabilities exist in v8.1.0.
- **CORS (v2.8.6):** The latest version of the Node.js CORS middleware. No direct vulnerabilities have been found per Snyk's vulnerability database. It supports dynamic origin validation, preflight handling, and configurable allowed methods/headers.
- **Express Rate Limit (v7.5.0):** Healthy maintenance status with over 25 million weekly downloads. No known vulnerabilities in the 7.x line. Provides configurable window-based IP rate limiting with built-in memory store.
- **Express Validator (v7.3.1):** Express middleware for validator.js with 1.2 million weekly downloads. Supports request body, query, param, header, and cookie validation with built-in sanitization. Requires Node.js 14+.
- **Express (v4.21.2):** The latest Express 4.x LTS release. Express 4.x remains in active LTS support. Express 5.x (v5.2.1) is the new default on npm but Express 4.x provides maximum ecosystem compatibility with all selected middleware packages.
- **OWASP Node.js Security Cheat Sheet** recommends: using helmet for security headers, validating/sanitizing all user input server-side, implementing rate limiting, using HTTPS for data in transit, and keeping npm packages updated.

### 0.2.3 Vulnerability Classification

| Aspect | Assessment |
|--------|-----------|
| Vulnerability type | Missing Security Controls (Headers, Validation, Rate Limiting, TLS, CORS) |
| Attack vector | Network — any local process can reach the server; if binding changes to `0.0.0.0`, remote network exposure |
| Exploitability | Medium — currently mitigated by localhost-only binding (`127.0.0.1`), but no defense-in-depth |
| Impact | Confidentiality (no TLS), Integrity (no input validation, no CSRF protection), Availability (no rate limiting) |
| Root cause | Bare-metal `http.createServer()` with no framework, no middleware pipeline, and no security libraries |

### 0.2.4 Web Search Research Conducted

| Source | Key Finding |
|--------|-------------|
| npmjs.com/package/helmet | Latest v8.1.0, sets 13 security headers, zero dependencies of its own |
| npmjs.com/package/cors | Latest v2.8.6, no known vulnerabilities per Snyk |
| npmjs.com/package/express-rate-limit | Latest v8.3.1 (using v7.5.0 for Express 4 compatibility) |
| npmjs.com/package/express-validator | Latest v7.3.1, requires Node.js 14+ |
| npmjs.com/package/express | Latest 4.x is v4.21.2 (LTS); v5.2.1 is latest overall |
| OWASP Node.js Security Cheat Sheet | Recommends helmet, input validation, rate limiting, HTTPS |
| helmetjs.github.io | Official docs confirm 13 headers set by default |
| expressjs.com/middleware/cors | Official CORS middleware documentation |
| express-rate-limit.mintlify.app | Official rate-limit documentation with memory store details |

## 0.3 Security Scope Analysis

### 0.3.1 Affected Component Discovery

The repository contains exactly 4 files with no subdirectories. A comprehensive search of all files reveals the following affected components:

| File | Affected | Reason |
|------|----------|--------|
| `server.js` | ✅ Yes | Core server logic must be migrated from raw `http` to Express with security middleware |
| `package.json` | ✅ Yes | Must add `dependencies` for express, helmet, cors, express-rate-limit, express-validator |
| `package-lock.json` | ✅ Yes | Will be regenerated after dependency installation |
| `README.md` | ❌ No | Per "minimal changes" rule, no documentation changes unless mandated |

Vulnerability affects **3 files** across **1 directory** (root).

Search patterns employed:
- Vulnerable package imports: Not applicable — zero imports of external packages exist
- Vulnerable code patterns: `http.createServer()` without middleware pipeline (`server.js`, line 6)
- Configuration files: `package.json` — no dependencies, no security configuration
- Dependency manifests: `package.json` — empty dependency graph; `package-lock.json` — root-only entry
- Docker files: None present
- CI/CD pipelines: None present

### 0.3.2 Root Cause Identification

The identified vulnerability exists in `server.js` due to the use of Node.js built-in `http.createServer()` without any security middleware, framework, or protective configuration. The root cause is architectural: the server was intentionally designed as a zero-dependency test fixture with no security controls, as documented in the tech spec:

- **Section 3.8.2:** "TLS/HTTPS: Not implemented — Plain HTTP only"
- **Section 3.8.2:** "Authentication: None — All requests served identically regardless of client"
- **Section 3.8.2:** "Input Validation: Not applicable — Request data is never inspected"
- **Section 6.4.1:** "The system implements no authentication, no authorization, no encryption, no session management, no input processing"

Vulnerability propagation trace:
- **Direct usage locations:** `server.js` (sole application file)
- **Indirect dependencies:** `package.json` and `package-lock.json` (dependency manifests that must be updated)
- **Configuration enablers:** Absence of any middleware pipeline in `server.js`; absence of any `dependencies` block in `package.json`

### 0.3.3 Current State Assessment

| Aspect | Current State |
|--------|--------------|
| Vulnerable package current version | No external packages — vulnerability is in the absence of security infrastructure |
| Vulnerable code pattern location | `server.js`, lines 1–14 — raw `http.createServer()` with no security middleware |
| Vulnerable configuration | `package.json` — zero `dependencies`; no security packages declared |
| Scope of exposure | Currently localhost-only (`127.0.0.1`) — internal only; no public-facing endpoints |
| Server binding | `127.0.0.1:3000` — loopback interface only |
| Response behavior | Uniform `200 OK` with `Hello, World!\n` for all requests regardless of method/path |
| Request handling | `req` parameter is completely ignored — no input inspection whatsoever |

## 0.4 Version Compatibility Research

### 0.4.1 Secure Version Identification

Since the project has zero existing dependencies, this section identifies the secure versions of packages to be introduced. All versions were verified via npm registry and security databases.

| Package | Version to Install | Rationale | Security Advisory |
|---------|-------------------|-----------|-------------------|
| express | ^4.21.2 | Latest Express 4.x LTS; maximum middleware ecosystem compatibility | No open CVEs; actively maintained with security patches |
| helmet | ^8.1.0 | Latest stable; sets 13 security headers by default | No known vulnerabilities (Snyk verified) |
| cors | ^2.8.6 | Latest version; no direct vulnerabilities found | Snyk: "No direct vulnerabilities have been found" |
| express-rate-limit | ^7.5.0 | Latest 7.x line; stable Express 4 compatibility; built-in memory store | No known vulnerabilities; healthy maintenance cadence |
| express-validator | ^7.3.1 | Latest version; comprehensive validation and sanitization | No known vulnerabilities; 1.2M weekly downloads |

### 0.4.2 Compatibility Verification

- **Node.js compatibility:** All selected packages are compatible with Node.js v20.x (the runtime present in the environment). Express 4.21.x requires Node.js v0.10+; helmet 8.x, cors 2.8.x, express-rate-limit 7.x, and express-validator 7.x all require Node.js 14+, which is satisfied.
- **npm compatibility:** The project uses npm v11.1.0 with lockfileVersion 3, which is fully compatible with all selected packages.
- **Inter-package compatibility:** All packages are designed as Express middleware and are verified compatible with Express 4.x. Helmet, cors, and express-rate-limit all follow the standard Express middleware signature `(req, res, next)`.
- **CommonJS compatibility:** The project uses CommonJS (`require()`) module syntax. All selected packages support CommonJS imports.
- **Version conflicts:** None identified. All packages have independent dependency trees with no known conflicts.
- **Breaking changes in upgrade path:** Not applicable — there are no existing packages to upgrade. This is a greenfield dependency introduction.

### 0.4.3 HTTPS Support Analysis

HTTPS support does not require an external package. Node.js provides the built-in `https` module, which can be used alongside Express to create an HTTPS server. Requirements:

- **TLS certificates:** Self-signed certificates for the test environment (generated via OpenSSL)
- **No additional npm package needed:** `https` is a Node.js core module
- **Compatibility:** Works with Express 4.x via `https.createServer(options, app)`
- **Consideration:** For a test fixture, self-signed certificates are acceptable; production would require CA-signed certificates

## 0.5 Security Fix Design

### 0.5.1 Minimal Fix Strategy

**PRINCIPLE:** Apply the smallest possible change that completely addresses all specified security requirements while preserving existing server behavior (responds with `Hello, World!` on port 3000).

**Fix approach:** Combination — Framework migration (raw `http` to Express) + Dependency addition + Security middleware integration + HTTPS server setup

**Framework Migration (prerequisite for all other fixes):**
- Migrate `server.js` from `http.createServer()` to Express application
- This is the minimum necessary change to support helmet.js, which is an Express/Connect middleware
- Preserve identical response behavior: status 200, Content-Type text/plain, body `Hello, World!\n`
- Preserve binding to `127.0.0.1:3000`

**Security Headers (helmet.js):**
- Add `app.use(helmet())` to the Express middleware pipeline
- This single call sets 13 HTTP security response headers including CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Helmet also removes the `X-Powered-By: Express` header, preventing server fingerprinting
- Side effects: None expected — helmet only adds/modifies response headers

**Input Validation (express-validator):**
- Add express-validator middleware with basic request sanitization
- Since the server currently has only a root endpoint returning static text, validation will be configured as a foundation for future endpoints
- A validation middleware utility will be established in `server.js` alongside the route definitions

**Rate Limiting (express-rate-limit):**
- Add `app.use(rateLimit({...}))` with a reasonable default window (15 minutes, 100 requests per IP)
- Uses built-in memory store — appropriate for single-process test fixture
- Side effects: Clients exceeding rate limit receive HTTP 429 Too Many Requests

**HTTPS Support:**
- Add HTTPS server using Node.js built-in `https` module wrapping the Express app
- Configure with self-signed certificate support (certificate paths configurable or generated)
- Maintain HTTP server on port 3000 for backward compatibility; add HTTPS on port 3443

**CORS Configuration:**
- Add `app.use(cors({...}))` with restrictive defaults: explicit origin, limited methods
- Preflight requests handled automatically at the application level

### 0.5.2 Security Improvement Validation

| Security Feature | How Fix Eliminates Vulnerability | Verification Method |
|-----------------|----------------------------------|-------------------|
| Security headers | Helmet sets 13 protective headers on every response | Inspect response headers via `curl -I` |
| Input validation | express-validator sanitizes/validates incoming data | Send malformed requests; verify rejection |
| Rate limiting | express-rate-limit blocks excessive requests per IP | Send >100 requests in 15 min; verify 429 response |
| HTTPS/TLS | https module encrypts data in transit | Connect via `https://127.0.0.1:3443`; verify TLS handshake |
| CORS | cors middleware restricts cross-origin access | Send cross-origin request; verify appropriate headers |
| Server fingerprinting | Helmet removes X-Powered-By header | Inspect response headers; verify absence |

### 0.5.3 Rollback Plan

If issues arise after applying security fixes:
- Revert `server.js` to original 14-line version using raw `http.createServer()`
- Remove all `dependencies` from `package.json`
- Delete `node_modules/` directory
- Regenerate `package-lock.json` with `npm install`
- The original behavior is fully documented and trivially restorable

## 0.6 File Transformation Mapping

### 0.6.1 File-by-File Security Fix Plan

| Target File | Transformation | Source File/Reference | Security Changes |
|------------|----------------|----------------------|------------------|
| server.js | UPDATE | server.js | Migrate from raw `http.createServer()` to Express app; add helmet, cors, rate-limit, express-validator middleware; add HTTPS server support alongside HTTP; preserve `Hello, World!` response behavior |
| package.json | UPDATE | package.json | Add `dependencies` block with express@^4.21.2, helmet@^8.1.0, cors@^2.8.6, express-rate-limit@^7.5.0, express-validator@^7.3.1; add `start` script; update `main` field to `server.js` |
| package-lock.json | UPDATE | package-lock.json | Regenerated automatically by `npm install` after adding dependencies |

### 0.6.2 Code Change Specifications

**File: `server.js`**
- **Lines affected:** 1–14 (entire file rewritten)
- **Before state:** Currently vulnerable because the server uses bare `http.createServer()` with no middleware pipeline, no security headers, no input validation, no rate limiting, no HTTPS, and no CORS — the `req` parameter is completely ignored
- **After state:** After fix, the server will run as an Express application with helmet (13 security headers), cors (cross-origin policy), express-rate-limit (IP-based rate limiting), express-validator (input validation foundation), and optional HTTPS support via the built-in `https` module, while still returning `Hello, World!\n` on the root endpoint at `127.0.0.1:3000`
- **Security improvement:** Eliminates all five vulnerability categories — missing security headers, missing input validation, missing rate limiting, missing HTTPS, and missing CORS

Key structural changes in `server.js`:
- Replace `const http = require('http')` with Express and security middleware imports
- Replace `http.createServer((req, res) => {...})` with Express app and route definitions
- Add middleware pipeline: `helmet()`, `cors()`, `rateLimit()`, `express.json()`
- Add HTTPS server creation using `https.createServer(tlsOptions, app)`
- Preserve hostname `127.0.0.1` and port `3000` for HTTP; add port `3443` for HTTPS
- Preserve response: status 200, Content-Type text/plain, body `Hello, World!\n`

**File: `package.json`**
- **Lines affected:** Lines 2–10 (multiple fields updated)
- **Before state:** Currently vulnerable because zero dependencies are declared — no security packages available
- **After state:** After fix, `dependencies` block will contain express, helmet, cors, express-rate-limit, and express-validator; `main` corrected to `server.js`; `start` script added
- **Security improvement:** Introduces all required security packages into the dependency manifest

Key changes in `package.json`:
- Add `"dependencies"` object with all five security packages
- Change `"main": "index.js"` to `"main": "server.js"` (corrects existing mismatch documented in Section 1.3.3)
- Add `"start": "node server.js"` to scripts block

### 0.6.3 Configuration Change Specifications

No standalone configuration files are created or modified. All security configuration is embedded within `server.js` as middleware options:

| Configuration | Location | Parameter | Current Value | New Value | Security Rationale |
|--------------|----------|-----------|--------------|-----------|-------------------|
| Security headers | server.js | `helmet()` defaults | Not present | 13 default headers enabled | Prevents clickjacking, MIME sniffing, XSS, and other header-based attacks |
| CORS policy | server.js | `cors({ origin, methods })` | Not present | Restrictive origin, limited HTTP methods | Prevents unauthorized cross-origin resource access |
| Rate limit window | server.js | `windowMs` | Not present | `15 * 60 * 1000` (15 minutes) | Defines rate-limiting time window |
| Rate limit max | server.js | `limit` | Not present | `100` requests per window | Prevents brute-force and DoS attempts |
| HTTPS port | server.js | `HTTPS_PORT` | Not present | `3443` | Enables encrypted transport |
| Body parsing | server.js | `express.json()` | Not present | Enabled with size limit | Required for input validation; prevents large payload attacks |

## 0.7 Dependency Inventory

### 0.7.1 Security Patches and Updates

Since the project currently has zero dependencies, all entries below represent new security packages being introduced rather than upgrades to vulnerable packages. Each package addresses a specific security gap identified in the analysis.

| Registry | Package Name | Current | Target Version | Security Gap Addressed | Severity |
|----------|-------------|---------|----------------|----------------------|----------|
| npm | express | (none) | ^4.21.2 | No middleware pipeline for security middleware | High |
| npm | helmet | (none) | ^8.1.0 | Missing 13 HTTP security response headers | High |
| npm | cors | (none) | ^2.8.6 | No CORS policy; uncontrolled cross-origin access | Medium |
| npm | express-rate-limit | (none) | ^7.5.0 | No rate limiting; vulnerable to brute-force/DoS | High |
| npm | express-validator | (none) | ^7.3.1 | No input validation; vulnerable to injection attacks | High |

### 0.7.2 Dependency Chain Analysis

- **Direct dependencies requiring addition:** express, helmet, cors, express-rate-limit, express-validator (5 packages)
- **Transitive dependencies affected:** These will be introduced automatically by Express and its peer dependencies (body-parser, cookie, debug, etc.) — all resolved and locked via `package-lock.json`
- **Peer dependencies to verify:** None — all selected packages are self-contained with no peer dependency requirements beyond Express itself
- **Development dependencies with vulnerabilities:** None — no devDependencies are being added (per minimal changes rule)

### 0.7.3 Import and Reference Updates

Source files requiring import updates:

- **`server.js`** — Add require statements for all new packages:
  - `const express = require('express')` — replaces `const http = require('http')`
  - `const helmet = require('helmet')` — security headers middleware
  - `const cors = require('cors')` — CORS middleware
  - `const rateLimit = require('express-rate-limit')` — rate limiting
  - `const { body, validationResult } = require('express-validator')` — input validation
  - `const https = require('https')` — built-in HTTPS module (not an npm dependency)
  - `const fs = require('fs')` — built-in fs module for TLS certificate loading

Import transformation summary:

| Before (Current) | After (Patched) |
|-------------------|----------------|
| `const http = require('http')` | `const express = require('express')` |
| (none) | `const helmet = require('helmet')` |
| (none) | `const helmet = require('helmet')` |
| (none) | `const cors = require('cors')` |
| (none) | `const rateLimit = require('express-rate-limit')` |
| (none) | `const { body, validationResult } = require('express-validator')` |
| (none) | `const https = require('https')` |
| (none) | `const fs = require('fs')` |

Configuration reference updates:
- `package.json` `"main"` field updated from `"index.js"` to `"server.js"` to resolve the existing mismatch
- `package.json` `"scripts"` block gains `"start": "node server.js"` for standard npm lifecycle support

## 0.8 Impact Analysis and Testing Strategy

### 0.8.1 Security Testing Requirements

**Vulnerability regression tests:**
- Verify that security headers are present in all HTTP responses after fix
- Verify that rate limiting activates after exceeding the configured threshold
- Verify that CORS headers are correctly set for cross-origin requests
- Verify that HTTPS endpoint accepts TLS connections
- Verify that malformed input is rejected by the validation middleware

**Specific attack scenarios to test:**
- Send requests without `Origin` header — should receive default CORS behavior
- Send >100 requests within 15 minutes from same IP — should receive HTTP 429
- Inspect response headers — should contain Content-Security-Policy, X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options, etc.
- Verify `X-Powered-By` header is absent (removed by helmet)
- Connect to HTTPS port 3443 — should complete TLS handshake

**Security-specific test cases to add:**
- Test security headers presence via `curl -I http://127.0.0.1:3000/`
- Test rate limiting via rapid sequential requests
- Test CORS by sending requests with various `Origin` headers
- Test HTTPS connectivity via `curl -k https://127.0.0.1:3443/`
- Test that the base response remains `Hello, World!\n` with status 200

**Existing tests to verify:**
- The current test script (`npm test`) is a placeholder that intentionally fails with `echo "Error: no test specified" && exit 1` — this is not affected by the security changes

### 0.8.2 Verification Methods

**Automated security scanning:**
- Tool: `npm audit`
- Expected result: Zero vulnerabilities reported for all newly added dependencies
- Command: `npm audit --production`

**Manual verification steps:**
- Start the server: `node server.js`
- Verify HTTP response: `curl -v http://127.0.0.1:3000/`
- Verify security headers: `curl -sI http://127.0.0.1:3000/ | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"`
- Verify rate limit headers: `curl -sI http://127.0.0.1:3000/ | grep -i "RateLimit"`
- Verify CORS headers: `curl -sI -H "Origin: http://example.com" http://127.0.0.1:3000/ | grep -i "Access-Control"`
- Verify X-Powered-By removal: `curl -sI http://127.0.0.1:3000/ | grep -i "X-Powered-By"` — should return empty
- Verify HTTPS: `curl -k https://127.0.0.1:3443/` — should return `Hello, World!`
- Verify response body unchanged: `curl -s http://127.0.0.1:3000/` — should output exactly `Hello, World!`

### 0.8.3 Impact Assessment

**Direct security improvements achieved:**
- Missing security headers: Eliminated — 13 headers set by helmet
- Missing rate limiting: Eliminated — IP-based rate limiting active
- Missing CORS policy: Eliminated — restrictive CORS configuration applied
- Missing HTTPS: Eliminated — TLS-encrypted transport available on port 3443
- Missing input validation: Eliminated — express-validator foundation in place
- Server fingerprinting: Eliminated — X-Powered-By header removed

**Minimal side effects on existing functionality:**
- The root endpoint (`GET /`) continues to return `Hello, World!\n` with status 200 and `Content-Type: text/plain`
- The server continues to bind to `127.0.0.1:3000` (HTTP)
- An additional HTTPS listener on port `3443` is added — this is additive, not replacing the HTTP server
- Rate-limited clients receive HTTP 429 instead of 200 — this is intentional security behavior, not a regression

**Potential impacts to address:**
- Express adds `X-Powered-By: Express` header by default — mitigated by helmet which removes it
- Rate limiting may affect rapid automated testing — mitigated by configurable limit (100 requests per 15-minute window)
- HTTPS requires TLS certificates — mitigated by self-signed certificate support for test environment
- `Content-Type` response header will include `charset=utf-8` when using Express `res.send()` — minimal behavioral difference

## 0.9 Scope Boundaries

### 0.9.1 Exhaustively In Scope

**Dependency manifests (updated with security packages):**
- `package.json` — add dependencies block with express, helmet, cors, express-rate-limit, express-validator
- `package-lock.json` — regenerated after `npm install` to reflect new dependency tree

**Source files with security changes:**
- `server.js` — migrate from raw `http` to Express; add helmet, cors, rate-limit, input validation, HTTPS middleware

**No additional files are in scope.** The repository contains only 4 files total (server.js, package.json, package-lock.json, README.md), and README.md is excluded per the minimal changes rule.

### 0.9.2 Explicitly Out of Scope

Per the user's implementation rules ("Confine all changes to the defined scope and nowhere else. Do not refactor opportunistically."):

- **Feature additions unrelated to security** — No new endpoints, routes, or application logic beyond what is needed for security middleware
- **README.md modifications** — The existing README with "Do not touch!" warning is preserved unchanged
- **Performance optimizations** — No changes beyond the required security middleware
- **Code refactoring beyond security requirements** — No restructuring into multiple files, no module extraction
- **Non-security dependencies** — No addition of testing frameworks, linting tools, or development utilities
- **Style or formatting changes** — No changes to code style, comments, or formatting in unaffected code
- **Test files** — No test framework installation (the placeholder test script is preserved)
- **CI/CD pipeline creation** — No GitHub Actions, no automated security scanning workflow
- **Docker containerization** — No Dockerfile creation
- **Environment variables** — No `.env` file creation (TLS certificate paths are configurable but not externalized)
- **Database or storage** — No data persistence layer
- **Authentication/authorization** — No user identity management (only rate limiting by IP)
- **Multi-file architecture** — Server remains a single-file `server.js` application per minimal changes rule
- **Items excluded by user instructions:**
  - No cascading changes to files beyond `server.js`, `package.json`, and `package-lock.json`
  - No global updates beyond the explicit security features requested
  - All public interfaces (server response body, status code, content type) preserved

## 0.10 Execution Parameters

### 0.10.1 Security Verification Commands

| Purpose | Command |
|---------|---------|
| Install dependencies | `npm install` |
| Dependency vulnerability scan | `npm audit --production` |
| Start server | `node server.js` |
| Verify HTTP response | `curl -s http://127.0.0.1:3000/` |
| Verify security headers | `curl -sI http://127.0.0.1:3000/` |
| Verify rate limiting | `for i in $(seq 1 105); do curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/; done` |
| Verify CORS headers | `curl -sI -H "Origin: http://example.com" http://127.0.0.1:3000/` |
| Verify HTTPS | `curl -k https://127.0.0.1:3443/` |
| Verify X-Powered-By removed | `curl -sI http://127.0.0.1:3000/ \| grep -c "X-Powered-By"` (expect 0) |
| Full test suite | `npm test` (currently placeholder — preserved as-is) |

### 0.10.2 Research Documentation

| Resource | URL | Usage |
|----------|-----|-------|
| Helmet.js official docs | https://helmetjs.github.io/ | Security header configuration reference |
| Helmet npm package | https://www.npmjs.com/package/helmet | Version verification and API docs |
| Express CORS middleware | https://expressjs.com/en/resources/middleware/cors.html | CORS configuration reference |
| CORS npm package | https://www.npmjs.com/package/cors | Version verification |
| Express Rate Limit docs | https://express-rate-limit.mintlify.app/overview | Rate limiting configuration reference |
| Express Rate Limit npm | https://www.npmjs.com/package/express-rate-limit | Version verification |
| Express Validator docs | https://express-validator.github.io | Validation chain reference |
| Express Validator npm | https://www.npmjs.com/package/express-validator | Version verification |
| OWASP Node.js Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html | Security best practices |
| Snyk cors analysis | https://security.snyk.io/package/npm/cors | Vulnerability database check |
| Snyk express-rate-limit | https://security.snyk.io/package/npm/express-rate-limit | Vulnerability database check |

**Security standards applied:**
- OWASP Top 10: Addressed via helmet (A05 Security Misconfiguration), input validation (A03 Injection), rate limiting (brute-force protection)
- OWASP Node.js Security Cheat Sheet: All applicable recommendations implemented

### 0.10.3 Implementation Constraints

| Constraint | Value |
|-----------|-------|
| Priority | Security fix first, minimal disruption second |
| Backward compatibility | Must maintain — server response body, status code, binding address preserved |
| Deployment considerations | Immediate — single-file server, no coordination required |
| Breaking changes | None to public interface; internal architecture changes from `http` to Express are encapsulated |
| Maximum files modified | 3 (server.js, package.json, package-lock.json) |
| New files created | 0 |
| Files deleted | 0 |

## 0.11 Special Instructions for Security Fixes

### 0.11.1 User-Specified Security Directives

The following directives were explicitly provided by the user and must be honored throughout implementation:

- **Change scope:** "Confine all changes to the defined scope and nowhere else." — Only `server.js`, `package.json`, and `package-lock.json` are modified. No other files are created, updated, or deleted.
- **No opportunistic refactoring:** "Do not refactor opportunistically." — The server remains a single-file application. No multi-file restructuring, no module extraction, no separation of concerns beyond what is required for security middleware integration.
- **Interface preservation:** "Maintain all public interfaces, side effects, data flows, and dependencies unless the spec explicitly mandates adjustments." — The server continues to respond on `127.0.0.1:3000` with `Hello, World!\n` (status 200, Content-Type text/plain). The console startup log is preserved.
- **Cascading change prevention:** "Avoid cascading changes, cross-file edits, or global updates." — Changes are isolated to exactly 3 files, all in the repository root.
- **Minimal alignment:** "Changes must be minimal, isolated, and fully aligned with the scoped objective." — Every change directly implements one of the six requested security features (security headers, input validation, rate limiting, HTTPS, helmet.js, CORS).
- **Project nature acknowledgment:** This is "a simple 'Hello World' Node.js server intended as a test project" — security features are implemented at the appropriate level for a test fixture, not an enterprise application.

### 0.11.2 Security Justification for Framework Migration

The migration from raw `http.createServer()` to Express is not an opportunistic refactoring. It is the minimum necessary architectural change to support the user's explicit request for **helmet.js**, which is an Express/Connect middleware. Without Express, helmet cannot be integrated. Similarly, `cors`, `express-rate-limit`, and `express-validator` all require the Express middleware pipeline. This migration is therefore a direct prerequisite of the security fix scope, not a discretionary refactoring.

### 0.11.3 Secrets and Credentials Management

- No secrets, API keys, or credentials are introduced by this fix
- TLS certificates for HTTPS are referenced by file path (not embedded in code)
- Self-signed certificates are generated locally for the test environment
- No `.env` file is created (per minimal changes rule) — certificate paths use sensible defaults with fallback behavior
- No credentials are stored in `package.json` or any other committed file

