import { readdir, readFile, writeFile, mkdir, copyFile, rm, lstat } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const destination = resolve(root, 'dist');
const frontendModules = new Set([
  'practice-panel.js', 'learning-state.js', 'recall-support.js', 'reading-practice.js', 'learning-station.js', 'app.js', 'choice-keyboard.js', 'auto-advance.js', 'adventure-state.js', 'auth.js', 'auth-state.js', 'audio-manifest.js',
  'data.js', 'engine.js', 'i18n.js', 'map-scenes.js', 'story.js', 'vocabulary.js',
  'voice.js', 'quest-visuals.js', 'microquest-scenes.js', 'curated-missions.js', 'story-content.js', 'story-contract.js', 'curriculum-support.js',
]);
const styles = new Set(['style.css', 'story.css', 'voice.css', 'learning.css', 'quest-visuals.css']);
const files = new Set(['index.html']);
const html = await readFile(resolve(root, 'index.html'), 'utf8');

async function includeModule(name) {
  if (!frontendModules.has(name)) throw new Error(`前端模組不在公開白名單：${name}`);
  if (files.has(name)) return;
  files.add(name);
  const source = await readFile(resolve(root, name), 'utf8');
  const imports = [...source.matchAll(/(?:\b(?:import|export)\s+(?:[^'";]+?\s+from\s*)?|\bimport\s*\(\s*)['"]([^'"]+)['"]/g)];
  for (const [, specifier] of imports) {
    if (!/^\.\/[a-z][a-z0-9-]*\.js$/.test(specifier)) throw new Error(`前端引用路徑不安全：${name} → ${specifier}`);
    await includeModule(specifier.slice(2));
  }
}
for (const [, source] of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)) {
  if (source === 'https://xuexi-hangzhan-api.hk6429.workers.dev/naicheng-sso.js') continue;
  await includeModule(source.replace(/^\.\//, ''));
}
for (const tag of html.matchAll(/<link\b[^>]*>/g)) {
  if (!/\brel=["']stylesheet["']/.test(tag[0])) continue;
  const name = tag[0].match(/\bhref=["']([^"']+)["']/)?.[1];
  if (!styles.has(name)) throw new Error(`樣式不在公開白名單：${name}`);
  files.add(name);
}
async function includeAssets(directory, extensions) {
  const entries=await readdir(resolve(root, directory), { withFileTypes: true });
  const names=new Set(entries.filter(entry=>entry.isFile()).map(entry=>entry.name));
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if(entry.name.endsWith('.png')&&names.has(entry.name.replace(/\.png$/,'.webp')))continue;
    const name = `${directory}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`公開素材不得為符號連結：${name}`);
    if (entry.isDirectory()) await includeAssets(name, extensions);
    else if (entry.isFile() && extensions.has(extname(name))) files.add(name);
  }
}
await includeAssets('assets', new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico', '.woff', '.woff2']));
await includeAssets('audio', new Set(['.mp3', '.ogg', '.wav']));
if (files.size + 1 > 20000) throw new Error('公開檔案超過 Cloudflare Workers 免費方案 20,000 檔上限。');
// Validate the complete inventory before touching the previous build.
for (const name of files) {
  const stat = await lstat(resolve(root, name));
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`公開來源不是一般檔案：${name}`);
  if (stat.size > 25 * 1024 * 1024) throw new Error(`公開檔案超過 25 MiB：${name}`);
}
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const name of files) {
  const target = resolve(destination, name);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, name), target);
}
await writeFile(resolve(destination, '_headers'), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Cross-Origin-Opener-Policy: same-origin-allow-popups
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://accounts.google.com/gsi/client https://xuexi-hangzhan-api.hk6429.workers.dev; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style https://fonts.googleapis.com; img-src 'self' data: https://*.googleusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://accounts.google.com/gsi/ https://xuexi-hangzhan-api.hk6429.workers.dev; frame-src https://accounts.google.com/gsi/; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

/
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache

/*.js
  Cache-Control: no-cache

/*.css
  Cache-Control: no-cache

/assets/*
  Cache-Control: public, max-age=3600, must-revalidate

/audio/*
  Cache-Control: public, max-age=86400, must-revalidate
`);
console.log(`靜態建置完成：${files.size} 個公開檔案；前端模組 ${[...files].filter(name => name.endsWith('.js')).length} 個。`);
