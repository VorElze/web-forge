# Spec — web-forge

## Sasaran

- Satu perintah (`node scripts/forge.mjs`) menjalankan sembilan fase dengan
  gerbang yang bisa dieksekusi, tanpa dependensi runtime.
- Kalimat pemicu "saya ingin membuat website" / "I want to build an app"
  memuat skill ini secara otomatis di klien yang mendukung Agent Skills.
- Fase tidak bisa `approved` bila skill wajibnya tidak tercatat dengan berkas
  bukti yang benar-benar ada.
- Rilis tidak bisa dibuka (`gate --release --strict`) selama ada FAIL atau SKIP.
- `selftest` membuktikan minimal 8 perilaku gerbang, termasuk bahwa gerbang
  **bisa gagal**.

## Non-sasaran

- Bukan generator aplikasi; tidak menulis kode fitur untuk pengguna.
- Bukan framework, bukan library, bukan layanan.
- Tidak membundel skill pihak ketiga; hanya menyebut namanya.
- Tidak menjalankan server, database, atau deploy atas nama pengguna.
- Tidak mengatur CI, hosting, atau domain.

## Anti-sasaran

- Gerbang yang selalu PASS karena tidak mengukur apa pun.
- "Selesai" tanpa angka.
- Berkas sumber rusak encoding tetapi lolos audit tata letak.
- Bukti palsu: path yang tidak ada tetapi tercatat di ledger.

## Peta halaman

Tidak ada UI. Permukaan yang diuji: perintah CLI dan berkas laporan.

| Perintah | Keluaran | Status |
|---|---|---|
| `doctor` | tabel alat + exit code | terbit |
| `new` | `docs/` + `.forge/` | terbit |
| `gate` | `.forge/report.md`, `.forge/report.json` | terbit |
| `gate --release --strict` | verdict rilis | terbit |
| `ledger` | `.forge/ledger.json` | terbit |
| `phases` | peta skill | terbit |

## Model data

| Entitas | Kolom penting | Aturan |
|---|---|---|
| `manifest.json` | phases[].skills[].required | sumber kebenaran skill wajib |
| `.forge/config.json` | auditRoutes, widths, noExternalAssets, commands | per proyek |
| `.forge/ledger.json` | phases[].status, skills[].proof | approved wajib punya proof |
| `.forge/report.json` | results[].status | PASS/FAIL/WARN/SKIP, bukan boolean |

## Alur utama

1. `doctor` → semua alat wajib ada.
2. `new` → kontrak proyek lahir.
3. Isi BRIEF → SPEC → PLAN.
4. `gate` berulang selama pembangunan.
5. `gate --release --strict` → baru boleh deploy.

## Kriteria selesai

- [ ] `node scripts/selftest.mjs` → 8/8 lulus.
- [ ] `node scripts/forge.mjs doctor` → exit 0 pada mesin dengan Node + git.
- [ ] `node scripts/forge.mjs gate` pada repo ini → tidak ada FAIL.
- [ ] Proyek contoh dengan mojibake → `encoding FAIL` dan nama berkasnya disebut.
- [ ] Fase `approved` tanpa skill wajib → `ledger FAIL`.
- [ ] Repo dapat di-clone anonim, dan `npm test` lulus tanpa kredensial.
