const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  const dbPath = path.join(process.cwd(), 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));


  // Use the URL constructor for robust parsing.
  // The base URL is required but doesn't matter since we only need the pathname.
  const url = new URL(req.url, `http://${req.headers.host}`);
  // pathname for '/api/jobs/1' will be '/api/jobs/1'
  const pathSegments = url.pathname.split('/').filter(Boolean); // ['api', 'jobs', '1']

  const resource = pathSegments[1]; // 'jobs'
  const id = pathSegments[2];       // '1'
  res.setHeader('Content-Type', 'application/json');

  if (db[resource]) {
    if (id) {
      const item = db[resource].find(item => item.id == id);
      res.status(200).json(item || { message: 'Not found' });
    } else {
      res.status(200).json(db[resource]);
    }
  } else {
    res.status(404).json({ message: 'Resource not found' });
  }
};