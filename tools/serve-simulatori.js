// Serve tools/simulatori.html su http://localhost:8091 (dec. 184). L'app web deve girare su 8090 (npx expo start --web --port 8090).
// Uso: node tools/serve-simulatori.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8091;
const file = path.join(__dirname, 'simulatori.html');

http
  .createServer((req, res) => {
    if (req.url !== '/' && !req.url.startsWith('/?') && req.url !== '/simulatori.html') {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, '127.0.0.1', () => console.log(`Simulatori: http://localhost:${PORT}`));
