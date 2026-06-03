# 🛡️ AI-Powered Cyber Forensics Investigation System

> A professional full-stack cybersecurity platform with AI-powered threat detection, real-time monitoring, and forensic investigation tools.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 JWT Authentication | Secure login with access + refresh tokens |
| 👥 Role-Based Access | Admin, Analyst, Viewer roles |
| 📁 Case Management | Create and track forensic cases |
| 📊 Log Analysis | Upload and analyze Apache/Nginx/JSON logs |
| 🤖 AI Detection | Pattern matching for SQL injection, XSS, brute force |
| 🌍 Threat Intelligence | VirusTotal + AbuseIPDB + GeoIP integration |
| ⚡ Real-time Alerts | Socket.io live threat notifications |
| 📄 PDF Reports | Generate downloadable forensic reports |
| 🔒 File Integrity | SHA256 hash verification for evidence |
| 🐳 Docker Ready | Containerized deployment |

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB Atlas** — Cloud database
- **Redis** — Caching and session management
- **Socket.io** — Real-time communication
- **JWT** — Authentication tokens
- **bcryptjs** — Password hashing
- **Winston** — Professional logging
- **PDFKit** — PDF report generation

### Frontend
- **React 18** + **Vite** — Fast UI framework
- **Redux Toolkit** — State management
- **Tailwind CSS** — Dark theme UI
- **Recharts** — Data visualization
- **Lucide React** — Icons
- **Socket.io Client** — Real-time updates

### Security
- **Helmet** — HTTP security headers
- **Express Rate Limit** — API rate limiting
- **SHA256 Hashing** — File integrity
- **Role-based Access Control** — Authorization

### External APIs
- **VirusTotal API** — File and URL scanning
- **AbuseIPDB API** — IP reputation checking
- **ip-api.com** — GeoIP location (free)

---

## 🏗️ Architecture

```
Client (React + Redux)
        ↓
    NGINX (Reverse Proxy)
        ↓
Express.js REST API + Socket.io
        ↓
Services Layer
Auth | Cases | Logs | Reports | Intelligence
        ↓
Data Layer
MongoDB Atlas | Redis
        ↓
AI Engine
Pattern Matcher | Threat Scorer | Anomaly Detector
```

---

## 🚀 Getting Started

### Prerequisites
```
node -v    # v18+
npm -v     # v9+
docker -v  # v24+
git -v
```

### Installation

1. Clone the repository
```
git clone https://github.com/dhamo-code/cyber-forensics.git
cd cyber-forensics
```

2. Backend setup
```
cd backend
npm install
cp .env.example .env
npm run dev
```

3. Frontend setup
```
cd frontend
npm install
npm run dev
```

4. Start Redis with Docker
```
docker-compose up -d
```

---

## 🔑 Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
VIRUSTOTAL_API_KEY=optional
ABUSEIPDB_API_KEY=optional
```

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/refresh-token | Refresh access token |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |

### Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cases | Get all cases |
| POST | /api/cases | Create new case |
| GET | /api/cases/:id | Get case by ID |
| PUT | /api/cases/:id | Update case |
| DELETE | /api/cases/:id | Delete case |
| GET | /api/cases/stats | Get case statistics |

### Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/logs/upload | Upload and analyze log file |
| GET | /api/logs | Get all logs |
| GET | /api/logs/alerts | Get generated alerts |

### Intelligence
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/intelligence/check-ip | Check IP reputation |
| POST | /api/intelligence/check-url | Check URL safety |
| POST | /api/intelligence/check-file | Check file hash |
| GET | /api/intelligence/geo/:ip | Get GeoIP info |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reports/generate | Generate PDF report |
| GET | /api/reports | Get all reports |
| GET | /api/reports/:id/download | Download report |

---

## 📁 Project Structure

```
cyber-forensics/
├── backend/
│   ├── src/
│   │   ├── ai/              # AI threat detection
│   │   ├── config/          # DB, Redis, env config
│   │   ├── controllers/     # Request handlers
│   │   ├── intelligence/    # External API integrations
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.io
│   │   └── utils/           # Logger, crypto, parser
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/             # Axios instance
│       ├── components/      # Reusable components
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Page components
│       └── store/           # Redux state
├── docker-compose.yml
└── README.md
```

---

## 👨‍💻 Developer

**Dhamodharan** — Intern Developer
- GitHub: [@dhamo-code](https://github.com/dhamo-code)

---

## 📄 License

MIT License — feel free to use for learning and projects.