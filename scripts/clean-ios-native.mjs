import { existsSync, rmSync } from 'node:fs';

const paths = [
  'ios/App/App/capacitor.config.json',
  'ios/App/App/public',
];

for (const path of paths) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
    console.log(`Removed stale ${path}`);
  } else {
    console.log(`Not present: ${path}`);
  }
}
