# Backend API Documentation

## Overview
This mock backend is for the annotation activity console take-home exercise. It serves task data over REST, streams AI-style summaries over SSE, and pushes live updates over WebSocket.

### Base URL
- Local: http://localhost:4000
- When deployed: use your deployed host instead of localhost

### Important notes for the frontend
- The data is intentionally messy and should be normalized before display.
- The summary stream contains untrusted markdown and raw HTML-like content. Render it safely.
- Do not assume all fields are clean or consistent.

---

## 1. REST API

### GET /api/tasks
Returns a paginated list of tasks.

#### Query parameters
- page: number, default 1
- pageSize: number, default 20
- type: optional filter string
- status: optional filter string

#### Response
```json
{
  "page": 1,
  "pageSize": 20,
  "total": 137,
  "items": [
    {
      "id": "t1",
      "title": "Task 1",
      "type": "text",
      "status": "InProgress",
      "assignee": { "id": "u1", "name": "Asha" },
      "annotationCount": 1,
      "updatedAt": 1719600000000,
      "meta": { "priority": "high" }
    }
  ]
}
```

### GET /api/tasks/:id
Returns one task by id.

#### Example
```http
GET /api/tasks/t1
```

#### Response
```json
{
  "id": "t1",
  "title": "Task 1",
  "type": "text",
  "status": "InProgress",
  "assignee": { "id": "u1", "name": "Asha" },
  "annotationCount": 1,
  "updatedAt": 1719600000000,
  "meta": { "priority": "high" }
}
```

#### Error response
```json
{
  "error": "not found"
}
```

### GET /api/tasks/:id/summary
Streams a task summary using Server-Sent Events.

#### Example
```http
GET /api/tasks/t1/summary
```

#### Response type
```text
text/event-stream
```

#### Stream format
Each chunk is sent as an SSE event with a `data:` payload.

```text
data: "## Summary for t1\n\n"

data: "This task is **in progress**.\n"
```

---

## 2. WebSocket API
Connect to:

```text
ws://localhost:4000/ws
```

The server emits live events every few seconds.

### Event shapes
```json
{
  "kind": "task.updated",
  "payload": {
    "id": "t5",
    "status": "done",
    "updatedAt": 1719600000000
  }
}
```

```json
{
  "kind": "task.assigned",
  "payload": {
    "id": "t3",
    "assignee": { "id": "u2", "name": "Ben" }
  }
}
```

```json
{
  "kind": "annotation.created",
  "payload": {
    "taskId": "t3",
    "by": "u1",
    "at": 1719600000000
  }
}
```

---

## 3. Data model expectations

### Task
```ts
interface Task {
  id: string;
  title: string;
  type: string;
  status: string;
  assignee: { id: string; name: string } | null;
  annotationCount: string | number;
  updatedAt: string | number;
  meta: Record<string, unknown>;
}
```

### Frontend normalization rules
The backend data is intentionally inconsistent. The UI should normalize it before rendering:

- `type` may include unknown values such as `video`
- `status` may be mixed case or spelling, such as `in_progress`, `InProgress`, `done`, `todo`, `QA`, `BLOCKED`
- `annotationCount` may be a string or a number
- `updatedAt` may be an ISO string or an epoch timestamp in milliseconds
- `assignee` may be null

Suggested approach:
- map status to a small enum such as `todo`, `in_progress`, `done`, `blocked`, `qa`
- convert annotation count to a number
- format timestamps into a readable date
- show empty states when assignee is missing

---

## 4. Frontend requirements checklist
The frontend should support:

1. Fetch and paginate tasks from `/api/tasks`
2. Show a detailed view for a selected task from `/api/tasks/:id`
3. Stream task summaries from `/api/tasks/:id/summary`
4. Subscribe to live updates from `/ws`
5. Handle loading, error, empty, and partial states clearly
6. Render streamed markdown safely without executing injected HTML or scripts

---

## 5. Example calls

### Fetch tasks
```js
fetch('http://localhost:4000/api/tasks?page=1&pageSize=20')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Fetch one task
```js
fetch('http://localhost:4000/api/tasks/t1')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Connect to SSE summary stream
```js
const eventSource = new EventSource('http://localhost:4000/api/tasks/t1/summary');

eventSource.onmessage = (event) => {
  console.log(event.data);
};
```

### Connect to WebSocket
```js
const socket = new WebSocket('ws://localhost:4000/ws');

socket.onmessage = (event) => {
  console.log(JSON.parse(event.data));
};
```
