import { spawnSync } from 'node:child_process';
import { copyFileSync, lstatSync, mkdirSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = realpathSync(join(import.meta.dirname, '..'));
const site = join(root, '_site');
const existingSite = lstatSync(site, { throwIfNoEntry: false });
if (existingSite) {
  if (!existingSite.isDirectory() || existingSite.isSymbolicLink() || realpathSync(site) !== site) {
    throw new Error('_site must be a directory inside the repository');
  }
  rmSync(site, { recursive: true });
}

const compiler = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
for (const config of ['tsconfig.json', 'tsconfig.worker.json']) {
  const result = spawnSync(process.execPath, [compiler, '-p', config], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const file of ['index.html', 'manifest.webmanifest', 'css/style.css']) {
  copyAsset(file);
}
for (const [dir, extension] of [['data', '.js'], ['icons', '.png']]) {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(extension)) copyAsset(join(dir, entry.name));
  }
}

function copyAsset(file) {
  const source = join(root, file);
  if (!lstatSync(source).isFile()) throw new Error(`Expected a regular asset file: ${file}`);
  const destination = join(site, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}
