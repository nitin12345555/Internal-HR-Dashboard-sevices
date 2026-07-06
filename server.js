const express = require("express");
const http = require("http");
const fs = require("fs").promises;
const path = require("path");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const apiRoutes = require("./api");

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const dbPath = path.join(__dirname, "db.json");

const readDb = async () => {
  const dbRaw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(dbRaw);
};

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
app.use(cors({ origin: "http://localhost:3000" }));

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

app.get(["/employee", "/employees"], async (req, res) => {
  try {
    const { users } = await readDb();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

app.get(["/api/employee", "/api/employees"], async (req, res) => {
  try {
    const { users } = await readDb();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

app.use("/api", apiRoutes);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] HTTP and WebSocket server listening on port ${PORT}`);
});