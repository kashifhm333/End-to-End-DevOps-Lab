# DevOps Starter

A production-grade, decoupled full-stack single-page application built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)** using a clean monorepo architecture. 

Designed specifically as a solid, cleanly engineered application baseline ready for DevOps learning, containerization, observability, and CI/CD automation.

---

## Features

- **Decoupled Monorepo Architecture:** Frontend and backend maintain distinct dependency trees and build pipelines while living in a unified repository.
- **MongoDB Document Persistence:** Complete CRUD functionality via Mongoose ODM (`/api/items`) for storing and deleting application records.
- **Fault-Tolerant Database Resilience:** If MongoDB is offline, the backend continues running in graceful degraded mode without crashing, reporting its status via health checks.
- **Dynamic Real-Time Health Telemetry:** Independent health reporting via `GET /api/health` providing dynamic ISO timestamps, actual server uptime, and database connection state.
- **Live Latency & Network Measurement:** The frontend measures round-trip API latency in milliseconds via `performance.now()`.
- **Fault-Tolerant State Handling:** Clear loading, connected, and disconnected states. Automatic and manual retry capabilities when backend or database is offline.
- **Security Best Practices:** Express secured with Helmet HTTP security headers, CORS origin whitelisting, disabled server fingerprinting (`X-Powered-By`), and sanitization of production error messages.
- **Developer-Focused UI:** Minimal, modern design built with pure CSS custom properties, WCAG AA accessible contrast, responsive mobile navigation drawer, and SVG icons.
- **100% Automated Test Coverage:** Automated unit and integration test suites for both frontend and backend using **Vitest**, **Testing Library**, and **Supertest** (21 passing tests).

---

## Technologies

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Styling:** Modern Pure CSS (CSS Variables, Flexbox, CSS Grid)
- **HTTP Client:** Native Fetch API with centralized service abstraction
- **Testing:** Vitest, React Testing Library, JSDOM

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4
- **Database:** MongoDB with Mongoose ODM
- **Security:** Helmet, CORS
- **Configuration:** Dotenv with strict environment validation
- **Testing:** Vitest, Supertest

---

## Project Structure

```text
devops-practice-app/
│
├── app/
│   ├── frontend/                 # Client Single Page Application
│   │   ├── public/
│   │   │   └── favicon.svg       # Developer terminal SVG icon
│   │   ├── src/
│   │   │   ├── components/       # Reusable React components
│   │   │   │   ├── Header.jsx    # Header with mobile drawer & anchors
│   │   │   │   ├── Hero.jsx      # Hero section & action buttons
│   │   │   │   ├── StatusCard.jsx# Reusable status card
│   │   │   │   └── Footer.jsx    # Semantic footer
│   │   │   ├── services/
│   │   │   │   └── api.js        # Centralized Fetch API service
│   │   │   ├── App.jsx           # Root layout, telemetry state & MongoDB UI
│   │   │   ├── App.css           # Modern CSS architecture
│   │   │   └── main.jsx          # React DOM entry point
│   │   ├── tests/
│   │   │   ├── App.test.jsx      # Frontend component tests
│   │   │   └── setup.js          # Jest-DOM matcher setup
│   │   ├── index.html            # HTML5 shell
│   │   ├── vite.config.js        # Vite & Vitest configuration
│   │   ├── package.json          # Frontend dependencies
│   │   ├── .env.example          # Environment variables template
│   │   └── .env                  # Local frontend environment
│   │
│   └── backend/                  # REST API Service
│       ├── src/
│       │   ├── routes/
│       │   │   ├── health.routes.js     # Health route mapping
│       │   │   └── item.routes.js       # MongoDB CRUD routes
│       │   ├── controllers/
│       │   │   ├── health.controller.js # Health endpoint business logic
│       │   │   └── item.controller.js   # MongoDB document logic
│       │   ├── models/
│       │   │   └── item.model.js        # Mongoose Schema & Model
│       │   ├── middleware/
│       │   │   └── error.middleware.js  # 404 trap & error handler
│       │   ├── config/
│       │   │   ├── config.js            # Environment validation
│       │   │   └── db.js                # MongoDB connection management
│       │   └── server.js                # Express app & server entry
│       ├── tests/
│       │   ├── health.test.js    # Backend API integration tests
│       │   └── items.test.js     # MongoDB integration & mock tests
│       ├── package.json          # Backend dependencies
│       ├── .env.example          # Environment variables template
│       └── .env                  # Local backend environment
│
├── docs/                         # Comprehensive Documentation
│   ├── architecture.md           # Architecture, component flow & lifecycle
│   ├── api-documentation.md      # REST API contracts & sample payloads
│   └── setup.md                  # Detailed local setup and verification
│
├── .gitignore                    # Git exclusions
├── package.json                  # Root monorepo orchestration scripts
└── README.md                     # Project overview (this file)
```

---

## Quickstart & Installation

1. **Install dependencies for both projects:**
   ```bash
   # Backend
   cd app/backend && npm install

   # Frontend
   cd ../frontend && npm install

   # Return to root
   cd ../..
   ```

2. **Verify environment files:**
   Environment files (`.env`) are pre-configured for local development. If not present:
   ```bash
   cp app/backend/.env.example app/backend/.env
   cp app/frontend/.env.example app/frontend/.env
   ```

3. **Start the backend server (Port 5000):**
   ```bash
   npm run dev:backend
   ```

4. **Start the frontend application (Port 5173):**
   ```bash
   npm run dev:frontend
   ```

5. **Open the application:**
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

From the repository root:

| Command | Action |
| :--- | :--- |
| `npm run dev:backend` | Starts Express backend in watch mode on port 5000 |
| `npm run dev:frontend` | Starts Vite frontend dev server on port 5173 |
| `npm run start:backend` | Starts Express backend in production mode |
| `npm run build:frontend` | Generates optimized production build in `app/frontend/dist` |
| `npm run test:backend` | Executes backend Vitest test suite |
| `npm run test:frontend` | Executes frontend Vitest test suite |
| `npm test` | Runs both backend and frontend test suites sequentially |

---

## Testing

Run the full automated test suite across both frontend and backend:

```bash
npm test
```

All 21 tests across backend and frontend will run and validate HTTP status codes, security headers, dynamic uptime, database state, loading states, error boundaries, and DOM rendering.

---

## Documentation

For in-depth documentation, refer to:
- [Architecture Overview](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/docs/architecture.md)
- [API Documentation](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/docs/api-documentation.md)
- [Setup & Development Guide](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/docs/setup.md)
