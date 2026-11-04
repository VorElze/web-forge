#!/usr/bin/env node
/**
 * codemap — dependency-free code map.
 * Fallback for projects without graphify: writes graphify-out/GRAPH_REPORT.md
 * so the `graph` gate is satisfiable everywhere.
 *
 *   node scripts/codemap.mjs [--root .] [--out graphify-out] [--max 4000]
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const root = path.resolve(arg('root', '.'));
const outDir = path.resolve(root, arg('out', 'graphify-out'));
const maxFiles = Number(arg('max', 4000));

const SKIP = new Set([
  'node_modules', 'vendor', '.git', '.forge', 'graphify-out', 'dist', 'build',
  '.next', '.nuxt', 'coverage', '.turbo', '.cache', '.idea', '.vscode', 'tmp',
  'storage', '.svelte-kit', 'target', 'bin', 'obj',
]);

const LANG = {
  '.php': 'PHP', '.blade.php': 'Blade', '.js': 'JavaScript', '.mjs': 'JavaScript',
  '.cjs': 'JavaScript', '.ts': 'TypeScript', '.tsx': 'TypeScript', '.jsx': 'JavaScript',
  '.vue': 'Vue', '.svelte': 'Svelte', '.css': 'CSS', '.scss': 'SCSS', '.html': 'HTML',
  '.py': 'Python', '.go': 'Go', '.rs': 'Rust', '.rb': 'Ruby', '.cs': 'C#',
  '.java': 'Java', '.kt': 'Kotlin', '.md': 'Markdown', '.json': 'JSON',
  '.yml': 'YAML', '.yaml': 'YAML', '.sql': 'SQL', '.sh': 'Shell', '.ps1': 'PowerShell',
};

const CODE = new Set(['PHP', 'Blade', 'JavaScript', 'TypeScript', 'Vue', 'Svelte', 'Python', 'Go', 'Rust', 'Ruby', 'C#', 'Java', 'Kotlin']);

function walk(dir, acc = [], depth = 0) {
  if (depth > 14 || acc.length >= maxFiles) return acc;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (acc.length >= maxFiles) break;
    if (e.isDirectory()) {
      if (SKIP.has(e.name) || e.name.startsWith('.git')) continue;
      walk(path.join(dir, e.name), acc, depth + 1);
    } else if (e.isFile()) {
      acc.push(path.join(dir, e.name));
    }
  }
  return acc;
}

function langOf(file) {
  if (file.endsWith('.blade.php')) return 'Blade';
  return LANG[path.extname(file).toLowerCase()] || null;
}

function readText(file) {
  try {
    const buf = fs.readFileSync(file);
    if (buf.length > 1_500_000) return '';
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

const files = walk(root);
const byLang = new Map();
const entries = [];
const imports = new Map(); // file -> [resolved-ish module names]
const importedBy = new Map();

for (const abs of files) {
  const lang = langOf(abs);
  if (!lang) continue;
  const rel = path.relative(root, abs).split(path.sep).join('/');
  let text = '';
  let lines = 0;
  try {
    text = readText(abs);
    lines = text ? text.split('\n').length : 0;
  } catch {}
  const rec = byLang.get(lang) || { files: 0, lines: 0, bytes: 0 };
  rec.files++;
  rec.lines += lines;
  rec.bytes += fs.statSync(abs).size;
  byLang.set(lang, rec);

  if (!CODE.has(lang)) continue;
  const deps = new Set();
  const patterns = [
    /(?:^|\n)\s*(?:import\s+[^;'\n]*from\s*|import\s*|export\s+[^;'\n]*from\s*)['"]([^'"]+)['"]/g,
    /require\(\s*['"]([^'"]+)['"]\s*\)/g,
    /(?:^|\n)\s*use\s+([A-Za-z0-9_\\]+)/g,
    /@include\(\s*['"]([^'"]+)['"]/g,
    /@extends\(\s*['"]([^'"]+)['"]/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) deps.add(m[1]);
  }
  if (deps.size) {
    imports.set(rel, [...deps]);
    for (const d of deps) importedBy.set(d, (importedBy.get(d) || 0) + 1);
  }
  entries.push({ rel, lang, lines, bytes: fs.statSync(abs).size });
}

const totalLines = [...byLang.values()].reduce((n, v) => n + v.lines, 0);
const codeLines = [...byLang.entries()].filter(([k]) => CODE.has(k)).reduce((n, [, v]) => n + v.lines, 0);

const entryHints = /(^|\/)(index|main|app|server|bootstrap|artisan|routes\/web\.php|pages\/index|src\/main)\.(php|js|mjs|ts|tsx|jsx|py|go|rs|html)$/i;
const entryPoints = entries.filter((e) => entryHints.test(e.rel)).map((e) => e.rel).slice(0, 20);

const largest = [...entries].sort((a, b) => b.lines - a.lines).slice(0, 15);
const godNodes = [...importedBy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
const topDirs = new Map();
for (const e of entries) {
  const top = e.rel.includes('/') ? e.rel.split('/')[0] : '(root)';
  const d = topDirs.get(top) || { files: 0, lines: 0 };
  d.files++;
  d.lines += e.lines;
  topDirs.set(top, d);
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const now = new Date().toISOString();

const md = [];
md.push('# Code map', '');
md.push(`Dibangun: ${now}`);
md.push(`Akar: \`${root}\``);
md.push(`Berkas dipindai: **${files.length}** · baris kode: **${codeLines}** · total baris teks: ${totalLines}`, '');
md.push('> Peta ini dibuat oleh `scripts/codemap.mjs` (tanpa dependensi).');
md.push('> Bila `graphify` terpasang, jalankan `graphify update .` untuk peta relasi yang lebih kaya.');
md.push('');
md.push('## Bahasa', '', '| Bahasa | Berkas | Baris | Ukuran |', '|---|---:|---:|---:|');
for (const [lang, v] of [...byLang.entries()].sort((a, b) => b[1].lines - a[1].lines)) {
  md.push(`| ${lang} | ${v.files} | ${v.lines} | ${kb(v.bytes)} |`);
}
md.push('', '## Direktori teratas', '', '| Direktori | Berkas | Baris |', '|---|---:|---:|');
for (const [d, v] of [...topDirs.entries()].sort((a, b) => b[1].lines - a[1].lines).slice(0, 20)) {
  md.push(`| ${d} | ${v.files} | ${v.lines} |`);
}
md.push('', '## Titik masuk', '');
if (entryPoints.length) for (const e of entryPoints) md.push(`- \`${e}\``);
else md.push('- (tidak terdeteksi — cari manual berkas yang dijalankan)');
md.push('', '## Berkas terbesar', '', '| Berkas | Baris | Ukuran |', '|---|---:|---:|');
for (const e of largest) md.push(`| \`${e.rel}\` | ${e.lines} | ${kb(e.bytes)} |`);
md.push('', '## Modul paling banyak diimpor (god nodes)', '');
if (godNodes.length) {
  md.push('| Modul | Pemakai |', '|---|---:|');
  for (const [m, n] of godNodes) md.push(`| \`${m.replace(/\|/g, '\\|')}\` | ${n} |`);
} else {
  md.push('- (tidak ada pola impor terdeteksi)');
}
md.push('', '## Cara memakai peta ini', '');
md.push('1. Mulai dari **Titik masuk**, bukan dari berkas acak.');
md.push('2. Sebelum mengubah perilaku, cari modulnya di **god nodes** — di situ dampaknya paling luas.');
md.push('3. Berkas terbesar biasanya tempat bug bersembunyi; baca sebelum menambah baris.');
md.push('4. Bangun ulang peta setelah perubahan besar; laporan yang lebih tua dari kode dianggap basi.');
md.push('');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'GRAPH_REPORT.md'), md.join('\n'), 'utf8');
fs.writeFileSync(
  path.join(outDir, 'graph.json'),
  `${JSON.stringify({ generated: now, root, files: files.length, languages: Object.fromEntries(byLang), entryPoints, largest, godNodes, imports: Object.fromEntries(imports) }, null, 2)}\n`,
  'utf8',
);

console.log(`codemap: ${files.length} berkas, ${codeLines} baris kode → ${path.relative(process.cwd(), outDir) || outDir}`);
console.log(`  GRAPH_REPORT.md + graph.json`);
