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
- Brute Force: counts repeated 401 failures from same IP over time

**Layer 2 — Threat Scorer** (`threatScorer.js`)
Deterministic weighted scoring (0–100). Not a trained model.
Adjustments for: IP abuse history, request volume, off-hours activity.

**Layer 3 — Anomaly Detector** (`anomalyDetector.js`)
Z-score statistical outlier detection on request rate per IP.
Requires minimum 10 baseline data points to be meaningful.

### Tested results
Tested against 13 real attack payloads and 10 benign strings:
- 13/13 attacks detected
- 1 false positive: a URL slug containing `document.write` as text
  (e.g. a blog post about JavaScript) tripped the XSS rule
- This false positive class is inherent to regex-based detection

---

## Security Fixes Applied

| Issue | Original | Fixed |
|---|---|---|
| Admin role enforcement | UI-only (hide nav links) | `requireRole('admin')` on every backend route |
| Self-registration role | Accepted `role` from request body | Server forces `viewer` only |
| Login error messages | Different messages for wrong email vs password | Single generic message |
| Password in API responses | Risk of accidental inclusion | `select: false` on password field |
| Stack traces in errors | Sent to client in all environments | Server-side only via Winston |
| NoSQL injection | No sanitization | `express-mongo-sanitize` applied |
| Razorpay amount | Could be tampered client-side | Amount fixed server-side |
| Razorpay key hardcoded | `rzp_test_...` in frontend source | Removed — key from backend only |
| File upload validation | Client mimetype only | Size cap + server-side validation |
| JWT storage | localStorage (XSS-readable) | Documented trade-off |

---

## Features

| Feature | Description |
|---|---|
| 🔐 Separate Admin Portal | `/admin/login` — admin-only access |
| 👥 Role-Based Access | Admin / Analyst / Viewer — enforced on backend |
| 💳 Payment Registration | Razorpay test mode with server-side signature verification |
| 📁 Case Management | Create, assign, track forensic investigation cases |
| 📊 Log Analysis | Upload Apache/Nginx logs — rule-based threat detection |
| 🌍 Threat Intelligence | AbuseIPDB + VirusTotal + GeoIP |
| ⚡ Real-time Alerts | Socket.io live notifications |
| 📄 PDF Reports | AES-256-CBC encrypted forensic reports |
| 🔒 Evidence Integrity | SHA256 hash + chain of custody |
| 📋 Audit Logs | Every API action logged with user, IP, timestamp |
| 🐳 Docker | Redis containerized via docker-compose |

---

## Tech Stack

### Backend
- **Node.js 22** + **Express 4** — REST API
- **MongoDB Atlas** + **Mongoose** — Database
- **Redis** (Docker) — Cache
- **Socket.io** — Real-time alerts
- **JWT** — Access (15min) + Refresh (7d) with rotation
- **bcryptjs** — Password hashing (12 rounds)
- **PDFKit** — Encrypted PDF generation
- **Winston** + **Morgan** — Logging
- **Helmet** + **express-rate-limit** + **express-mongo-sanitize** — Security
- **Razorpay** — Payment gateway

### Frontend
- **React 18** + **Vite**
- **Redux Toolkit** — State management
- **React Router v6** — Role-based route guards
- **Tailwind CSS** — Dark theme UI
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
│   │   ├── config/
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── auditLogger.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   └── detectionEngine/
│   │   │       ├── patternMatcher.js
│   │   │       ├── threatScorer.js
│   │   │       └── anomalyDetector.js
│   │   ├── sockets/
│   │   └── utils/
│   ├── .env.example
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── store/
├── docker-compose.yml
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
# Fill in your values in .env
docker-compose up -d
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend `.env`
```
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
REGISTRATION_FEE_PAISE=49900
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_BACKEND_URL=http://localhost:5000
VITE_APP_NAME=CyberForensics
# No Razorpay key here — comes from backend order response
```

---

## Portals

| Portal | URL | Who |
|---|---|---|
| User Login | `/login` | Analyst, Viewer |
| User Dashboard | `/dashboard` | Analyst, Viewer |
| Admin Login | `/admin/login` | Admin only |

---

## API Documentation

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register + Razorpay verify |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

### Cases
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cases` | All cases |
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
| POST | `/api/reports/generate` | Generate PDF report |
| GET | `/api/reports` | All reports |
| GET | `/api/reports/:id/download` | Download report |

---

## Test Inputs for Demo

### Log Analysis
Save this as `test-attack.txt` and upload:
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
| Check | Malicious | Safe |
|---|---|---|
| IP | `118.25.6.39` | `192.168.1.1` |
| URL | `http://malware.testing.google.test/testing/malware/` | `https://www.google.com` |

### Razorpay Test Card
```
Card:   4111 1111 1111 1111
Expiry: Any future date
CVV:    Any 3 digits
OTP:    1234
```

---

## Known Limitations

1. **JWT in localStorage** — readable by XSS. httpOnly cookie is more secure.
2. **Rate limiting is in-memory** — resets on restart, not multi-instance safe.
3. **Detection engine false positives** — content discussing attack patterns can trigger rules.
4. **Anomaly detector needs baseline** — Z-score needs minimum 10 data points.
5. **No email verification** on registration.

---

## License

MIT License — built for learning and internship demonstration purposes.