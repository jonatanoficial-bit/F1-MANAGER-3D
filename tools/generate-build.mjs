import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(path.join(root, rel), JSON.stringify(value, null, 2) + '\n');
const sourcePath = path.join(root, 'config', 'build-source.json');
const build = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const required = ['version','build_code','phase','phase_name','date','date_iso','time_brt','timezone','iso','utc','label','save_schema','assets_manifest','app_shell_schema'];
for (const key of required) {
  if (build[key] === undefined || build[key] === '') throw new Error(`BUILD_FIELD_MISSING:${key}`);
}
if (!/^\d+\.\d+\.\d+$/.test(build.version)) throw new Error(`BUILD_VERSION_INVALID:${build.version}`);
if (!/^F1M3D-\d+\.\d+\.\d+-F\d{2}$/.test(build.build_code)) throw new Error(`BUILD_CODE_INVALID:${build.build_code}`);
if (Number(build.phase) !== Number(build.build_code.match(/-F(\d{2})$/)?.[1])) throw new Error('BUILD_PHASE_CODE_MISMATCH');
if (Number.isNaN(Date.parse(build.iso)) || Number.isNaN(Date.parse(build.utc))) throw new Error('BUILD_DATE_INVALID');

const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex').slice(0,12).toUpperCase();
build.source_hash = sourceHash;
build.generated_by = 'tools/generate-build.mjs';

writeJson('BUILD_INFO.json', build);
writeJson('data/build.json', build);
fs.writeFileSync(path.join(root, 'data', 'build-info.js'), `globalThis.F1M_BUILD = Object.freeze(${JSON.stringify(build)});\n`);

const pkg = readJson('package.json');
pkg.version = build.version;
writeJson('package.json', pkg);
const packageLockPath = path.join(root, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  packageLock.version = build.version;
  if (packageLock.packages && packageLock.packages['']) packageLock.packages[''].version = build.version;
  writeJson('package-lock.json', packageLock);
}

const manifest = readJson('manifest.webmanifest');
manifest.version = build.version;
manifest.description = `F1 Manager Career 2026 — ${build.phase_name}. Build ${build.build_code}, mobile-first, PWA e saves versionados.`;
writeJson('manifest.webmanifest', manifest);

const assetManifestPath = path.join(root, 'assets', 'ASSET_MANIFEST.json');
if (fs.existsSync(assetManifestPath)) {
  const assetManifest = JSON.parse(fs.readFileSync(assetManifestPath, 'utf8'));
  assetManifest.build_code = build.build_code;
  assetManifest.build_version = build.version;
  assetManifest.manifest_version = Number(build.assets_manifest);
  assetManifest.updated_at = build.iso;
  writeJson('assets/ASSET_MANIFEST.json', assetManifest);
}

const indexPath = path.join(root, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(/(<meta name="f1m-build-code" content=")[^"]*(" \/>)/, `$1${build.build_code}$2`);
index = index.replace(/(<meta name="f1m-build-version" content=")[^"]*(" \/>)/, `$1${build.version}$2`);
fs.writeFileSync(indexPath, index);

for (const rel of ['assets/ASSET_PATHS_REQUIRED.txt','assets/README_ASSETS.txt','README_ASSETS_SEM_BINARIOS.txt']) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/F1M3D-\d+\.\d+\.\d+-F\d{2}/g, build.build_code);
  text = text.replace(/v\d+\.\d+\.\d+-F\d{2}/g, `v${build.version}-F${String(build.phase).padStart(2,'0')}`);
  fs.writeFileSync(file, text);
}

const appShell = readJson('config/app-shell.json');
if (!Array.isArray(appShell.files) || appShell.files.length < 5) throw new Error('APP_SHELL_INVALID');
writeJson('data/app-shell.json', { schema:Number(build.app_shell_schema), build_code:build.build_code, files:appShell.files });

const swPath = path.join(root, 'service-worker.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  const shellLiteral = JSON.stringify(appShell.files, null, 2);
  const shellStart = sw.indexOf('const APP_SHELL = [');
  const shellEnd = shellStart >= 0 ? sw.indexOf('];', shellStart) : -1;
  if (shellStart < 0 || shellEnd < 0) throw new Error('SERVICE_WORKER_APP_SHELL_NOT_FOUND');
  sw = sw.slice(0, shellStart) + `const APP_SHELL = ${shellLiteral};` + sw.slice(shellEnd + 2);
  fs.writeFileSync(swPath, sw);
}

const report = {
  build_code:build.build_code,
  version:build.version,
  source_hash:sourceHash,
  synchronized:[
    'BUILD_INFO.json','data/build.json','data/build-info.js','package.json','manifest.webmanifest',
    'assets/ASSET_MANIFEST.json','index.html','data/app-shell.json','service-worker.js'
  ],
  generated_at:new Date().toISOString()
};
writeJson('test-results/build-sync-report.json', report);
console.log(`Build sincronizada: ${build.build_code} • fonte ${sourceHash}`);
