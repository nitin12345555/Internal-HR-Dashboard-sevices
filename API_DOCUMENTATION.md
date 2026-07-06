# Backend API Documentation

## Overview
This backend is a mock Express.js service that provides:
- REST endpoints for task data
- Server-Sent Events (SSE) for task summaries
- WebSocket updates for live events

### Base URLs
- Local: http://localhost:4000
- Production: https://internal-hr-dashboard-sevices-production.up.railway.app

### Tech Stack
- Node.js
- Express.js
- WebSocket (ws)
- CORS enabled for frontend origins

---

## 1. Health and Service Info

### GET /
Returns basic service information.

#### Response
```json
{
  "name": "mock-job-api",
  "status": "running",
  "endpoints": {
    "api": "/api/tasks",
    "websocket": "/ws",
    "health": "/health"
  }
}
```

### GET /health
Checks whether the server is healthy.

#### Response
```json
{
  "status": "ok"
}
```

### GET /employee or GET /employees
Returns the list of users/employees from the mock dataset.

#### Response
```json
[
  { "id": "u1", "name": "Nitin" },
  { "id": "u2", "name": "Ben" },
  { "id": "u3", "name": "Chloe" }
]
```

### GET /api/employee or GET /api/employees
Same as above, but under the API prefix.

---

## 2. Task API
All task endpoints are under /api.

### GET /api/tasks
Returns a paginated list of tasks.

#### Query Parameters
- page: number, optional, default = 1
- pageSize: number, optional, default = 10

#### Response
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
  ]
}
```

### GET /api/tasks/:id
Returns a single task by ID.

#### Example
```http
GET /api/tasks/t1
```

#### Success Response
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

#### Error Response
```json
{
  "message": "Task not found"
}
```

### GET /api/tasks/:id/summary
Streams a task summary using Server-Sent Events (SSE).

#### Example
```http
GET /api/tasks/t1/summary
```

#### Response Type
```text
text/event-stream
```

#### Event Format
```text
data: Analyzing task details...

data: Generating a concise summary of the task.

data: Done
```

---

## 3. WebSocket API
The backend exposes a WebSocket endpoint at:

```text
ws://localhost:4000/ws
```

For production, use:
```text
wss://internal-hr-dashboard-sevices-production.up.railway.app/ws
```

### Message Format
The server sends JSON messages every 2 seconds:

```json
{
  "kind": "task.updated",
  "payload": {
    "id": "t5",
    "status": "Done"
  }
}
```

or

```json
{
  "kind": "task.assigned",
  "payload": {
    "id": "t3",
    "assignee": { "id": "u2", "name": "Ben" }
  }
}
```

---

## 4. Data Models

### Task
```ts
interface Task {
  id: string;
  title: string;
  type: 'text' | 'image' | 'audio' | 'video';
  status: string;
  assignee: User | null;
  annotationCount: string | number;
  updatedAt: string | number;
  meta: {
    priority: string;
  };
}
```

### User
```ts
interface User {
  id: string;
  name: string;
}
```

---

## 5. Important Frontend Notes
The mock data is intentionally inconsistent to test UI normalization.

### Data inconsistencies to handle
- status values may vary like:
  - InProgress
  - Todo
  - Done
  - QA
  - BLOCKED
  - lowercase variants such as in_progress, todo, done
- annotationCount may be a string or number
- updatedAt may be either:
  - ISO string like "2025-08-06T10:30:00Z"
  - Unix timestamp in milliseconds
- assignee may be an object or null

### Recommended frontend behavior
- Normalize status values before displaying them
- Convert annotationCount to a number for rendering
- Format updatedAt into a readable date
- Show empty states for null assignees or missing fields
- Handle loading and error states for all requests

---

## 6. Frontend Requirements Checklist
To build the UI against this backend, the frontend should support:

1. Home or dashboard page
   - Fetch tasks from GET /api/tasks
   - Show a paginated task list

2. Task detail view
   - Fetch task details from GET /api/tasks/:id

3. Task summary panel
   - Open SSE connection to GET /api/tasks/:id/summary
   - Render streamed text progressively

4. Live updates
   - Connect to the WebSocket endpoint /ws
   - Listen for task update events and reflect them in the UI

5. Error handling
   - Show friendly messages for failed requests or missing tasks

---

## 7. Example Frontend Integration Notes
### Fetch tasks
```js
fetch('https://internal-hr-dashboard-sevices-production.up.railway.app/api/tasks?page=1&pageSize=10')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Fetch a single task
```js
fetch('https://internal-hr-dashboard-sevices-production.up.railway.app/api/tasks/t1')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Connect to SSE
```js
const eventSource = new EventSource('https://internal-hr-dashboard-sevices-production.up.railway.app/api/tasks/t1/summary');

eventSource.onmessage = (event) => {
  console.log(event.data);
};
```

### Connect to WebSocket
```js
const socket = new WebSocket('wss://internal-hr-dashboard-sevices-production.up.railway.app/ws');

socket.onmessage = (event) => {
  console.log(JSON.parse(event.data));
};
```
