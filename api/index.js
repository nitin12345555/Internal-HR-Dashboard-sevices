const path = require("path");
const fs = require("fs");

const handleLogin = (req, res, db, body) => {
  try {
    const { email, password } = JSON.parse(body);
    const user = db.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      res.statusCode = 200;
      res.end(JSON.stringify({ token: "mock-jwt-token-for-testing" }));
    } else {
      res.statusCode = 401; // Unauthorized
      res.end(JSON.stringify({ message: "Invalid credentials" }));
    }
  } catch (error) {
    res.statusCode = 400; // Bad Request
    res.end(JSON.stringify({ message: "Invalid JSON in request body" }));
  }
};

const handleGet = (req, res, db, url) => {
  // Add a specific handler for the stats route
  if (url.pathname === "/dashboard/stats") {
    const stats = {
      totalJobs: db.jobs?.length || 0,
      totalUsers: db.users?.length || 0,
      // You can add more stats here later (e.g., total candidates)
    };
    res.statusCode = 200;
    return res.end(JSON.stringify(stats));
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  const resource = pathSegments[1];
  const id = pathSegments[2];

  if (!resource) {
    res.statusCode = 200;
    return res.end(JSON.stringify({ message: "Mock API is running 🚀" }));
  }

  if (db[resource]) {
    if (id) {
      const item = db[resource].find((item) => item.id == id);
      res.statusCode = item ? 200 : 404;
      return res.end(JSON.stringify(item || { message: "Not found" }));
    }
    res.statusCode = 200;
    return res.end(JSON.stringify(db[resource]));
  }

  // Fallback for unknown GET routes
  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Resource not found" }));
};

const requestHandler = (req, res) => {
  // --- Set CORS and Content-Type Headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));

  req.on("end", () => {
    try {
      const dbPath = path.join(process.cwd(), "db.json");
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      const url = new URL(req.url, "http://localhost");

      switch (req.method) {
        case "POST":
          if (url.pathname === "/auth/login") return handleLogin(req, res, db, body);
          break;
        case "GET":
          return handleGet(req, res, db, url);
      }
      // Fallback for unhandled methods/routes
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Route not found" }));
    } catch (error) {
      console.error("Server Error:", error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }
  });
};

module.exports = requestHandler;