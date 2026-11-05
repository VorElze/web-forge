#!/usr/bin/env node
/**
 * web-forge CLI — one command, nine gated phases.
 * Zero dependencies. Node 20+.
 *
 *   node scripts/forge.mjs doctor
 *   node scripts/forge.mjs new "Nama Situs" --stack laravel
 *   node scripts/forge.mjs gate --url http://127.0.0.1:8080
 *   node scripts/forge.mjs gate --release
 *   node scripts/forge.mjs ledger mark design-taste-frontend --proof docs/PLAN.md
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const TTY = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (TTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const c = {
  ok: (s) => paint('32', s),
  bad: (s) => paint('31', s),
  warn: (s) => paint('33', s),
  dim: (s) => paint('2', s),
  bold: (s) => paint('1', s),
};

const STATUS = { PASS: 'PASS', FAIL: 'FAIL', SKIP: 'SKIP', WARN: 'WARN' };

/* ---------------------------------------------------------------- helpers */

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || 'help';
const projectRoot = path.resolve(args.project || process.cwd());

const SKIP_DIRS = new Set([
  'node_modules', 'vendor', '.git', '.forge', 'graphify-out', 'dist', 'build',
  '.next', '.nuxt', 'coverage', '.turbo', '.cache', 'storage', 'public/build',
  '.idea', '.vscode', 'tmp', 'temp',
]);

// Cache directories that are not source: artisan/composer regenerate these.
const SKIP_PATHS = ['bootstrap/cache', '.phpunit.cache'];

const TEXT_EXT = new Set([
  '.php', '.blade.php', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue',
  '.svelte', '.css', '.scss', '.html', '.json', '.md', '.yml', '.yaml', '.txt',
  '.py', '.rb', '.go', '.rs', '.cs', '.env', '.ini', '.xml', '.twig',
]);

function walk(dir, acc = [], depth = 0) {
  if (depth > 12) return acc;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      const abs = path.join(dir, e.name);
      const relDir = path.relative(projectRoot, abs).split(path.sep).join('/');
      if (SKIP_PATHS.some((p) => relDir === p || relDir.startsWith(`${p}/`))) continue;
      walk(abs, acc, depth + 1);
    } else if (e.isFile()) {
      acc.push(path.join(dir, e.name));
    }
  }
  return acc;
}

function read(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function rel(p) {
  return path.relative(projectRoot, p).split(path.sep).join('/');
}

function run(cmd, opts = {}) {
  const res = spawnSync(cmd, {
    cwd: projectRoot,
    shell: true,
    encoding: 'utf8',
    timeout: opts.timeout || 300000,
    // The inspector prints a long log for tall pages; the 1 MB default kills it mid-run.
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, CI: '1', NO_COLOR: '1' },
  });
  const out = `${res.stdout || ''}${res.stderr || ''}`.trim();
  return { code: res.status, out: out.length > 6000 ? out.slice(-6000) : out, error: res.error };
}

// A browser that stalls is not a finding. Waiting between retries needs a blocking
// sleep because the gate runs synchronously end to end.
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function loadConfig() {
  const p = path.join(projectRoot, '.forge', 'config.json');
  const defaults = {
    project: path.basename(projectRoot),
    stack: 'auto',
    noExternalAssets: false,
    requireGates: ['brief', 'spec', 'plan', 'encoding', 'secrets', 'tests', 'graph'],
    auditRoutes: ['/'],
    widths: [390, 768, 1440],
    commands: {},
  };
  if (!exists(p)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(read(p)) };
  } catch {
    return defaults;
  }
}

function loadLedger() {
  const p = path.join(projectRoot, '.forge', 'ledger.json');
  if (!exists(p)) return null;
  try {
    return JSON.parse(read(p));
  } catch {
    return null;
  }
}

function saveJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
}

function loadManifest() {
  const candidates = [
    path.join(projectRoot, '.forge', 'manifest.json'),
    path.join(HERE, '..', 'manifest.json'),
  ];
  for (const p of candidates) {
    if (!exists(p)) continue;
    try {
      return JSON.parse(read(p));
    } catch {}
  }
  return null;
}

/* ------------------------------------------------------------ detection */

function detect() {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = exists(pkgPath) ? JSON.parse(read(pkgPath) || '{}') : null;
  const composer = exists(path.join(projectRoot, 'composer.json'))
    ? JSON.parse(read(path.join(projectRoot, 'composer.json')) || '{}')
    : null;

  let stack = 'unknown';
  if (exists(path.join(projectRoot, 'artisan'))) stack = 'laravel';
  else if (pkg && (pkg.dependencies?.next || pkg.devDependencies?.next)) stack = 'next';
  else if (pkg && (pkg.dependencies?.react || pkg.devDependencies?.react)) stack = 'react';
  else if (pkg && (pkg.dependencies?.vue || pkg.devDependencies?.vue)) stack = 'vue';
  else if (pkg) stack = 'node';
  else if (exists(path.join(projectRoot, 'index.html'))) stack = 'static';
  else if (composer) stack = 'php';

  return { stack, pkg, composer };
}

