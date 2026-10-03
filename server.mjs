import http from 'node:http';
import { createAuthService } from './auth-service.mjs';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.json': 'application/json; charset=utf-8' };
if(existsSync(resolve(root,'.env')))process.loadEnvFile(resolve(root,'.env'));
const port = Number(process.env.PORT || 4186);
const origin=process.env.APP_ORIGIN || `http://localhost:${port}`;
const auth=createAuthService({dbPath:resolve(root,'data/progress.sqlite'),clientId:process.env.GOOGLE_CLIENT_ID,origin});
http.createServer(async (req, res) => {
  try {
    if(await auth.handle(req,res))return;
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root) || pathname.split('/').some(p => p.startsWith('.')) || pathname.startsWith('/data/') || !(extname(file) in mime)) {
      res.writeHead(403).end('Forbidden'); return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)], 'Cache-Control': extname(file)==='.mp3'?'public, max-age=604800':'no-cache', 'X-Content-Type-Options':'nosniff' });
    res.end(body);
  } catch { if (!res.headersSent) res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Word Odyssey: http://localhost:${port}`));
