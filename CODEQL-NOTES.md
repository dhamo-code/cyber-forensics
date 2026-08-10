# CodeQL Security Findings — Developer Notes

This file documents the 20 CodeQL findings, their actual risk level in
this application's context, and the remediation status.

## Critical — Server-Side Request Forgery (SSRF)
**Files:** `intelligence/virusTotal.js` (lines 13, 51), `intelligence/geoIP.js` (line 23)

**What CodeQL found:** User-supplied URLs/IPs are passed to external API calls
(VirusTotal, AbuseIPDB, ip-api.com) without an allowlist check.

**Actual risk in this app:** Medium — the URLs are passed TO a third-party
API (VirusTotal) for scanning, not fetched by our own server. However,
CodeQL is correct that an attacker could supply an internal IP like
`192.168.1.1` or `localhost` and the backend would forward it.

**Planned fix:**
```js
// Add IP/URL validation before passing to external APIs
const BLOCKED_PATTERNS = [/^localhost/i, /^127\./, /^192\.168\./, /^10\./];
if (BLOCKED_PATTERNS.some(p => p.test(input))) {
  return res.status(400).json({ error: 'Private/internal addresses not allowed' });
}
```
**Status:** Identified, fix scheduled for next sprint.

---

## High — Missing Rate Limiting
**File:** `routes/Admin.routes.js` (lines 11, 40)

**What CodeQL found:** Admin routes don't have route-specific rate limiting.

**Context:** A global rate limiter (200 req/15min) is applied at the app
level in `app.js`. CodeQL flags individual routes that don't have their
own limiter. The global limiter provides baseline protection.

**Planned fix:** Add a stricter admin-specific rate limiter:
```js
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
router.use(adminLimiter);
```
**Status:** Global limiter active. Route-specific limiter scheduled.

---

## High — Bad HTML Filtering Regex
**File:** `ai/patternMatcher.js` (line 13)

**What CodeQL found:** The XSS regex is flagged as insufficient for HTML filtering.

**Clarification:** This regex is NOT used for sanitization — it is used
for DETECTION only. The system detects and alerts on XSS patterns in
log files. It does not sanitize or filter user input for output. CodeQL's
rule assumes regex is being used to clean output, which is incorrect here.
This is a false positive in this context.

**Status:** False positive — no fix needed. Added code comment to clarify.

---

## High — Database Query from User-Controlled Sources
**Files:** `services/report.service.js`, `services/cases.service.js`,
`services/auth.service.js`, `routes/Admin.routes.js`, `controllers/logs.controller.js`

**What CodeQL found:** User-supplied values (IDs, filters) are used in
MongoDB queries without explicit sanitization at the query level.

**Context:** `express-mongo-sanitize` middleware is applied globally in
`app.js` — it strips `$` operators from `req.body`, `req.query`, and
`req.params` before any route handler runs. Mongoose schema validation
provides a second layer (ObjectId casting rejects non-ObjectId strings).

**Why CodeQL still flags it:** CodeQL performs static analysis and cannot
see that the sanitizer middleware runs before these service calls. It
flags the pattern regardless.

**Status:** Mitigated by `express-mongo-sanitize` at middleware level.
Additional per-query validation can be added as defense-in-depth.

---

## High — Uncontrolled Data in Path Expression
**Files:** `utils/crypto.js` (line 8), `controllers/logs.controller.js` (line 19)

**What CodeQL found:** User-supplied data may influence file paths.

**Context:** File upload paths use `crypto.randomBytes()` for filenames
(not user-supplied names). The log controller path issue relates to how
uploaded files are referenced after Multer processes them.

**Planned fix:** Add `path.basename()` normalization on all file path
construction to prevent any path traversal even if Multer configuration
changes.

**Status:** Partially mitigated by randomized filenames in upload config.
Full path normalization scheduled.

---

## Summary

| Category | Count | Status |
|---|---|---|
| SSRF (Critical) | 3 | Fix scheduled — input allowlist |
| Missing rate limit (High) | 2 | Global limiter active, route limiter scheduled |
| Bad HTML regex (High) | 1 | False positive — detection, not sanitization |
| DB query from user input (High) | 12 | Mitigated by express-mongo-sanitize middleware |
| Path expression (High) | 2 | Partially mitigated, fix scheduled |

All findings have been reviewed. Critical and High issues are either
mitigated at the middleware layer or have scheduled fixes. No findings
represent an immediate exploitable vulnerability in the current
deployment configuration.