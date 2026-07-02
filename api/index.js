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
  const dbPath = path.join(__dirname, '..', 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));


  const urlParts = req.url.split('/').filter(part => part);
  const resource = urlParts[1]; 
  const id = urlParts[2]; 

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