function detectCommands(cfg, det) {
  const user = cfg.commands || {};
  let test = user.test || null;
  let build = user.build || null;

  if (!test) {
    if (det.stack === 'laravel') test = 'php artisan test';
    else if (det.pkg?.scripts?.test) test = 'npm test';
    else if (exists(path.join(projectRoot, 'go.mod'))) test = 'go test ./...';
    else if (exists(path.join(projectRoot, 'Cargo.toml'))) test = 'cargo test';
    else if (exists(path.join(projectRoot, 'pytest.ini')) || exists(path.join(projectRoot, 'pyproject.toml'))) {
      test = 'python -m pytest -q';
    }
  }
  if (!build) {
    if (det.pkg?.scripts?.build) build = 'npm run build';
  }
  return { test, build };
}

/* --------------------------------------------------------------- checks */

function checkBrief() {
  const p = path.join(projectRoot, 'docs', 'BRIEF.md');
  if (!exists(p)) {
    return { status: STATUS.FAIL, detail: 'docs/BRIEF.md tidak ada', hint: 'jalankan: forge new "<nama>"' };
  }
  const text = read(p);
  const answered = text
    .split('\n')
    .filter((l) => /^\s*(\d+\.|[-*])\s+\S/.test(l) && !/\b(TBD|TODO|\?\?)\b/i.test(l));
  const hasReference = /(acuan|reference|referensi)/i.test(text);
  if (answered.length < 6) {
    return { status: STATUS.FAIL, detail: `brief baru ${answered.length}/8 jawaban terisi`, hint: 'lengkapi 8 pertanyaan intake' };
  }
  if (!hasReference) {
    return { status: STATUS.FAIL, detail: 'brief belum menetapkan satu acuan tampilan/fitur', hint: 'tambahkan bagian "Acuan"' };
  }
  return { status: STATUS.PASS, detail: `${answered.length} jawaban + acuan` };
}

function checkSpec() {
  const p = path.join(projectRoot, 'docs', 'SPEC.md');
  if (!exists(p)) return { status: STATUS.FAIL, detail: 'docs/SPEC.md tidak ada', hint: 'tulis spec sebelum kode' };
  const text = read(p);
  const needed = ['sasaran', 'non-sasaran', 'kriteria selesai'];
  const missing = needed.filter((k) => !new RegExp(`^#{1,3}\\s*.*${k}`, 'im').test(text));
  if (missing.length) return { status: STATUS.FAIL, detail: `spec kurang bagian: ${missing.join(', ')}` };
  if (/\bTBD\b|\bTODO\b/.test(text)) return { status: STATUS.FAIL, detail: 'spec masih memuat TBD/TODO' };
  return { status: STATUS.PASS, detail: 'spec lengkap, tanpa TBD' };
}

