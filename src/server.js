const http = require('http');
const config = require('./config');
const handler = require('./handler');

const server = http.createServer(handler);

function start() {
  server.listen(config.port, config.hostname, () => {
    console.log(`Server running at http://${config.hostname}:${config.port}/`);
  });
}

module.exports = { start };
