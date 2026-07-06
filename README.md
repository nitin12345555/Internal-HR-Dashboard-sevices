# Mock API Server Documentation

This document provides instructions and details for the mock backend server created for the assignment. The server is built with Express.js and provides REST APIs, Server-Sent Events (SSE), and WebSocket functionalities.

## Getting Started

Follow these steps to get the server up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository.
2. Navigate to the `mock-server` directory.
3. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Server

To start the server in development mode (with auto-reload), run:

```bash
npm run dev
```

The server will start on `http://localhost:4000`.

## API Documentation
A detailed frontend-ready API contract is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## API Endpoints

All API endpoints are prefixed with `/api`.

### 1. List Tasks (with Pagination)

Retrieves a paginated list of tasks.

- **Endpoint**: `GET /api/tasks`
- **Query Parameters**:
  - `page` (optional, number): The page number to retrieve. Default: `1`.
  - `pageSize` (optional, number): The number of items per page. Default: `10`.
- **Success Response (200 OK)**:
  ```json
  {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "items": [
      {
        "id": "t1",
        "title": "Analyze customer feedback data",
        "type": "text",
        "status": "InProgress",
        "assignee": { "id": "u1", "name": "Nitin" },
        "annotationCount": "4",
        "updatedAt": "2025-08-06T10:30:00Z",
        "meta": { "priority": "high" }
      }
      // ... 9 more items
    ]
  }
  ```

### 2. Get a Single Task

Retrieves a single task by its ID.

- **Endpoint**: `GET /api/tasks/:id`
- **URL Parameters**:
  - `id` (string): The unique ID of the task (e.g., `t1`).
- **Success Response (200 OK)**:
  ```json
  {
    "id": "t1",
    "title": "Analyze customer feedback data",
    "type": "text",
    "status": "InProgress",
    "assignee": { "id": "u1", "name": "Nitin" },
    "annotationCount": "4",
    "updatedAt": "2025-08-06T10:30:00Z",
    "meta": { "priority": "high" }
  }
  ```
- **Error Response (404 Not Found)**:
  ```json
  { "message": "Task not found" }
  ```

### 3. Get Task Summary (Streaming)

Streams a summary for a specific task using Server-Sent Events (SSE).

- **Endpoint**: `GET /api/tasks/:id/summary`
- **Description**: This endpoint keeps the connection open and pushes data chunks every 500ms. The stream ends when it sends a `data: Done` message.
- **Event Stream Format**:
  ```
  data: Analyzing task details...

  data: Generating a concise summary of the task.

  ...

  data: Done
  ```

---

## WebSocket API

The server provides real-time updates via WebSockets.

- **Endpoint**: `ws://localhost:4000/ws`
- **Description**: After connecting, the server will push a message every 2 seconds with a random task update.
- **Message Format**: The server sends JSON messages in the following format:
  ```json
  // Example 1: A task's status is updated
  {
    "kind": "task.updated",
    "payload": { "id": "t5", "status": "Done" }
  }

  // Example 2: A task is assigned to a user
  {
    "kind": "task.assigned",
    "payload": {
      "id": "t3",
      "assignee": { "id": "u2", "name": "Ben" }
    }
  }
  ```

---

## Data Schema Notes

The mock data in `db.json` is intentionally inconsistent to test the frontend's data normalization capabilities. Be aware of:
- `status`: Can have different casings and values (e.g., `InProgress`, `in_progress`, `Done`, `done`, `QA`, `BLOCKED`).
- `annotationCount`: Can be a `string` or a `number`.
- `updatedAt`: Can be an `ISO 8601 string` or a `Unix epoch timestamp` (in milliseconds).
- `assignee`: Can be an `object` or `null`.