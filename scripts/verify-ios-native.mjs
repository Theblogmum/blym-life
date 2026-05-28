import { existsSync, readFileSync } from 'node:fs';

const forbidden = [/https:\/\/(www\.)?blym\.life/i, /server\s*:\s*{[^}]*url\s*:/is, /liveReload/i];
const files = ['capacitor.config.ts', 'ios/App/App/capacitor.config.json'];

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing ${file}. Run npx cap add ios first if needed.`);
  const text = readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(text)) throw new Error(`${file} still contains remote/live web configuration: ${pattern}`);
  }
}

const generated = JSON.parse(readFileSync('ios/App/App/capacitor.config.json', 'utf8'));
if (generated.server?.url) throw new Error('Generated iOS config still has server.url. Delete it and run npx cap sync ios again.');
if (!existsSync('dist/client/index.html')) throw new Error('Missing dist/client/index.html. The native app has no local bundle to load.');

console.log('iOS native config verified: local bundled assets only, no server.url, no blym.life launch URL.');
