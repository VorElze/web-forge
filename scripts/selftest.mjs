#!/usr/bin/env node
/**
 * selftest — proves the gate can actually fail.
 * A gate that only ever prints PASS measures nothing.
 *
 *   node scripts/selftest.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(HERE, 'forge.mjs');
const results = [];

function fx(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `forge-${name}-`));
  return dir;
}

function forge(args, cwd) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8', timeout: 120000 });
}

function gateJson(cwd) {
  const r = forge(['gate', '--no-run', '--json', '--project', cwd], cwd);
  try {
    return JSON.parse(r.stdout);
  } catch {
    return { results: [], exit: -1, raw: r.stdout, stderr: r.stderr };
  }
}

const get = (payload, id) => (payload.results || []).find((r) => r.id === id) || { status: 'MISSING', detail: '' };
const okStatus = (status, want) => (Array.isArray(want) ? want.includes(status) : status === want);

function test(name, fn) {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail });
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// 1. fresh scaffold passes the document gates
test('scaffold baru → brief/spec/plan PASS', () => {
  const dir = fx('fresh');
  const r = forge(['new', 'Uji', '--stack', 'html', '--dir', dir], dir);
  assert(r.status === 0, `forge new gagal: ${r.stderr}`);
  const p = gateJson(dir);
  for (const id of ['brief', 'spec', 'plan', 'encoding']) {
    assert(okStatus(get(p, id).status, 'PASS'), `${id} → ${get(p, id).status} (${get(p, id).detail})`);
  }
  return '4 gerbang dokumen lulus pada proyek kosong';
});

// 2. plan without Gate: lines must fail
test('plan tanpa baris Gate → FAIL', () => {
  const dir = fx('nogate');
  forge(['new', 'Uji', '--dir', dir], dir);
  fs.writeFileSync(path.join(dir, 'docs', 'PLAN.md'), '# Plan\n\n### Task 1: A\n\n- Files: x\n\n### Task 2: B\n\n- Files: y\n\n### Task 3: C\n\n- Files: z\n');
  const p = gateJson(dir);
  assert(okStatus(get(p, 'plan').status, 'FAIL'), `plan seharusnya FAIL, dapat ${get(p, 'plan').status}`);
  return 'task tanpa Gate ditolak';
});

// 3. mojibake must fail encoding
test('mojibake → encoding FAIL', () => {
  const dir = fx('moji');
  forge(['new', 'Uji', '--dir', dir], dir);
  const bad = `a { content: '${String.fromCharCode(0x00e2, 0x2020, 0x2019)}'; }`;
  fs.writeFileSync(path.join(dir, 'style.css'), bad, 'utf8');
  const p = gateJson(dir);
  assert(okStatus(get(p, 'encoding').status, 'FAIL'), `encoding seharusnya FAIL, dapat ${get(p, 'encoding').status}`);
  assert(get(p, 'encoding').detail.includes('style.css'), 'berkas pelaku tidak disebut');
  return 'mojibake terdeteksi dan disebut namanya';
});

// 4. BOM must fail encoding
test('BOM → encoding FAIL', () => {
  const dir = fx('bom');
  forge(['new', 'Uji', '--dir', dir], dir);
  const body = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('<?php echo 1;\n', 'utf8')]);
  fs.writeFileSync(path.join(dir, 'x.php'), body);
  const p = gateJson(dir);
  assert(okStatus(get(p, 'encoding').status, 'FAIL'), `encoding seharusnya FAIL, dapat ${get(p, 'encoding').status}`);
  return 'BOM terdeteksi';
});

// 5. approved phase without required skills must fail the ledger
test('fase approved tanpa skill wajib → ledger FAIL', () => {
  const dir = fx('ledger');
  forge(['new', 'Uji', '--dir', dir], dir);
  forge(['ledger', 'phase', 'P0', '--status', 'approved', '--project', dir], dir);
  const p = gateJson(dir);
  assert(okStatus(get(p, 'ledger').status, 'FAIL'), `ledger seharusnya FAIL, dapat ${get(p, 'ledger').status}`);
  assert(get(p, 'ledger').detail.includes('skill wajib'), `pesan tidak informatif: ${get(p, 'ledger').detail}`);
  return 'approved tanpa bukti ditolak';
});

// 6. recording the required skills clears the ledger failure
test('skill wajib tercatat → ledger tidak FAIL', () => {
  const dir = fx('ledger2');
  forge(['new', 'Uji', '--dir', dir], dir);
  const manifest = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'manifest.json'), 'utf8'));
  const p0 = manifest.phases.find((x) => x.id === 'P0');
  for (const s of p0.skills.filter((x) => x.required)) {
    const r = forge(['ledger', 'mark', s.id, '--phase', 'P0', '--proof', 'docs/BRIEF.md', '--project', dir], dir);
    assert(r.status === 0, `mark ${s.id} gagal: ${r.stderr}`);
  }
  forge(['ledger', 'phase', 'P0', '--status', 'approved', '--project', dir], dir);
  const p = gateJson(dir);
  assert(!okStatus(get(p, 'ledger').status, 'FAIL'), `ledger masih FAIL: ${get(p, 'ledger').detail}`);
  return 'empat skill wajib P0 tercatat, ledger bersih';
});

// 7. proof path that does not exist is rejected
test('bukti tidak ada → mark ditolak', () => {
  const dir = fx('proof');
  forge(['new', 'Uji', '--dir', dir], dir);
  const r = forge(['ledger', 'mark', 'interview-me', '--phase', 'P0', '--proof', 'docs/TIDAK-ADA.md', '--project', dir], dir);
  assert(r.status === 1, `seharusnya exit 1, dapat ${r.status}`);
  return 'bukti palsu tidak bisa dicatat';
});

// 8. codemap produces the file the graph gate requires
test('codemap → graph PASS', () => {
  const dir = fx('map');
  forge(['new', 'Uji', '--dir', dir], dir);
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', 'index.js'), "import { a } from './a.js';\nconsole.log(a);\n");
  fs.writeFileSync(path.join(dir, 'src', 'a.js'), 'export const a = 1;\n');
  const r = spawnSync(process.execPath, [path.join(HERE, 'codemap.mjs'), '--root', dir], { cwd: dir, encoding: 'utf8' });
  assert(r.status === 0, `codemap gagal: ${r.stderr}`);
  const p = gateJson(dir);
  assert(okStatus(get(p, 'graph').status, ['PASS', 'WARN']), `graph → ${get(p, 'graph').status} (${get(p, 'graph').detail})`);
  return 'GRAPH_REPORT.md dibuat dan diterima gerbang';
});

// 9. a project adopted without a ledger must WARN, never PASS — and still block release
test('tanpa ledger → WARN, rilis tetap tertutup', () => {
  const dir = fx('noledger');
  forge(['new', 'Uji', '--dir', dir], dir);
  fs.rmSync(path.join(dir, '.forge', 'ledger.json'));
  const p = gateJson(dir);
  assert(okStatus(get(p, 'ledger').status, 'WARN'), `seharusnya WARN, dapat ${get(p, 'ledger').status}`);
  const r = forge(['gate', '--no-run', '--json', '--release', '--project', dir], dir);
  const rel = JSON.parse(r.stdout);
  assert(okStatus(get(rel, 'ledger').status, 'FAIL'), `rilis harus FAIL, dapat ${get(rel, 'ledger').status}`);
  return 'tanpa ledger WARN; --release FAIL';
});

// 10. ledger init adopts an existing project without touching its docs
test('ledger init → berkas dibuat, dokumen tidak ditimpa', () => {
  const dir = fx('init');
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'BRIEF.md'), '# Brief asli\njangan diubah\n');
  const r = forge(['ledger', 'init', '--dir', dir], dir);
  assert(r.status === 0, `init gagal: ${r.stderr}`);
  assert(fs.readFileSync(path.join(dir, 'docs', 'BRIEF.md'), 'utf8').includes('jangan diubah'), 'BRIEF ditimpa');
  const ledger = JSON.parse(fs.readFileSync(path.join(dir, '.forge', 'ledger.json'), 'utf8'));
  assert(Object.keys(ledger.phases).length === 10, `fase tidak lengkap: ${Object.keys(ledger.phases).length}`);
  return 'config + ledger dibuat, BRIEF utuh';
});

const failed = results.filter((r) => !r.ok);
console.log('\nweb-forge selftest\n');
for (const r of results) {
  console.log(` ${r.ok ? ' ok ' : 'FAIL'} ${r.name}`);
  console.log(`      ${r.detail}`);
}
console.log(`\n ${results.length - failed.length}/${results.length} lulus${failed.length ? ` — ${failed.length} GAGAL` : ''}\n`);
process.exitCode = failed.length ? 1 : 0;
