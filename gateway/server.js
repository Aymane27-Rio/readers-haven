const http = require('http');

const PORT = 3000;

console.log('DEBUG: Starting minimal HTTP server...');
console.log('DEBUG: PORT =', PORT);

const server = http.createServer((req, res) => {
  console.log('Request:', req.method, req.url);

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'gateway' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'gateway', path: req.url }));
  }
});

server.listen(PORT, () => {
  console.log('Minimal gateway server listening on port', PORT);
});
