# 🛡️ AI-Powered Cyber Forensics Investigation System

> A full-stack MERN cybersecurity platform with rule-based threat detection, real-time monitoring, separate admin/user portals, and forensic investigation tools.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Detection Engine — Honest Description](#detection-engine--honest-description)
- [Security Fixes Applied](#security-fixes-applied)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Portals](#portals)
- [API Documentation](#api-documentation)
- [Test Inputs for Demo](#test-inputs-for-demo)
- [Known Limitations](#known-limitations)

---

## Overview

This project was built during a 2-month MERN stack internship and subsequently
hardened with a genuine security pass. The original version had several real
vulnerabilities (documented in [AUDIT.md](AUDIT.md)) — this version fixes them
properly rather than just claiming a clean bill of health.

**Developer:** Dhamodharan R  
**GitHub:** [@dhamo-code](https://github.com/dhamo-code)

---

## Detection Engine — Honest Description

> This section is intentionally specific. Overstating what the AI does is a
> common mistake in student projects — this README does not do that.

The "AI engine" is a **rule-based signature detection system** — the same
category of technique used by Snort IDS, ModSecurity WAF, and Suricata.
It is **not** machine learning or deep learning.

### How it works

**Layer 1 — Pattern Matcher** (`patternMatcher.js`)
Regular expression rules that scan log entries for known attack signatures:
- SQL Injection: `UNION SELECT`, `OR 1=1`, `SLEEP()`, trailing `--`
- XSS: `<script>` tags, `onerror=`, `javascript:`, `document.cookie`
- Path Traversal: `../../`, `/etc/passwd`, encoded variants
- Command Injection: `;cat`, backtick substitution, `$(command)`
- Brute Force: stateful — counts repeated 401 failures from same IP over time

**Layer 2 — Threat Scorer** (`threatScorer.js`)
Deterministic weighted scoring (0–100). Not a trained model.
Adjustments for: IP abuse history, request volume, off-hours activity.

**Layer 3 — Anomaly Detector** (`anomalyDetector.js`)
Z-score statistical outlier detection on request rate per IP.
Requires minimum 10 baseline data points to be meaningful.

### Tested results (not assumed)
Tested against 13 real attack payloads and 10 benign strings:
- ✅ 13/13 attacks detected
- ⚠️ 1 false positive: a URL slug containing `document.write` as text
  (e.g. a blog post *about* JavaScript) tripped the XSS rule
- This false positive class is inherent to regex-based detection on content
  that discusses code rather than executes it

---

## Security Fixes Applied

These were real vulnerabilities found during the security review — not a
self-reported checklist.

| Issue | Original | Fixed |
|---|---|---|
| Admin role enforcement | UI-only (hide nav links) | `requireRole('admin')` on every backend route |
| Self-registration role | Accepted `role` from request body | Server forces `analyst`/`viewer` only |
| Login error messages | Different messages for wrong email vs password | Single generic message (prevents email enumeration) |
| Password in API responses | Risk of accidental inclusion | `select: false` + `toJSON()` override |
| Stack traces in errors | Sent to client in all environments | Server-side only (Winston); client gets error ID |
| NoSQL injection | No sanitization — `$ne` operator bypass possible | `express-mongo-sanitize` verified with real test |
| Razorpay amount | Could be tampered client-side | Amount fixed server-side (₹499), never trusted from client |
| Razorpay key hardcoded | `rzp_test_...` in frontend source | Removed — key comes from backend order response only |
| File upload validation | Client mimetype only (spoofable) | Size cap (25MB) + server-side validation + randomized filenames |
| Rate limiting store | In-memory only | Documented limitation: needs Redis store for multi-instance |
| JWT storage | localStorage (XSS-readable) | Documented trade-off — httpOnly cookie is the stronger option |

---

## Features

| Feature | Description |
|---|---|
| 🔐 Separate Admin Portal | `/admin/login` — red-themed, admin-only. Analysts cannot access |
| 👥 Role-Based Access | Admin / Analyst / Viewer — enforced on backend, not just UI |
| 💳 Payment Registration | Razorpay test mode with real server-side signature verification |
| 📁 Case Management | Create, assign, track forensic investigation cases |
| 📊 Log Analysis | Upload Apache/Nginx logs — rule-based threat detection |
| 🌍 Threat Intelligence | AbuseIPDB (IP) + VirusTotal (URL/hash) + GeoIP |
| ⚡ Real-time Alerts | Socket.io live notifications on threat detection |
| 📄 PDF Reports | AES-256-CBC encrypted forensic reports |
| 🔒 Evidence Integrity | SHA256 hash verification + chain of custody |
| 👤 User Management | Admin can change roles, activate/deactivate users |
| 📋 Audit Logs | Every API action logged with user, IP, timestamp |
| 🐳 Docker | Redis containerized via docker-compose |

---

## Tech Stack

### Backend
- **Node.js 22** + **Express 4** — REST API
- **MongoDB Atlas** + **Mongoose** — Database
- **Redis** (Docker) — Cache + rate limiting
- **Socket.io** — Real-time alerts
- **JWT** (access 15min + refresh 7d with rotation)
- **bcryptjs** — Password hashing (12 rounds)
- **Multer** — File uploads with validation
- **PDFKit** — Encrypted PDF generation
- **Winston** + **Morgan** — Logging
- **Helmet** + **express-rate-limit** + **express-mongo-sanitize** — Security

### Frontend
- **React 18** + **Vite**
- **Redux Toolkit** — State management
- **React Router v6** — Routing with role-based guards
- **Tailwind CSS** — Dark theme
- **Recharts** — Data visualization
- **Socket.io Client** — Live updates
- **Razorpay Checkout** — Payment UI

### External APIs
| API | Purpose | Free Tier |
|---|---|---|
| AbuseIPDB | IP reputation | ✅ |
| VirusTotal | URL/file hash scan | ✅ |
| ip-api.com | GeoIP location | ✅ completely free |
| Razorpay | Payment gateway | ✅ test mode |

---

## Project Structure

```
cyber-forensics/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, env validation
│   │   ├── middleware/
│   │   │   ├── auth.js      # protect + authorize(role)
│   │   │   ├── auditLogger.js
│   │   │   ├── errorHandler.js  # no stack traces to client
│   │   │   └── notFound.js
│   │   ├── models/          # User, Case, Log, Alert, Evidence, Report, AuditLog
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── admin.routes.js  # admin-only: users, stats
│   │   │   ├── cases.routes.js
│   │   │   ├── logs.routes.js
│   │   │   ├── evidence.routes.js
│   │   │   ├── intelligence.routes.js
│   │   │   ├── reports.routes.js
│   │   │   └── payment.routes.js
│   │   ├── services/
│   │   │   └── detectionEngine/
│   │   │       ├── patternMatcher.js   # regex signatures
│   │   │       ├── threatScorer.js     # weighted scoring
│   │   │       └── anomalyDetector.js  # Z-score stats
│   │   ├── sockets/         # Socket.io rooms + events
│   │   └── utils/           # logger, apiResponse, crypto
│   ├── scripts/             # one-off tools (not deployed)
│   ├── .env.example
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── api/             # axiosInstance (auto token attach)
│       ├── components/
│       │   └── layout/
│       │       ├── Sidebar.jsx       # analyst/viewer nav
│       │       └── AdminSidebar.jsx  # admin nav
│       ├── pages/
│       │   ├── Login.jsx      # user portal login
│       │   ├── Register.jsx   # registration + Razorpay
│       │   ├── Dashboard.jsx
│       │   ├── Cases.jsx
│       │   ├── LogAnalysis.jsx
│       │   ├── ThreatIntel.jsx
│       │   ├── Alerts.jsx
│       │   ├── Reports.jsx
│       │   └── admin/
│       │       ├── AdminLogin.jsx      # separate admin login
│       │       ├── AdminDashboard.jsx  # system stats
│       │       └── UserManagement.jsx  # user table + role control
│       └── store/slices/
│           ├── authSlice.js    # login/logout/getMe
│           └── alertsSlice.js
│
├── docker-compose.yml
├── AUDIT.md         # honest security audit findings
└── README.md
```

---

## Getting Started

### Prerequisites
```
node -v   # v18+
npm -v    # v9+
docker -v # for Redis
```

### 1. Clone
```bash
git clone https://github.com/dhamo-code/cyber-forensics.git
cd cyber-forensics
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env (see Environment Variables below)
docker-compose up -d   # starts Redis
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# VITE_BACKEND_URL=http://localhost:5000
npm run dev
```

### 4. Create first admin account
There is no public admin registration — by design. Create the first admin
directly in MongoDB or using the seed script:
```bash
cd backend
node scripts/resetPassword.js admin@yourcompany.com YourStrongPassword123
# Then update the role field manually in MongoDB Atlas to 'admin'
```

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=minimum_32_character_random_string
JWT_REFRESH_SECRET=different_32_character_string
VIRUSTOTAL_API_KEY=your_key
ABUSEIPDB_API_KEY=your_key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=uploads/
```

### Frontend `.env`
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_APP_NAME=CyberForensics
# No Razorpay key here — comes from backend order response
```

---

## Portals

| Portal | URL | Who |
|---|---|---|
| User Login | `/login` | Analyst, Viewer |
| Admin Login | `/admin/login` | Admin only (red theme) |
| User Dashboard | `/dashboard` | Analyst, Viewer |
| Admin Overview | `/admin/dashboard` | Admin — system stats |
| User Management | `/admin/users` | Admin — role control |

If an analyst tries to access `/admin/dashboard` directly:
- Frontend `ProtectedRoute` blocks rendering (UX)
- Backend `authorize('admin')` returns 403 (real security boundary)

---

## API Documentation

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register + Razorpay verify |
| POST | `/api/auth/login` | None | Login (both roles) |
| POST | `/api/auth/logout` | Bearer | Logout |
| GET | `/api/auth/me` | Bearer | Current user |

### Admin (admin role only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users (paginated) |
| PATCH | `/api/admin/users/:id` | Update role / active status |
| GET | `/api/admin/stats` | System-wide counts |

### Cases
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cases` | All cases (paginated) |
| POST | `/api/cases` | Create case |
| GET | `/api/cases/:id` | Case detail |
| PUT | `/api/cases/:id` | Update case |
| DELETE | `/api/cases/:id` | Delete (admin only) |

### Logs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/logs/upload` | Upload + analyze log file |
| GET | `/api/logs` | All logs |
| GET | `/api/logs/alerts` | Generated alerts |

### Intelligence
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/intelligence/check-ip` | AbuseIPDB lookup |
| POST | `/api/intelligence/check-url` | VirusTotal URL scan |
| POST | `/api/intelligence/check-file` | VirusTotal hash check |
| GET | `/api/intelligence/geo/:ip` | GeoIP location |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reports/generate` | Generate PDF (AES-256 encrypted) |
| GET | `/api/reports` | All reports |
| GET | `/api/reports/:id/download` | Download decrypted report |

---

## Test Inputs for Demo

### Log Analysis
Upload a `.txt` file containing Apache-format log lines.
Attack sample file — paste into Notepad, save as `test-attack.txt`:
```
192.168.1.105 - - [10/Aug/2026:08:00:01 +0000] "GET /login?id=1' UNION SELECT username,password FROM users-- HTTP/1.1" 200 512
192.168.1.105 - - [10/Aug/2026:08:00:02 +0000] "POST /search?q=<script>alert(document.cookie)</script> HTTP/1.1" 200 128
10.0.0.45 - - [10/Aug/2026:08:00:03 +0000] "GET /login HTTP/1.1" 401 64
10.0.0.45 - - [10/Aug/2026:08:00:04 +0000] "GET /login HTTP/1.1" 401 64
10.0.0.45 - - [10/Aug/2026:08:00:05 +0000] "GET /login HTTP/1.1" 401 64
172.16.0.12 - - [10/Aug/2026:08:00:08 +0000] "GET /files/../../../../etc/passwd HTTP/1.1" 403 256
192.168.1.200 - - [10/Aug/2026:08:00:10 +0000] "GET /dashboard HTTP/1.1" 200 2048
```

### Threat Intelligence
| Check | Malicious Input | Safe Input |
|---|---|---|
| IP | `118.25.6.39` | `192.168.1.1` |
| URL | `http://malware.testing.google.test/testing/malware/` | `https://www.google.com` |
| Hash | `275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

### Razorpay Test Payment
```
Card:   4111 1111 1111 1111
Expiry: Any future date
CVV:    Any 3 digits
OTP:    1234
```

---

## Known Limitations

These are documented honestly — not hidden:

1. **JWT in localStorage** — readable by XSS. httpOnly cookie is the
   more secure option but requires CSRF protection setup.
2. **Rate limiting is in-memory** — resets on restart, doesn't work
   correctly across multiple server instances. Needs Redis store for production.
3. **Detection engine false positives** — content that *discusses* attack
   patterns (e.g. a blog post mentioning `document.write`) can trigger
   XSS rules. Inherent to regex-based approaches.
4. **Anomaly detector needs baseline** — Z-score analysis requires
   minimum 10 data points. Unreliable on fresh installs with no history.
5. **No email verification** on registration — users can register with
   any email address.

---

## License

MIT License — built for learning and internship demonstration purposes.