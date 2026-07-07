const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();
const dbPath = path.join(__dirname, "..", "db.json");
const readDb = async () => {
  const dbRaw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(dbRaw);
};

// GET /api/tasks
router.get("/tasks", async (req, res) => {
  const { tasks } = await readDb();
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const total = tasks.length;
  const items = tasks.slice((page - 1) * pageSize, page * pageSize);
  res.json({
    page,
    pageSize,
    total,
    items,
  });
});
router.get("/tasks/:id", async (req, res) => {
  const { tasks } = await readDb();
  const task = tasks.find((t) => t.id === req.params.id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});
router.get("/tasks/:id/summary", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  const summaryLines = [
    "Analyzing task details...",
    "Generating a concise summary of the task.",
    "The task involves reviewing user feedback.",
    "Key points include performance and UI.",
    "Finalizing summary.",
    "Done",
  ];
  let i = 0;
  const intervalId = setInterval(() => {
    if (i >= summaryLines.length) {
      clearInterval(intervalId);
      return res.end();
    }
    res.write(`data: ${summaryLines[i]}\n\n`);
    i++;
  }, 500);
  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});
module.exports = router;