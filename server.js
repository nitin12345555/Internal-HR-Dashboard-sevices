const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const apiRoutes = require("./api");

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ server, path: "/ws" });

const users = [
  { id: "u1", name: "Nitin" },
  { id: "u2", name: "Ben" },
  { id: "u3", name: "Chloe" },
];

wss.on("connection", (ws) => {
  console.log("[server] WebSocket client connected");

  const intervalId = setInterval(() => {
    const kind = Math.random() > 0.5 ? "task.updated" : "task.assigned";
    const taskId = `t${Math.floor(Math.random() * 50) + 1}`;

    let payload;
    if (kind === "task.updated") {
      payload = { id: taskId, status: "Done" };
    } else {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      payload = { id: taskId, assignee: randomUser };
    }

    ws.send(JSON.stringify({ kind, payload }));
  }, 2000);

  ws.on("close", () => {
    console.log("[server] WebSocket client disconnected");
    clearInterval(intervalId);
  });
});

// --- Express App Setup ---
app.use(
  cors({ origin: ["http://localhost:3000", "https://wwwtaskpluscom.vercel.app"] })
);

app.get("/", (req, res) => {
  res.json({
    name: "mock-job-api",
    status: "running",
    endpoints: {
      api: "/api/tasks",
      websocket: "/ws",
      health: "/health",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] HTTP and WebSocket server listening on port ${PORT}`);
});