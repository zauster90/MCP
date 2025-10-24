#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const port = Number(process.env.PORT || 5173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const resolvePath = async (urlPath) => {
  const cleanPath = urlPath.replace(/\.\.+/g, '').split('?')[0];
  const candidatePaths = [
    join(projectRoot, cleanPath),
    join(projectRoot, cleanPath, 'index.html'),
    join(publicDir, cleanPath),
    join(publicDir, cleanPath, 'index.html'),
  ];
  for (const candidate of candidatePaths) {
    try {
      const stats = await stat(candidate);
      if (stats.isFile()) {
        return candidate;
      }
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        console.error(error);
      }
    }
  }
  return null;
};

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  const requestPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = await resolvePath(requestPath);

  if (!filePath) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);

  if (contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('javascript')) {
    const data = await readFile(filePath, 'utf8');
    res.end(data);
  } else {
    createReadStream(filePath).pipe(res);
  }
});

server.listen(port, () => {
  console.log(`GLSL PlayLab dev server running at http://localhost:${port}`);
});
