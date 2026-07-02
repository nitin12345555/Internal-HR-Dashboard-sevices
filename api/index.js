const path = require("path");
const fs = require("fs");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  const dbPath = path.join(process.cwd(), "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  const url = new URL(req.url, "http://localhost");
  const pathSegments = url.pathname.split("/").filter(Boolean);

  const resource = pathSegments[1];
  const id = pathSegments[2];

  // Handle root URL request
  if (!resource) {
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        message: "Mock API is running 🚀",
      })
    );
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

  res.statusCode = 404;
  return res.end(JSON.stringify({ message: "Resource not found" }));
};