function checkPlan() {
  const p = path.join(projectRoot, 'docs', 'PLAN.md');
  if (!exists(p)) return { status: STATUS.FAIL, detail: 'docs/PLAN.md tidak ada', hint: 'pecah pekerjaan menjadi task bergerbang' };
  const text = read(p);
  const tasks = (text.match(/^###\s+Task\s+\d+/gim) || []).length;
  const gates = (text.match(/^\s*(?:[-*]\s*)?\**Gate\**\s*:/gim) || []).length;
  if (tasks < 3) return { status: STATUS.FAIL, detail: `baru ${tasks} task, minimal 3` };
  if (gates < tasks) return { status: STATUS.FAIL, detail: `${gates}/${tasks} task punya baris Gate:` };
  return { status: STATUS.PASS, detail: `${tasks} task, semua bergerbang` };
}

function checkEncoding() {
  const files = walk(projectRoot).filter((f) => TEXT_EXT.has(path.extname(f).toLowerCase()) || f.endsWith('.blade.php'));
  const mojibake = [
    String.fromCharCode(0x00e2, 0x20ac),
    String.fromCharCode(0x00e2, 0x2020),
    String.fromCharCode(0x00c3, 0x00a9),
    String.fromCharCode(0x00c3, 0x00a2),
    String.fromCharCode(0x00c2, 0x00b7),
  ];
  const boms = [];
  const moji = [];
  for (const f of files) {
    const buf = fs.readFileSync(f);
    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) boms.push(rel(f));
    if (buf.length > 2_000_000) continue;
    const text = buf.toString('utf8');
    if (mojibake.some((m) => text.includes(m))) moji.push(rel(f));
  }
  if (boms.length || moji.length) {
    const parts = [];
    if (boms.length) parts.push(`BOM: ${boms.slice(0, 5).join(', ')}`);
    if (moji.length) parts.push(`mojibake: ${moji.slice(0, 5).join(', ')}`);
    return { status: STATUS.FAIL, detail: parts.join(' | '), hint: 'simpan UTF-8 tanpa BOM lewat editor, jangan pipe shell' };
  }
  return { status: STATUS.PASS, detail: `${files.length} berkas teks bersih` };
}

function checkSecrets() {
  const envPath = path.join(projectRoot, '.env');
  const tracked = spawnSync('git ls-files', { cwd: projectRoot, shell: true, encoding: 'utf8' });
  const trackedFiles = tracked.status === 0 ? tracked.stdout.split('\n').filter(Boolean) : null;
  if (trackedFiles && trackedFiles.includes('.env')) {
    return { status: STATUS.FAIL, detail: '.env ikut ter-track git', hint: 'git rm --cached .env; tambahkan ke .gitignore' };
  }
  const patterns = [
    /gh[pousr]_[A-Za-z0-9]{20,}/,
    /sk-[A-Za-z0-9]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  ];
  const files = (trackedFiles || walk(projectRoot).map(rel)).filter((f) => TEXT_EXT.has(path.extname(f).toLowerCase()));
  const hits = [];
  for (const f of files.slice(0, 4000)) {
    const abs = path.join(projectRoot, f);
    if (!exists(abs)) continue;
    const text = read(abs);
    if (text.length > 2_000_000) continue;
    for (const p of patterns) {
      if (p.test(text)) {
        hits.push(f);
        break;
      }
    }
  }
  if (hits.length) {
    return { status: STATUS.FAIL, detail: `pola rahasia di: ${hits.slice(0, 5).join(', ')}`, hint: 'pindahkan ke .env, rotasi kuncinya' };
  }
  return { status: STATUS.PASS, detail: envPath && exists(envPath) ? '.env lokal ada, tidak ter-track' : 'tidak ada rahasia terdeteksi' };
}

function checkExternalAssets(cfg) {
  const files = walk(projectRoot).filter((f) => /\.(css|js|mjs|blade\.php|html|vue|svelte)$/i.test(f));
  // Only assets the page loads: script/img/iframe src, CSS url(), and <link href>.
  // Ordinary <a href="https://..."> outbound links are not external assets.
  const re = /(?:\bsrc\s*=\s*["']https?:\/\/)|(?:url\(\s*["']?https?:\/\/)|(?:<link\b[^>]*\bhref\s*=\s*["']https?:\/\/)/gi;
  const hits = [];
  for (const f of files) {
    const text = read(f);
    const m = text.match(re);
    if (m) hits.push(`${rel(f)} (${m.length})`);
  }
  if (hits.length && cfg.noExternalAssets) {
    return { status: STATUS.FAIL, detail: `aset eksternal: ${hits.slice(0, 5).join(', ')}`, hint: 'host sendiri atau ganti CSS/SVG lokal' };
  }
  if (hits.length) {
    return { status: STATUS.WARN, detail: `${hits.length} berkas memuat URL eksternal` };
  }
  return { status: STATUS.PASS, detail: 'tidak ada aset eksternal' };
}

function checkTests(cmds, cfg, noRun) {
  if (noRun) return { status: STATUS.SKIP, detail: '--no-run' };
  if (!cmds.test) return { status: STATUS.SKIP, detail: 'tidak ada test runner terdeteksi' };
  const r = run(cmds.test);
  if (r.code === 0) {
    const strong = (r.out.match(/(\d+\/\d+\s+lulus|\d+\s+passed|\d+\s+passing|Tests?:\s+[^\n]+)/i) || [])[0];
    const summary = strong || (r.out.match(/OK\b[^\n]*/i) || [])[0] || 'exit 0';
    return { status: STATUS.PASS, detail: `${cmds.test} → ${summary.replace(/\s+/g, ' ').slice(0, 80)}` };
  }
  return { status: STATUS.FAIL, detail: `${cmds.test} → exit ${r.code}`, hint: 'perbaiki tes sebelum lanjut', log: r.out.slice(-1200) };
}

function checkBuild(cmds, noRun) {
  if (noRun) return { status: STATUS.SKIP, detail: '--no-run' };
  if (!cmds.build) return { status: STATUS.SKIP, detail: 'tidak ada build script' };
  const r = run(cmds.build);
  if (r.code === 0) return { status: STATUS.PASS, detail: `${cmds.build} → exit 0` };
  return { status: STATUS.FAIL, detail: `${cmds.build} → exit ${r.code}`, log: r.out.slice(-1200) };
}

function checkGraph() {
  const report = path.join(projectRoot, 'graphify-out', 'GRAPH_REPORT.md');
  if (!exists(report)) {
    return { status: STATUS.FAIL, detail: 'graphify-out/GRAPH_REPORT.md tidak ada', hint: 'jalankan: graphify update ., atau: node scripts/codemap.mjs' };
  }
  const size = fs.statSync(report).size;
  if (size < 200) return { status: STATUS.FAIL, detail: `GRAPH_REPORT.md terlalu kecil (${size} B)` };
  const newest = newestSourceMtime();
  const reportTime = fs.statSync(report).mtimeMs;
  const stale = newest > reportTime;
  return {
    status: stale ? STATUS.WARN : STATUS.PASS,
    detail: `${(size / 1024).toFixed(1)} KB${stale ? ', lebih lama dari kode terakhir' : ''}`,
    hint: stale ? 'bangun ulang: graphify update .' : undefined,
  };
}

function newestSourceMtime() {
  let newest = 0;
  for (const f of walk(projectRoot)) {
    if (!/\.(php|js|mjs|ts|tsx|jsx|vue|svelte|css|blade\.php|py|go|rs)$/i.test(f)) continue;
    try {
      const t = fs.statSync(f).mtimeMs;
      if (t > newest) newest = t;
    } catch {}
  }
  return newest;
}

function findInspector() {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const candidates = [
    path.join(home, '.config', 'opencode', 'skills', 'design-taste-frontend', 'scripts', 'inspect.mjs'),
    path.join(home, '.claude', 'skills', 'design-taste-frontend', 'scripts', 'inspect.mjs'),
  ];
  return candidates.find(exists) || null;
}

function checkDesignAudit(cfg, url, noRun) {
  if (!url) return { status: STATUS.SKIP, detail: 'tanpa --url' };
  if (noRun) return { status: STATUS.SKIP, detail: '--no-run' };
  const inspector = findInspector();
  if (!inspector) {
    return {
      status: STATUS.SKIP,
      detail: 'inspect.mjs tidak ditemukan',
      hint: 'pasang skill design-taste-frontend, atau audit manual 390/768/1440',
    };
  }
  const routes = cfg.auditRoutes || ['/'];
  const results = [];
  const crashNotes = [];
  let retries = 0;
  let fails = 0;
  for (const route of routes) {
    const target = `${url.replace(/\/$/, '')}${route}`;
    const outDir = path.join(projectRoot, '.forge', 'audit', route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home');
    const rp = path.join(outDir, 'report.json');

    // A report left by an earlier run must never vouch for this one.
    const attempt = () => {
      if (exists(rp)) fs.rmSync(rp);
      // 900 s: halaman panjang pada mesin lambat (mis. beranda 7.000 px di PC
      // kantor) butuh sekitar 325 s untuk menyelesaikan film scroll di 3 lebar.
      // Batas 300 s mematikan inspector di tengah jalan dan melaporkan
      // FAIL(0)/ETIMEDOUT, yang bukan temuan desain.
      const r = run(`node "${inspector}" "${target}" --out "${outDir}"`, { timeout: 900000 });
      let report = null;
      if (exists(rp)) {
        try {
          report = JSON.parse(read(rp));
        } catch {}
      }
      const count = (report?.issues || report?.findings || []).filter((i) => (i.severity || i.level || '').toUpperCase() === 'FAIL').length;
      return { r, count };
    };

    let { r, count } = attempt();
    // Chrome occasionally stalls or fails to start (CDP timeout, busy machine).
    // Retry twice with a longer wait before blaming the page.
    for (const wait of [2000, 6000]) {
      if (r.code === 0 || count > 0) break;
      sleepSync(wait);
      ({ r, count } = attempt());
      retries++;
    }

    if (r.code !== 0 || count > 0) {
      fails++;
      if (!count) {
        // The meter found nothing: the process itself died. Say why instead of printing FAIL(0).
        const last = (r.out || '').split('\n').filter(Boolean).pop();
        const why = r.error ? `${r.error.code || r.error.message}` : null;
        crashNotes.push(`${route}: ${[last, why].filter(Boolean).join(' | ').slice(0, 160) || 'tanpa keluaran'}`);
      }
    }
    results.push(`${route}:${r.code === 0 && count === 0 ? 'ok' : `FAIL(${count})`}`);
  }
  return {
    status: fails ? STATUS.FAIL : STATUS.PASS,
    detail: `${results.join(' ')} @ ${(cfg.widths || []).join('/')}px${retries ? ` (${retries} ulang)` : ''}`,
    hint: fails
      ? crashNotes.length
        ? `audit berhenti sendiri: ${crashNotes.slice(0, 2).join(' | ')}`
        : 'buka .forge/audit/*/report.json untuk temuan'
      : undefined,
  };
}

function checkLedger(release) {
  const ledger = loadLedger();
  if (!ledger) {
    return release
      ? { status: STATUS.FAIL, detail: '.forge/ledger.json tidak ada', hint: 'jalankan: forge ledger init' }
      : {
          status: STATUS.WARN,
          detail: 'fase belum dilacak (.forge/ledger.json tidak ada)',
          hint: 'proyek lama: forge ledger init; proyek baru: forge new',
        };
  }
  const phases = Object.entries(ledger.phases || {});
  const approved = phases.filter(([, v]) => v.status === 'approved');
  const pending = phases.filter(([, v]) => v.status !== 'approved').map(([k]) => k);
  const missingProof = [];
  for (const [id, ph] of approved) {
    for (const [skill, rec] of Object.entries(ph.skills || {})) {
      if (!rec.proof) missingProof.push(`${id}/${skill}`);
    }
  }
  if (missingProof.length) {
    return { status: STATUS.FAIL, detail: `fase approved tanpa bukti: ${missingProof.slice(0, 4).join(', ')}`, hint: 'forge ledger mark ... --proof <file>' };
  }
  const manifest = loadManifest();
  const missingSkills = [];
  if (manifest) {
    for (const [id, ph] of approved) {
      const spec = (manifest.phases || []).find((p) => p.id === id);
      if (!spec) continue;
      for (const s of spec.skills || []) {
        if (!s.required) continue;
        if (!ph.skills || !ph.skills[s.id]) missingSkills.push(`${id}/${s.id}`);
      }
    }
  }
  if (missingSkills.length) {
    return {
      status: STATUS.FAIL,
      detail: `skill wajib belum tercatat: ${missingSkills.slice(0, 4).join(', ')}${missingSkills.length > 4 ? ` (+${missingSkills.length - 4})` : ''}`,
      hint: 'forge ledger mark <skill> --phase <P#> --proof <file>',
    };
  }
  if (release && pending.length) {
    return { status: STATUS.FAIL, detail: `belum approved: ${pending.join(', ')}`, hint: 'lengkapi tiap fase sebelum rilis' };
  }
  return {
    status: pending.length ? STATUS.WARN : STATUS.PASS,
    detail: `${approved.length}/${phases.length} fase approved${pending.length ? ` (pending: ${pending.join(',')})` : ''}`,
  };
}

/* --------------------------------------------------------------- doctor */

const TOOLS = [
  { bin: 'node', args: '-v', required: true, why: 'menjalankan forge + build aset', install: 'https://nodejs.org (LTS)' },
  { bin: 'npm', args: '-v', required: true, why: 'dependensi front-end', install: 'ikut Node.js' },
  { bin: 'git', args: '--version', required: true, why: 'riwayat + rilis', install: 'https://git-scm.com' },
  { bin: 'graphify', args: '--version', required: false, why: 'peta kode kaya (fallback: scripts/codemap.mjs)', install: 'opsional — codemap bawaan selalu bisa' },
  { bin: 'php', args: '-v', required: false, why: 'Laravel/WordPress', install: 'PHP 8.4 (bukan 8.3 untuk lock modern)' },
  { bin: 'composer', args: '--version', required: false, why: 'dependensi PHP', install: 'https://getcomposer.org' },
  { bin: 'python', args: '--version', required: false, why: 'skrip bantu & tes', install: 'https://python.org' },
  { bin: 'playwright-cli', args: '--version', required: false, why: 'uji interaksi + screenshot', install: 'npm i -g playwright-cli' },
];

function cmdDoctor() {
  const rows = [];
  let missingRequired = 0;
  for (const t of TOOLS) {
    const r = spawnSync(`${t.bin} ${t.args}`, { shell: true, encoding: 'utf8', timeout: 20000 });
    const ok = r.status === 0;
    const version = ok ? `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n')[0].slice(0, 48) : '';
    if (!ok && t.required) missingRequired++;
    rows.push({ ...t, ok, version });
  }
  const inspector = findInspector();
  const hasGraphifyOut = exists(path.join(projectRoot, 'graphify-out', 'GRAPH_REPORT.md'));

  if (args.json) {
    console.log(JSON.stringify({ tools: rows.map(({ bin, ok, version, required }) => ({ bin, ok, version, required })), inspector, hasGraphifyOut }, null, 2));
    return missingRequired ? 1 : 0;
  }

  console.log(c.bold('\nweb-forge doctor\n'));
  for (const r of rows) {
    const mark = r.ok ? c.ok(' OK ') : r.required ? c.bad('MISS') : c.warn(' -- ');
    const v = r.ok ? c.dim(r.version) : c.dim(r.install);
    const tag = r.required ? '' : c.dim(' (opsional)');
    console.log(` ${mark} ${r.bin.padEnd(15)} ${v}${tag}`);
  }
  console.log(`\n ${inspector ? c.ok(' OK ') : c.warn(' -- ')} inspect.mjs      ${inspector || c.dim('skill design-taste-frontend belum ada')}`);
  console.log(` ${hasGraphifyOut ? c.ok(' OK ') : c.warn(' -- ')} graphify-out/    ${hasGraphifyOut ? c.dim('peta kode tersedia') : c.dim('jalankan: graphify update .')}`);
  console.log(missingRequired ? c.bad(`\n${missingRequired} alat wajib belum ada. Perbaiki sebelum mulai.\n`) : c.ok('\nSemua alat wajib tersedia.\n'));
  return missingRequired ? 1 : 0;
}

/* ------------------------------------------------------------------ new */

const BRIEF_TEMPLATE = `# Brief — {{NAME}}

Diisi pada: {{DATE}}
Acuan: belum ditetapkan  <!-- wajib: satu URL/berkas acuan tampilan & fitur -->

## 8 pertanyaan intake

1. Siapa penggunanya dan apa satu hal yang harus bisa mereka lakukan?
2. Apa tujuan terukur (angka) yang menandakan situs ini berhasil?
3. Apa yang TIDAK boleh ada (non-sasaran)?
4. Apa anti-sasaran: kegagalan seperti apa yang paling tidak boleh terjadi?
5. Siapa pemilik konten dan seberapa sering konten berubah?
6. Perangkat & jaringan: ponsel murah? data seluler? offline?
7. Batasan teknis: hosting, bahasa/framework, larangan aset eksternal?
8. Kapan harus selesai, dan apa yang dipotong lebih dulu bila waktu sempit?

## Acuan

- Tampilan:
- Fitur:
- Alasan memilih acuan ini:
`;

const SPEC_TEMPLATE = `# Spec — {{NAME}}

## Sasaran

- (terukur, angka)

## Non-sasaran

- (yang sengaja tidak dikerjakan)

## Anti-sasaran

- (kegagalan yang tidak boleh terjadi)

## Peta halaman

| Rute | Isi | Status |
|---|---|---|

## Model data

| Entitas | Kolom penting | Aturan |
|---|---|---|

## Kriteria selesai

- [ ] (setiap baris bisa diukur)
`;

const PLAN_TEMPLATE = `# Plan — {{NAME}}

Setiap task ≤ 1 sesi kerja. Jangan menulis kode sebelum task punya baris Gate.

### Task 1: Fondasi (shell, navigasi, token desain)

- Files:
- Gate: inspect.mjs 0 FAIL @ 390/768/1440 untuk beranda kosong

### Task 2: Layar inti

- Files:
- Gate: 3 rute utama 200, tanpa geser horizontal, form tersimpan

### Task 3: Layar sisa + pengujian

- Files:
- Gate: php artisan test / npm test hijau, rute matrix 0×500
`;

const PHASES = {
  P0: 'Intake',
  P1: 'Spec',
  P2: 'Plan',
  P3: 'Fondasi',
  P4: 'Layar inti',
  P5: 'Layar sisa',
  P6: 'Harden',
  P7: 'Prove',
  P8: 'Ship',
  P9: 'Handoff',
};

function defaultConfig(name, stack) {
  return {
    project: name,
    stack,
    noExternalAssets: false,
    requireGates: ['brief', 'spec', 'plan', 'encoding', 'secrets', 'tests', 'graph'],
    auditRoutes: ['/'],
    widths: [390, 768, 1440],
    commands: {},
  };
}

function defaultLedger(name, stack) {
  const phases = {};
  for (const [id, label] of Object.entries(PHASES)) {
    phases[id] = { name: label, status: 'pending', skills: {} };
  }
  return { version: 1, project: name, stack, created: new Date().toISOString(), phases };
}

function cmdNew() {
  const name = args._[1];
  if (!name) {
    console.error('pakai: forge new "<nama proyek>" [--stack laravel|next|html|api] [--dir <path>]');
    return 1;
  }
  const dir = path.resolve(args.dir || '.');
  const stack = args.stack || 'auto';
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.forge'), { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const fill = (t) => t.replaceAll('{{NAME}}', name).replaceAll('{{DATE}}', date);

  const writeIfMissing = (relPath, content) => {
    const abs = path.join(dir, relPath);
    if (exists(abs)) return false;
    fs.writeFileSync(abs, content, 'utf8');
    return true;
  };

  writeIfMissing('docs/BRIEF.md', fill(BRIEF_TEMPLATE));
  writeIfMissing('docs/SPEC.md', fill(SPEC_TEMPLATE));
  writeIfMissing('docs/PLAN.md', fill(PLAN_TEMPLATE));
  writeIfMissing('docs/DECISIONS.md', `# Keputusan — ${name}\n\nFormat: keputusan — alasan — konsekuensi.\n`);
  writeIfMissing('docs/HANDOFF.md', `# Serah-terima — ${name}\n\nCara menjalankan, cara memverifikasi, batasan yang diketahui.\n`);
  writeIfMissing('FORGE.md', `# Kontrak kerja — ${name}\n\nPipeline: intake → spec → plan → fondasi → layar inti → layar sisa → harden → prove → ship → handoff.\n\nJangan menulis kode sebelum docs/BRIEF.md dan docs/SPEC.md selesai.\nGerbang: \`node scripts/forge.mjs gate\`. Rilis: \`gate --release\`.\n`);

  const cfgPath = path.join(dir, '.forge', 'config.json');
  if (!exists(cfgPath)) {
    saveJson(cfgPath, defaultConfig(name, stack));
  }

  const ledgerPath = path.join(dir, '.forge', 'ledger.json');
  if (!exists(ledgerPath)) {
    saveJson(ledgerPath, defaultLedger(name, stack));
  }

  console.log(c.ok(`\nProyek "${name}" disiapkan di ${dir}`));
  console.log(c.dim('  docs/BRIEF.md   8 pertanyaan intake (isi dulu)'));
  console.log(c.dim('  docs/SPEC.md    sasaran, non-sasaran, kriteria selesai'));
  console.log(c.dim('  docs/PLAN.md    task bergerbang'));
  console.log(c.dim('  .forge/         config + ledger bukti\n'));
  console.log('Langkah berikutnya: isi docs/BRIEF.md, lalu jalankan ' + c.bold('node scripts/forge.mjs gate') + '\n');
  return 0;
}

/* ----------------------------------------------------------------- gate */

function cmdGate() {
  const cfg = loadConfig();
  const det = detect();
  const cmds = detectCommands(cfg, det);
  const noRun = Boolean(args['no-run']);

  const checks = [
    ['brief', () => checkBrief()],
    ['spec', () => checkSpec()],
    ['plan', () => checkPlan()],
    ['encoding', () => checkEncoding()],
    ['secrets', () => checkSecrets()],
    ['external-assets', () => checkExternalAssets(cfg)],
    ['tests', () => checkTests(cmds, cfg, noRun)],
    ['build', () => checkBuild(cmds, noRun)],
    ['graph', () => checkGraph()],
    ['design-audit', () => checkDesignAudit(cfg, args.url, noRun)],
    ['ledger', () => checkLedger(Boolean(args.release))],
  ];

  const results = checks.map(([id, fn]) => {
    let r;
    try {
      r = fn();
    } catch (e) {
      r = { status: STATUS.FAIL, detail: `error: ${e.message}` };
    }
    return { id, ...r };
  });

  const fails = results.filter((r) => r.status === STATUS.FAIL);
  const skips = results.filter((r) => r.status === STATUS.SKIP);
  const requiredSkips = skips.filter((r) => (cfg.requireGates || []).includes(r.id));
  const exit = fails.length || (args.strict && requiredSkips.length) ? 1 : 0;

  const payload = {
    generated: new Date().toISOString(),
    project: cfg.project,
    stack: det.stack,
    commands: cmds,
    url: args.url || null,
    release: Boolean(args.release),
    exit,
    summary: {
      pass: results.filter((r) => r.status === STATUS.PASS).length,
      fail: fails.length,
      skip: skips.length,
      warn: results.filter((r) => r.status === STATUS.WARN).length,
    },
    results,
  };

  saveJson(path.join(projectRoot, '.forge', 'report.json'), payload);
  fs.writeFileSync(path.join(projectRoot, '.forge', 'report.md'), renderReport(payload), 'utf8');

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return exit;
  }

  console.log(c.bold(`\nweb-forge gate — ${cfg.project} (${det.stack})\n`));
  for (const r of results) {
    const mark =
      r.status === STATUS.PASS ? c.ok(' PASS ')
      : r.status === STATUS.FAIL ? c.bad(' FAIL ')
      : r.status === STATUS.WARN ? c.warn(' WARN ')
      : c.dim(' SKIP ');
    console.log(` ${mark} ${r.id.padEnd(16)} ${c.dim(r.detail)}`);
    if (r.hint && r.status !== STATUS.PASS) console.log(`        ${c.dim('→ ' + r.hint)}`);
    if (r.log && r.status === STATUS.FAIL) {
      for (const line of r.log.split('\n').slice(-6)) console.log(`        ${c.dim('| ' + line.slice(0, 110))}`);
    }
  }

  const s = payload.summary;
  console.log(
    `\n ${s.pass} pass · ${c.bad(String(s.fail))} fail · ${s.warn} warn · ${s.skip} skip` +
      (exit ? c.bad('  → GATE TERTUTUP') : c.ok('  → GATE TERBUKA')),
  );
  console.log(c.dim(` laporan: .forge/report.md & .forge/report.json\n`));
  return exit;
}

function renderReport(p) {
  const lines = [
    `# Forge gate report`,
    ``,
    `- Proyek: **${p.project}** (${p.stack})`,
    `- Waktu: ${p.generated}`,
    `- URL audit: ${p.url || '—'}`,
    `- Mode: ${p.release ? 'release' : 'development'}`,
    `- Hasil: ${p.summary.pass} pass · ${p.summary.fail} fail · ${p.summary.warn} warn · ${p.summary.skip} skip`,
    `- Verdict: **${p.exit ? 'TERTUTUP' : 'TERBUKA'}**`,
    ``,
    `| Gerbang | Status | Detail |`,
    `|---|---|---|`,
  ];
  for (const r of p.results) {
    lines.push(`| ${r.id} | ${r.status} | ${String(r.detail || '').replace(/\|/g, '\\|')} |`);
  }
  const hints = p.results.filter((r) => r.hint);
  if (hints.length) {
    lines.push('', '## Tindakan', '');
    for (const r of hints) lines.push(`- **${r.id}** — ${r.hint}`);
  }
  return `${lines.join('\n')}\n`;
}

/* --------------------------------------------------------------- ledger */

function cmdLedger() {
  const sub = args._[1];
  const ledgerPath = path.join(projectRoot, '.forge', 'ledger.json');

  if (sub === 'init') {
    const dir = path.resolve(args.dir || projectRoot);
    const name = args.name || path.basename(dir);
    const stack = args.stack || 'auto';
    const made = [];
    const cfgPath = path.join(dir, '.forge', 'config.json');
    if (!exists(cfgPath)) {
      saveJson(cfgPath, defaultConfig(name, stack));
      made.push('.forge/config.json');
    }
    const target = path.join(dir, '.forge', 'ledger.json');
    if (!exists(target)) {
      saveJson(target, defaultLedger(name, stack));
      made.push('.forge/ledger.json');
    }
    if (!made.length) {
      console.log(c.dim('ledger dan config sudah ada; tidak ada yang ditimpa'));
      return 0;
    }
    console.log(c.ok(`${made.join(' + ')} dibuat untuk "${name}"`));
    console.log(c.dim('  semua fase pending — tandai setelah buktinya ada:'));
    console.log(c.dim('  forge ledger mark <skill> --phase P3 --proof docs/PLAN.md'));
    return 0;
  }

  const ledger = loadLedger();
  if (!ledger) {
    console.error('ledger belum ada. jalankan: forge ledger init');
    return 1;
  }

  if (!sub || sub === 'list') {
    console.log(c.bold('\nledger\n'));
    for (const [id, ph] of Object.entries(ledger.phases)) {
      const skills = Object.keys(ph.skills || {});
      const mark = ph.status === 'approved' ? c.ok('OK ') : c.dim('-- ');
      console.log(` ${mark} ${id} ${ph.name.padEnd(14)} ${c.dim(skills.length ? skills.join(', ') : 'belum ada bukti')}`);
    }
    console.log();
    return 0;
  }

  if (sub === 'phase') {
    const id = args._[2];
    const status = args.status;
    if (!id || !ledger.phases[id]) {
      console.error(`fase tidak dikenal: ${id}`);
      return 1;
    }
    if (!['pending', 'approved'].includes(status)) {
      console.error('pakai --status approved|pending');
      return 1;
    }
    ledger.phases[id].status = status;
    ledger.phases[id].at = new Date().toISOString();
    saveJson(ledgerPath, ledger);
    console.log(c.ok(`${id} → ${status}`));
    return 0;
  }

  if (sub === 'mark') {
    const skill = args._[2];
    if (!skill) {
      console.error('pakai: forge ledger mark <skill> --phase P3 --proof <file>');
      return 1;
    }
    const phase = args.phase || 'P0';
    if (!ledger.phases[phase]) {
      console.error(`fase tidak dikenal: ${phase}`);
      return 1;
    }
    if (args.proof && !exists(path.resolve(projectRoot, args.proof))) {
      console.error(`bukti tidak ditemukan: ${args.proof}`);
      return 1;
    }
    ledger.phases[phase].skills[skill] = {
      verdict: args.verdict || 'APPROVE',
      proof: args.proof || null,
      at: new Date().toISOString(),
    };
    saveJson(ledgerPath, ledger);
    console.log(c.ok(`${skill} → ${phase} (bukti: ${args.proof || '—'})`));
    return 0;
  }

  console.error(`sub-perintah tidak dikenal: ${sub}`);
  return 1;
}

function cmdPhases() {
  const manifest = loadManifest();
  if (!manifest) {
    console.error('manifest.json tidak ditemukan');
    return 1;
  }
  if (args.json) {
    console.log(JSON.stringify(manifest.phases, null, 2));
    return 0;
  }
  console.log(c.bold(`\n${manifest.name} ${manifest.version} — ${manifest.phases.length} fase\n`));
  for (const ph of manifest.phases) {
    const req = ph.skills.filter((s) => s.required).map((s) => s.id);
    const opt = ph.skills.filter((s) => !s.required).map((s) => s.id);
    console.log(` ${c.bold(ph.id)} ${ph.name.padEnd(14)} ${c.dim('gate: ' + ph.gate)}`);
    console.log(`    ${c.dim('wajib  ')} ${req.join(', ')}`);
    if (opt.length) console.log(`    ${c.dim('opsional')} ${opt.join(', ')}`);
  }
  console.log(`\n${c.dim('total skill wajib: ' + manifest.phases.reduce((n, p) => n + p.skills.filter((s) => s.required).length, 0))}\n`);
  return 0;
}

/* ---------------------------------------------------------------- main */

function help() {
  console.log(`
${c.bold('web-forge')} — satu perintah, sembilan fase bergerbang.

  node scripts/forge.mjs doctor
  node scripts/forge.mjs new "<nama>" [--stack laravel|next|html|api] [--dir <dir>]
  node scripts/forge.mjs gate [--url <url>] [--release] [--strict] [--no-run] [--json]
  node scripts/forge.mjs ledger [list]
  node scripts/forge.mjs ledger init --dir . --stack laravel
  node scripts/forge.mjs ledger mark <skill> --phase P3 --proof docs/PLAN.md
  node scripts/forge.mjs ledger phase P3 --status approved
  node scripts/forge.mjs phases

Opsi umum: --project <dir>
`);
  return 0;
}

const handlers = { doctor: cmdDoctor, new: cmdNew, gate: cmdGate, ledger: cmdLedger, phases: cmdPhases, help };
const fn = handlers[command];
process.exitCode = fn ? fn() : help();
