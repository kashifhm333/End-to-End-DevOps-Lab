# REST API Documentation

This document describes all REST API endpoints provided by the **DevOps Starter Backend** service, including request parameters, HTTP headers, successful response schemas, and error contracts.

---

## 1. Overview & Base URL

- **Default Base URL:** `http://localhost:5000`
- **Default Port:** `5000` (Configurable via `PORT` environment variable)
- **Protocol:** HTTP/1.1 (HTTPS in production)
- **Content Type:** `application/json`

---

## 2. Global Headers

### Request Headers

| Header | Value | Description |
| :--- | :--- | :--- |
| `Accept` | `application/json` | Informs the server of expected JSON response. |
| `Origin` | `http://localhost:5173` | Sent by browser for CORS preflight validation. |

### Response Headers

All responses include industry-standard security headers provided by Helmet:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Type: application/json; charset=utf-8
```

The `X-Powered-By` header is explicitly disabled.

---

## 3. Endpoints

### 3.1 Service Identification

Returns identification and available service endpoints.

- **URL:** `/`
- **Method:** `GET`
- **Authentication:** None required

#### Example Request

```bash
curl -i http://localhost:5000/
```

#### Successful Response (`200 OK`)

```json
{
  "success": true,
  "name": "DevOps Starter API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/api/health"
  }
}
```

---

### 3.2 System Health Check

Returns real-time liveness probe telemetry, including server uptime and dynamic ISO timestamps.

- **URL:** `/api/health`
- **Method:** `GET`
- **Authentication:** None required

#### Example Request

```bash
curl -i http://localhost:5000/api/health
```

#### Successful Response (`200 OK`)

```json
{
  "success": true,
  "status": "healthy",
  "service": "devops-starter-backend",
  "timestamp": "2026-11-05T08:54:53.890Z",
  "uptime": 123.45
}
```

#### Response Field Definitions

| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | `boolean` | Always `true` on successful health probe. |
| `status` | `string` | Service status indicator (`"healthy"`). |
| `service` | `string` | Identifier of the backend service (`"devops-starter-backend"`). |
| `timestamp` | `string` | Dynamic ISO-8601 UTC timestamp of when request was processed. |
| `uptime` | `number` | Real process uptime in seconds (floating point with 2 decimals). |

---

## 4. Error Responses

All error responses adhere to a consistent contract.

### 4.1 Route Not Found (`404 Not Found`)

Returned when a requested endpoint or HTTP verb does not exist on the server.

#### Example Request

```bash
curl -i http://localhost:5000/api/non-existent
```

#### Response Body (`404 Not Found`)

```json
{
  "success": false,
  "error": {
    "message": "Cannot GET /api/non-existent - Route not found",
    "status": 404
  }
}
```

---

### 4.2 CORS Policy Block (`500 / Error`)

Returned when a cross-origin request arrives from an unapproved origin.

#### Response Body

```json
{
  "success": false,
  "error": {
    "message": "CORS policy blocked access from origin: http://unauthorized-domain.com",
    "status": 500
  }
}
```

---

### 4.3 Internal Server Error (`500 Internal Server Error`)

In **production mode** (`NODE_ENV=production`), internal stack traces are suppressed:

```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error",
    "status": 500
  }
}
```

In **development mode** (`NODE_ENV=development`), the stack trace is included to facilitate local debugging:

```json
{
  "success": false,
  "error": {
    "message": "Detailed error message",
    "status": 500,
    "stack": "Error: Detailed error message\n    at ..."
  }
}
```

