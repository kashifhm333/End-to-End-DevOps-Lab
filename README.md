# DevOps Starter

A production-grade, decoupled full-stack single-page application built with **React (Vite)** and **Node.js (Express)** using a clean monorepo architecture. 

Designed specifically as a solid, cleanly engineered application baseline ready for DevOps learning, containerization, observability, and CI/CD automation.

---

## Features

- **Decoupled Monorepo Architecture:** Frontend and backend maintain distinct dependency trees and build pipelines while living in a unified repository.
- **Dynamic Real-Time Health Telemetry:** Independent health reporting via `GET /api/health` providing dynamic ISO timestamps and actual server uptime.
- **Live Latency & Network Measurement:** The frontend measures round-trip API latency in milliseconds via `performance.now()`.
- **Fault-Tolerant State Handling:** Clear loading, connected, and disconnected states. Automatic and manual retry capabilities when the backend is offline.
- **Security Best Practices:** Express secured with Helmet HTTP security headers, CORS origin whitelisting, disabled server fingerprinting (`X-Powered-By`), and sanitization of production error messages.
- **Developer-Focused UI:** Minimal, modern design built with pure CSS custom properties, WCAG AA accessible contrast, responsive mobile navigation drawer, and SVG icons (no emoji icons or heavy UI frameworks).
- **100% Automated Test Coverage:** Automated unit and integration test suites for both frontend and backend using **Vitest**, **Testing Library**, and **Supertest**.

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
│   │   │   │   ├── Header.jsx    # Header with mobile drawer
│   │   │   │   ├── Hero.jsx      # Hero section & action buttons
│   │   │   │   ├── StatusCard.jsx# Reusable status card
│   │   │   │   └── Footer.jsx    # Semantic footer
│   │   │   ├── services/
│   │   │   │   └── api.js        # Centralized Fetch API service
│   │   │   ├── App.jsx           # Root layout & telemetry state
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
│       │   │   └── health.routes.js     # Health route mapping
│       │   ├── controllers/
│       │   │   └── health.controller.js # Endpoint business logic
│       │   ├── middleware/
│       │   │   └── error.middleware.js  # 404 trap & error handler
│       │   ├── config/
│       │   │   └── config.js            # Environment validation
│       │   └── server.js                # Express app & server entry
│       ├── tests/
│       │   └── health.test.js    # Backend API integration tests
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

## Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ or v22+ recommended)
- **npm:** v9.0.0 or higher

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

All 11 tests across backend and frontend will run and validate HTTP status codes, security headers, dynamic uptime, loading states, error boundaries, and DOM rendering.

---

## Troubleshooting

### 1. Backend Shows "Disconnected" in Frontend
- Check if the backend process is running: `curl http://localhost:5000/api/health`
- Ensure port 5000 is not occupied by another process: `lsof -i :5000`
- Confirm `VITE_API_URL` in `app/frontend/.env` matches the backend address (`http://localhost:5000`).

### 2. CORS Errors in Browser Console
- Check `FRONTEND_URL` in `app/backend/.env`. It should match your frontend origin (`http://localhost:5173`).
- Restart the backend after updating `.env`.

### 3. Port Already in Use
- Change `PORT` in `app/backend/.env` (e.g., `PORT=5001`).
- Update `VITE_API_URL` in `app/frontend/.env` to point to the new port (`http://localhost:5001`).
- Restart both services.

---

## Documentation

For in-depth documentation, refer to:
- [Architecture Overview](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/docs/architecture.md)
- [API Documentation](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/docs/api-documentation.md)
- [Setup & Development Guide](file:///home/kashifhm333/Desktop/Project/DevOps-end-to-end-production-Project-/docs/setup.md)

