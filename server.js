const http = require('http');
const handler = require('./api/index.js');

const PORT = 3000;

const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`[server] Development server running at http://localhost:${PORT}`);
  console.log(`[server] Try accessing: http://localhost:${PORT}/api/jobs`);
});