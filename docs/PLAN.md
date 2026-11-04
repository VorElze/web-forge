# Plan — web-forge

Setiap task ≤ 1 sesi kerja. Task tanpa baris Gate tidak boleh dimulai.

### Task 1: CLI inti (doctor, new, gate, ledger)

- Files: `scripts/forge.mjs`, `manifest.json`, `package.json`
- Gate: `node scripts/forge.mjs doctor` exit 0; `new` menghasilkan 6 berkas;
  `gate` menulis `.forge/report.md` dan `.forge/report.json`.

### Task 2: Gerbang yang bisa gagal

- Files: `scripts/selftest.mjs`
- Gate: 8/8 selftest lulus, termasuk mojibake, BOM, plan tanpa Gate, ledger tanpa
  bukti, dan bukti path palsu.

### Task 3: Peta kode portabel (fallback graphify)

- Files: `scripts/codemap.mjs`
- Gate: `codemap` menghasilkan `graphify-out/GRAPH_REPORT.md` > 200 byte dan
  gerbang `graph` berubah dari FAIL menjadi PASS/WARN.

### Task 4: Dokumen dan aturan pemakaian

- Files: `SKILL.md`, `README.md`, `AGENTS.md`, `references/*.md`,
  `commands/forge.md`, `adapters/*`, `docs/BRIEF.md`, `docs/SPEC.md`,
  `docs/PLAN.md`, `CONSTRAINTS.md`
- Gate: `gate --no-run` → `brief`, `spec`, `plan`, `encoding` PASS; tidak ada
  mojibake di seluruh berkas teks.

### Task 5: Publikasi

- Files: `LICENSE`, `NOTICE.md`, `.gitignore`
- Gate: clone anonim berhasil, `npm test` lulus dari clone, 0 pola rahasia,
  deskripsi repo terisi.
