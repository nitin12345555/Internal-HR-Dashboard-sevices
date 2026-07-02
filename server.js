const http = require('http');
const handler = require('./api/index.js');

const PORT = process.env.PORT || 3002;

const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`[server] Server listening on port ${PORT}`);
});