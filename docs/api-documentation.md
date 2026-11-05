# REST API Documentation

This document describes all REST API endpoints provided by the **DevOps Starter Backend** service, including MongoDB document operations, request parameters, HTTP headers, successful response schemas, and error contracts.

---

## 1. Overview & Base URL

- **Default Base URL:** `http://localhost:5000`
- **Default Port:** `5000` (Configurable via `PORT` environment variable)
- **Database Engine:** MongoDB via Mongoose ODM (`MONGODB_URI`)
- **Protocol:** HTTP/1.1 (HTTPS in production)
- **Content Type:** `application/json`

---

## 2. Global Headers

### Request Headers

| Header | Value | Description |
| :--- | :--- | :--- |
| `Accept` | `application/json` | Informs the server of expected JSON response. |
| `Content-Type` | `application/json` | Required for `POST` bodies. |
| `Origin` | `http://localhost:5173` | Sent by browser for CORS preflight validation. |

### Response Headers

All responses include security headers provided by Helmet:

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
    "health": "/api/health",
    "items": "/api/items"
  }
}
```

---

### 3.2 System Health & Database Telemetry

Returns real-time liveness probe telemetry, including server uptime, dynamic ISO timestamp, and MongoDB connection status.

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
  "timestamp": "2026-11-05T09:46:14.944Z",
  "uptime": 123.45,
  "database": {
    "status": "connected",
    "type": "mongodb"
  }
}
```

#### Response Field Definitions

| Field | Type | Description |
| :--- | :--- | :--- |
| `success` | `boolean` | Always `true` on successful health probe. |
| `status` | `string` | Service status indicator (`"healthy"`). |
| `service` | `string` | Identifier of backend service (`"devops-starter-backend"`). |
| `timestamp` | `string` | Dynamic ISO-8601 UTC timestamp of request. |
| `uptime` | `number` | Real process uptime in seconds (floating point with 2 decimals). |
| `database.status` | `string` | MongoDB state: `"connected"`, `"connecting"`, or `"disconnected"`. |
| `database.type` | `string` | Fixed value `"mongodb"`. |

---

### 3.3 List Records (MongoDB)

Retrieves stored documents from the MongoDB `items` collection.

- **URL:** `/api/items`
- **Method:** `GET`

#### Example Request

```bash
curl -i http://localhost:5000/api/items
```

#### Successful Response (`200 OK`)

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6aec506d09d6c1053bbd93c8",
      "title": "Deploy Microservices",
      "description": "Verified persistent storage and replica sets",
      "status": "active",
      "createdAt": "2026-11-05T09:46:21.735Z",
      "updatedAt": "2026-11-05T09:46:21.735Z",
      "__v": 0
    }
  ]
}
```

---

### 3.4 Create Record (MongoDB)

Inserts a new document into the MongoDB `items` collection.

- **URL:** `/api/items`
- **Method:** `POST`
- **Body:** JSON object with `title` (required) and `description` (optional).

#### Example Request

```bash
curl -i -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title": "Kubernetes Ingress Config", "description": "Routing traffic to frontend and backend services"}'
```

#### Successful Response (`201 Created`)

```json
{
  "success": true,
  "message": "Record successfully saved to MongoDB",
  "data": {
    "title": "Kubernetes Ingress Config",
    "description": "Routing traffic to frontend and backend services",
    "status": "active",
    "_id": "6aec50b809d6c1053bbd93c9",
    "createdAt": "2026-11-05T09:47:36.000Z",
    "updatedAt": "2026-11-05T09:47:36.000Z",
    "__v": 0
  }
}
```

---

### 3.5 Delete Record (MongoDB)

Removes a document from the MongoDB collection by ID.

- **URL:** `/api/items/:id`
- **Method:** `DELETE`

#### Example Request

```bash
curl -i -X DELETE http://localhost:5000/api/items/6aec50b809d6c1053bbd93c9
```

#### Successful Response (`200 OK`)

```json
{
  "success": true,
  "message": "Record deleted from MongoDB",
  "data": {
    "id": "6aec50b809d6c1053bbd93c9"
  }
}
```

---

## 4. Error Responses

### 4.1 Database Unavailable (`503 Service Unavailable`)

Returned when database operations are requested while MongoDB is disconnected.

```json
{
  "success": false,
  "error": {
    "message": "Database unavailable: MongoDB is not connected. Ensure MongoDB is running and MONGODB_URI is properly configured.",
    "status": 503
  }
}
```

### 4.2 Validation Error (`400 Bad Request`)

Returned when required fields are missing or invalid:

```json
{
  "success": false,
  "error": {
    "message": "Validation error: Title is required and must not be empty.",
    "status": 400
  }
}
```

### 4.3 Route Not Found (`404 Not Found`)

```json
{
  "success": false,
  "error": {
    "message": "Cannot GET /api/non-existent - Route not found",
    "status": 404
  }
}
```
