// serve.ts — serve game/ on http://localhost:8080 for play-testing.
// Node 22, standard library only. Run: node serve.ts

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = createServer(async (req, res) => {
  const raw = (req.url || '/').split('?')[0];
  const path = raw === '/' ? '/index.html' : raw;
  try {
    const body = await readFile(join(here, 'game', path));
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(8080, () => console.log('Pasar Malam on http://localhost:8080'));
