# Architecture Overview

This document describes the architectural design, component responsibilities, MongoDB database integration, communication flow, and request lifecycle for the **DevOps Starter** application.

---

## 1. High-Level Architecture

The DevOps Starter application is built as a **decoupled full-stack monorepo with MongoDB persistence**. It separates client presentation from backend service logic and document storage while keeping all code in a single repository for cohesive version control and developer ergonomics.

```
+-------------------------------------------------------------------------+
|                               Client Tier                               |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                  React 18 Single Page App (SPA)                |   |
|   |                                                                 |   |
|   |   +------------+  +-----------------+  +--------------------+   |   |
|   |   | Header.jsx |  |    Hero.jsx     |  |   StatusCard.jsx   |   |   |
|   |   +------------+  +-----------------+  +--------------------+   |   |
|   |                                                                 |   |
|   |   +---------------------------------------------------------+   |   |
|   |   |              Centralized API Service (api.js)           |   |   |
|   |   |       Health Checking & MongoDB CRUD Fetch API Calls    |   |   |
|   |   +---------------------------------------------------------+   |   |
|   +--------------------------------|--------------------------------+   |
+------------------------------------|------------------------------------+
                                     |
                          HTTP / Fetch API (REST)
                        CORS Preflight + JSON APIs
                                     |
                                     v
+-------------------------------------------------------------------------+
|                               Server Tier                               |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                       Express.js REST API                       |   |
|   |                                                                 |   |
|   |   +--------------------+    +-------------------------------+   |   |
|   |   | Security & CORS    | -> | Health Controller             |   |   |
|   |   | Helmet, JSON Parse |    | (Uptime, Timestamp, DB State) |   |   |
|   |   +--------------------+    +-------------------------------+   |   |
|   |             |               | Items Controller              |   |   |
|   |             |               | (CRUD Document Handlers)      |   |   |
|   |             v               +-------------------------------+   |   |
|   |   +---------------------------------------------------------+   |   |
|   |   |        Centralized Error Handler & 404 Route Trap       |   |   |
|   |   +---------------------------------------------------------+   |   |
|   +--------------------------------|--------------------------------+   |
+------------------------------------|------------------------------------+
                                     |
                             Mongoose ODM / TCP
                                     |
                                     v
+-------------------------------------------------------------------------+
|                              Database Tier                              |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                      MongoDB Document Store                     |   |
|   |               Collection: items (Title, Desc, Time)             |   |
|   |          Resilient Fallback: Degraded mode if offline           |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

---

## 2. Directory Structure & Monorepo Boundaries

```text
devops-practice-app/
│
├── app/
│   ├── frontend/                 # Client SPA (React 18 + Vite)
│   │   ├── public/               # Static assets & SVG icons
│   │   ├── src/
│   │   │   ├── components/       # Reusable, self-contained UI components
│   │   │   │   ├── Header.jsx    # Top navigation & responsive mobile drawer
│   │   │   │   ├── Hero.jsx      # Primary value proposition & CTAs
│   │   │   │   ├── StatusCard.jsx# Telemetry display & metric cards
│   │   │   │   └── Footer.jsx    # Semantic footer & metadata
│   │   │   ├── services/
│   │   │   │   └── api.js        # Centralized HTTP client using Fetch API
│   │   │   ├── App.jsx           # Root layout, telemetry state & MongoDB UI
│   │   │   ├── App.css           # Modern CSS styling (no framework bloat)
│   │   │   └── main.jsx          # React DOM entry point
│   │   ├── tests/                # Automated component tests (Vitest + JSDOM)
│   │   ├── index.html            # HTML shell with accessibility metadata
│   │   ├── vite.config.js        # Vite bundler & test configuration
│   │   └── package.json          # Frontend dependencies & scripts
│   │
│   └── backend/                  # REST API Service (Node.js + Express)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── health.routes.js     # Health route declarations
│       │   │   └── item.routes.js       # MongoDB items CRUD routes
│       │   ├── controllers/
│       │   │   ├── health.controller.js # Endpoint logic & uptime/DB probe
│       │   │   └── item.controller.js   # MongoDB CRUD handlers
│       │   ├── models/
│       │   │   └── item.model.js        # Mongoose Schema & Model definition
│       │   ├── middleware/
│       │   │   └── error.middleware.js  # 404 trap & global error handler
│       │   ├── config/
│       │   │   ├── config.js            # Environment validation & freezing
│       │   │   └── db.js                # MongoDB connection lifecycle & state
│       │   └── server.js                # App orchestration & HTTP listener
│       ├── tests/                # API integration tests (Supertest + Vitest)
│       │   ├── health.test.js
│       │   └── items.test.js
│       ├── package.json          # Backend dependencies & scripts
│       ├── .env.example          # Environment variable template
│       └── .env                  # Local runtime environment file
│
├── docs/                         # Engineering & operational documentation
│   ├── architecture.md           # Architecture, flow & lifecycle (this file)
│   ├── api-documentation.md      # API spec, sample payloads, error contracts
│   └── setup.md                  # Development setup & verification guide
│
├── .gitignore                    # Git exclusions
├── package.json                  # Root monorepo orchestration scripts
└── README.md                     # Project overview & quickstart
```

---

## 3. Component Responsibilities

### Frontend Tier (`app/frontend`)

| Component / Module | Responsibility |
| :--- | :--- |
| **`main.jsx`** | Mounts React tree into `#root` DOM container inside `React.StrictMode`. |
| **`App.jsx`** | Orchestrates layout, manages asynchronous state (`healthState`, client uptime, `items`), coordinates health checks and MongoDB CRUD, handles duplicate request locking and abort cleanup. |
| **`Header.jsx`** | Accessible navigation bar supporting smooth anchor scrolling (`#hero`, `#status`, `#database`, `#about`) and responsive mobile drawer. |
| **`Hero.jsx`** | Displays mission statement, badges, and primary action buttons. |
| **`StatusCard.jsx`** | Reusable card for telemetry metrics with accessible status pill indicators (`healthy`, `loading`, `danger`, `warning`). |
| **`Footer.jsx`** | Semantic footer displaying application copyright, dynamic year, and technology stack. |
| **`services/api.js`** | Centralized API communication layer. Reads `VITE_API_URL`, measures round-trip latency (`performance.now()`), formats headers, executes `/api/items` CRUD, and normalizes errors. |

