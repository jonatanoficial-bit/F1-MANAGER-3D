import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['FILE_MANIFEST.sha256','FILE_LIST.txt']);
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
  const full = path.join(dir,entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const files = walk(root).filter(file => !file.includes(`${path.sep}.git${path.sep}`) && !excluded.has(path.basename(file))).sort();
const rows = files.map(file => {
  const rel = path.relative(root,file).split(path.sep).join('/');
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  return `${hash}  ${rel}`;
});
fs.writeFileSync(path.join(root,'FILE_MANIFEST.sha256'), rows.join('\n')+'\n');
fs.writeFileSync(path.join(root,'FILE_LIST.txt'), files.map(file=>path.relative(root,file).split(path.sep).join('/')).join('\n')+'\n');
console.log(`Manifesto gerado: ${files.length} arquivos`);
