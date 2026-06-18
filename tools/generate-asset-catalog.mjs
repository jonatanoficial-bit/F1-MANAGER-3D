import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'assets', 'ASSET_MANIFEST.json');
const outputPath = path.join(root, 'data', 'asset-catalog.js');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const classify = assetPath => {
  const value = String(assetPath || '').toLowerCase();
  const ext = value.split('.').pop();
  if(['mp3','ogg','wav','m4a','aac','flac'].includes(ext)) return 'audio';
  if(['glb','gltf','fbx','obj','bin'].includes(ext)) return 'model';
  if(['woff','woff2','ttf','otf'].includes(ext)) return 'font';
  if(value.includes('/backgrounds/')) return 'background';
  if(value.includes('/drivers/') || value.includes('/avatars/')) return 'avatar';
  if(value.includes('/teams/logos/')) return 'logo';
  if(value.includes('/flags/')) return 'flag';
  if(value.includes('/tracks/')) return 'track';
  if(value.includes('/icons/')) return 'icon';
  if(['png','jpg','jpeg','webp','gif','svg','avif'].includes(ext)) return 'image';
  return 'unknown';
};
const entries = (manifest.entries || []).map(entry => ({
  path:entry.path,
  type:classify(entry.path),
  required:Boolean(entry.required),
  referenced:Boolean(entry.referenced),
  original_present:Boolean(entry.original_present),
  original_size_bytes:Number(entry.original_size_bytes || 0),
  original_sha256:String(entry.original_sha256 || ''),
  delivery_status:String(entry.delivery_status || ''),
  runtime_referenced_by:Array.isArray(entry.runtime_referenced_by) ? entry.runtime_referenced_by : [],
  legacy_or_documentation_referenced_by:Array.isArray(entry.legacy_or_documentation_referenced_by) ? entry.legacy_or_documentation_referenced_by : []
})).sort((a,b) => a.path.localeCompare(b.path));
const catalog = {
  manifest_version:Number(manifest.manifest_version || 0),
  build_code:String(manifest.build_code || ''),
  build_version:String(manifest.build_version || ''),
  generated_at:new Date().toISOString(),
  policy:'Catálogo runtime sem binários; caminhos case-sensitive, placeholders em memória e auditoria automática.',
  counts:{...(manifest.counts || {}), catalogue_entries:entries.length},
  entries
};
const js = `globalThis.F1M_ASSET_CATALOG = Object.freeze(${JSON.stringify(catalog)});\n`;
fs.writeFileSync(outputPath, js);
console.log(`Catálogo runtime gerado: ${entries.length} assets • ${outputPath}`);