### Backend Tier (`app/backend`)

| Component / Module | Responsibility |
| :--- | :--- |
| **`server.js`** | Bootstraps Express, attaches Helmet security headers, configures CORS whitelist, mounts health and item routes, connects to MongoDB, and manages graceful shutdown. |
| **`config/db.js`** | Manages Mongoose connection lifecycle, handles reconnects/timeouts gracefully, and exports `getDatabaseStatus()`. |
| **`models/item.model.js`** | Mongoose schema defining `title`, `description`, `status`, and timestamps for persistent documents. |
| **`controllers/item.controller.js`** | Implements document creation, querying, and deletion with connection verification (returning 503 if MongoDB is down). |
| **`controllers/health.controller.js`** | Produces dynamic runtime metadata: calculates server uptime (`process.uptime()`), outputs ISO-8601 timestamps, and reports MongoDB connection status. |
| **`middleware/error.middleware.js`** | Intercepts non-existent routes (404) and uncaught server errors (500). Strips stack traces in production to prevent information leakage. |

---

## 4. Resilience & Graceful Degradation

If MongoDB is temporarily unavailable or disconnected:
- The backend HTTP server **does not crash**.
- `/api/health` continues to return HTTP 200, reporting `database: { status: "disconnected" }`.
- The frontend dynamically displays "Degraded - Database Offline", informs the user, and guides them on how to start MongoDB.
- Database mutating endpoints (`/api/items`) return safe HTTP 503 Service Unavailable responses without throwing unhandled exceptions.
