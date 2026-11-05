# Setup & Local Development Guide

This guide outlines how to clone, install, configure, run, and test the **DevOps Starter** application locally.

---

## 1. Prerequisites

Ensure your system meets the following prerequisites:

- **Node.js:** v18.0.0 or higher (v20+ or v22+ recommended; verified on Node v22.23.4)
- **npm:** v9.0.0 or higher (verified on npm v10.9.9)
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
# Install backend dependencies
cd app/backend && npm install

# Install frontend dependencies
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
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port number the Express API server listens on | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `FRONTEND_URL` | Allowed origin for CORS headers | `http://localhost:5173` |

### 3.2 Frontend Environment Setup

Navigate to `app/frontend/`:

```bash
cd app/frontend
cp .env.example .env
```

Default `.env` values:

```env
VITE_API_URL=http://localhost:5000
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend API service | `http://localhost:5000` |

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

### Option B: Running Independently

**Start Backend Service:**
```bash
cd app/backend
npm run dev
```
The backend starts on `http://localhost:5000`. Test via curl:
```bash
curl http://localhost:5000/api/health
```

**Start Frontend Development Server:**
```bash
cd app/frontend
npm run dev
```
The frontend starts on `http://localhost:5173`. Open in your browser:
```
http://localhost:5173
```

---

## 5. Running Automated Tests

Both applications feature comprehensive automated test suites using **Vitest**.

### Run All Tests (Root)

```bash
npm test
```
This executes:
1. Backend test suite (`npm run test:backend`)
2. Frontend test suite (`npm run test:frontend`)

### Run Backend Tests Separately

```bash
cd app/backend
npm test
```

Tests verify:
- `GET /` returns status 200 and service identification.
- `GET /api/health` returns status 200, valid uptime, and dynamic ISO timestamp.
- Invalid routes return structured 404 JSON errors.
- Helmet security headers and `X-Powered-By` suppression.

### Run Frontend Tests Separately

```bash
cd app/frontend
npm test
```

Tests verify:
- Page structure, navigation, and hero section render correctly.
- Status cards display live telemetry.
- Loading states display during requests.
- Successful API responses render payload data.
- Network connection failures trigger error banners and retry actions.

---

## 6. Building for Production

### Build Frontend

```bash
npm run build:frontend
# Or from app/frontend:
cd app/frontend && npm run build
```

This compiles static assets into `app/frontend/dist/`.

### Run Backend in Production Mode

```bash
cd app/backend
NODE_ENV=production npm run start
```

