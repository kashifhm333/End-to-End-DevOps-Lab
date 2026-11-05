# Setup & Local Development Guide

This guide outlines how to clone, install, configure, run, and test the **DevOps Starter** application locally with MongoDB integration.

---

## 1. Prerequisites

Ensure your system meets the following prerequisites:

- **Node.js:** v18.0.0 or higher (v20+ or v22+ recommended; verified on Node v22.23.4)
- **npm:** v9.0.0 or higher (verified on npm v10.9.9)
- **MongoDB (Optional for local development, recommended for full testing):** MongoDB v5.0+ or Docker
- **Modern Web Browser:** Chrome, Firefox, Safari, Edge

Verify your installed versions:

```bash
node -v
npm -v
```

---

## 2. Monorepo Installation

The project uses a monorepo structure. You can install all dependencies from either individual package directories or root orchestration.

### Quick Install (Root Monorepo)

From the project root:

```bash
# Install backend dependencies (Express + Mongoose)
cd app/backend && npm install

# Install frontend dependencies (React + Vite)
cd ../frontend && npm install

# Return to root
cd ../..
```

---

## 3. Environment Configuration

Both backend and frontend services require configuration via `.env` files.

### 3.1 Backend Environment Setup

Navigate to `app/backend/`:

```bash
cd app/backend
cp .env.example .env
```

Default `.env` values:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/devops_starter
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port number the Express API server listens on | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `FRONTEND_URL` | Allowed origin for CORS headers | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection URI string | `mongodb://localhost:27017/devops_starter` |

### 3.2 Starting MongoDB (Optional)

If you have Docker installed, you can start a local MongoDB container with:

```bash
docker run -d -p 27017:27017 --name devops-mongo mongo:latest
```

*Note: The application includes resilient degradation. If MongoDB is not running, the application will still boot cleanly in degraded mode and report database disconnection on the frontend without crashing.*

### 3.3 Frontend Environment Setup

Navigate to `app/frontend/`:

```bash
cd app/frontend
cp .env.example .env
```

Default `.env` values:

```env
VITE_API_URL=http://localhost:5000
```

---

## 4. Running the Application

Both applications can run independently or concurrently.

### Option A: Using Monorepo Root Scripts (Recommended)

Open two terminal sessions from the project root:

**Terminal 1 (Backend):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend):**
```bash
npm run dev:frontend
```

---

## 5. Running Automated Tests

Both applications feature comprehensive automated test suites using **Vitest**.

### Run All Tests (Root)

```bash
npm test
```
This executes:
1. Backend test suite (`npm run test:backend` - 14 tests: health telemetry, security headers, MongoDB routes and connection mocking)
2. Frontend test suite (`npm run test:frontend` - 7 tests: UI components, status cards, error states, and MongoDB CRUD)

---

## 6. Building for Production

### Build Frontend

```bash
npm run build:frontend
```

This compiles static assets into `app/frontend/dist/`.

### Run Backend in Production Mode

```bash
cd app/backend
NODE_ENV=production npm run start
```
