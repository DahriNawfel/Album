const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');


const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;

  // Si c'est la racine ou une route SPA, servir index.html
  if (pathname === './' || !path.extname(pathname)) {
    pathname = './index.html';
  }

  fs.readFile(pathname, (err, data) => {
    if (err) {
      // Si le fichier n'existe pas, servir index.html pour le routage SPA
      if (err.code === 'ENOENT') {
        fs.readFile('./index.html', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end('Erreur serveur');
            return;
          }
          res.setHeader('Content-Type', 'text/html');
          res.end(data);
        });
      } else {
        res.statusCode = 500;
        res.end('Erreur serveur');
      }
      return;
    }

    // Déterminer le type MIME
    const ext = path.extname(pathname).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});