// Temporary, private-interface HTTPS preview. Certificates stay in ignored .tmp.
// This serves dist and a public CA download only; never proxy auth or log URLs.
import http from 'node:http';
import https from 'node:https';
import { X509Certificate } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import { log } from 'node:console';
import { setTimeout } from 'node:timers';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const host = process.argv[2];
const octets = host?.split('.').map(Number);
if (!octets || octets.length !== 4 || octets.some(n => !Number.isInteger(n) || n < 0 || n > 255)
  || !(octets[0] === 10 || octets[0] === 192 && octets[1] === 168 || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)) {
  throw new Error('Supply the owner-approved private LAN IPv4 address; wildcard/public binds are rejected.');
}
// A diagnostic restart can retain the original deadline; never extend past two hours.
const startedAt = Date.now();
const stopAt = Math.min(startedAt + 2 * 60 * 60 * 1000, process.argv[3] ? Date.parse(process.argv[3]) : Infinity);
if (!Number.isFinite(stopAt) || stopAt <= startedAt) throw new Error('Supply an unexpired ISO shutdown deadline.');
const dist = resolve(root, 'dist');
const tlsDir = resolve(root, '.tmp/day01-tls');
const caPem = readFileSync(resolve(tlsDir, 'public/ca.pem'));
const ca = new X509Certificate(caPem);
const key = readFileSync(resolve(tlsDir, 'private/leaf.key'));
const cert = readFileSync(resolve(tlsDir, 'private/leaf.pem'));
const leaf = new X509Certificate(cert);
if (!leaf.checkIP(host) || new Date(leaf.validTo).getTime() <= Date.now()) throw new Error('Certificate IP/expiry does not match this test.');
if (!existsSync(resolve(dist, 'index.html'))) throw new Error('Run npm run build first.');

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml' };
function reply(response, code, body, type = 'text/plain; charset=utf-8', head = false) {
  response.writeHead(code, { ...headers, 'Content-Type': type }); response.end(head ? undefined : body);
}
const secure = https.createServer({ key, cert, minVersion: 'TLSv1.2' }, (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) return reply(response, 405, 'GET/HEAD only');
  try {
    const pathname = decodeURIComponent(new URL(request.url, `https://${host}`).pathname);
    if (pathname.includes('\\') || pathname.split('/').some(part => part.startsWith('.'))) return reply(response, 404, 'Not found');
    const file = pathname === '/' || pathname === '/auth/callback' ? resolve(dist, 'index.html') : resolve(dist, `.${pathname}`);
    if (!file.startsWith(dist + sep) || !existsSync(file) || !statSync(file).isFile()
      || !realpathSync(file).startsWith(realpathSync(dist) + sep) || !types[extname(file)]) return reply(response, 404, 'Not found');
    reply(response, 200, readFileSync(file), types[extname(file)], request.method === 'HEAD');
  } catch { reply(response, 400, 'Invalid request'); }
});
const setup = http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) return reply(response, 405, 'GET/HEAD only');
  let path;
  try { path = new URL(request.url, `http://${host}`).pathname; }
  catch { return reply(response, 400, 'Invalid request'); }
  if (path === '/ca.cer') return reply(response, 200, readFileSync(resolve(tlsDir, 'public/ca.cer')), 'application/x-x509-ca-cert', request.method === 'HEAD');
  if (path !== '/') return reply(response, 404, 'Not found');
  reply(response, 200, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Day 01 HTTPS setup</title>
<h1>Movie Night Engine: temporary HTTPS test</h1><p>This HTTP page only supplies the public test certificate. Do not sign in here.</p>
<p>Install/trust the certificate only after the owner approves this exact temporary test. Remove it after the session.</p>
<p><a href="/ca.cer">Download public test CA certificate</a></p><p>CA SHA-256 fingerprint: <code>${ca.fingerprint256}</code></p>
<p>CA expires: ${ca.validTo}</p><p>After trust and the Supabase redirect allowlist are ready, open <a href="https://${host}:4173/">https://${host}:4173/</a>.</p>
<p>App callback: <code>https://${host}:4173/auth/callback</code>. The servers stop automatically after two hours.</p></html>`, 'text/html; charset=utf-8', request.method === 'HEAD');
});
// Count remote TCP arrivals only. No peer identifiers, URLs, headers or bodies.
for (const [label, server] of [['HTTPS', secure], ['HTTP', setup]]) {
  let arrivals = 0;
  server.on('connection', socket => {
    if (socket.remoteAddress !== host && socket.remoteAddress !== '127.0.0.1') {
      log(`${new Date().toISOString()} ${label} remote TCP arrivals: ${++arrivals}`);
    }
  });
}
let stopped = false;
function stop() { if (stopped) return; stopped = true; secure.close(); setup.close(); secure.closeAllConnections(); setup.closeAllConnections(); log('Day 01 preview stopped.'); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
secure.on('error', error => { log(`HTTPS preview unavailable (${error.code ?? 'listen error'}).`); stop(); });
setup.on('error', error => { log(`Certificate download unavailable (${error.code ?? 'listen error'}).`); stop(); });
secure.listen(4173, host, () => log(`Day 01 app: https://${host}:4173/`));
setup.listen(4172, host, () => log(`Public CA setup only: http://${host}:4172/\nCA SHA-256: ${ca.fingerprint256}`));
log(`Day 01 automatic shutdown: ${new Date(stopAt).toISOString()}`);
setTimeout(stop, stopAt - Date.now()).unref();
