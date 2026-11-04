# Alat dan pemasangan

Yang wajib: Node 20+ dan git. Sisanya menaikkan mutu gerbang, bukan syarat
menjalankan.

## Periksa dulu

```bash
node scripts/forge.mjs doctor
```

`MISS` pada alat wajib = berhenti. `--` pada alat opsional = gerbang terkait
akan SKIP, dan rilis tidak bisa dibuka dengan `--strict`.

## Pemasangan per alat

### Node.js
- Windows: `winget install OpenJS.NodeJS.LTS`
- macOS: `brew install node`
- Linux: `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt install -y nodejs`
- Verifikasi: `node -v` ≥ 20

### git
- Windows: `winget install Git.Git`
- Verifikasi: `git --version`

### graphify (disarankan) / codemap (bawaan)

- Bila tersedia: `graphify update .` → `graphify-out/GRAPH_REPORT.md` + `graph.json`
  (tidak butuh kunci LLM; verifikasi pada graphify 0.9.94: 297 node, 342 edge).
  Muat ulang laporan saja: `graphify cluster-only . --no-label --no-viz`.
- Bila tidak: pakai bawaan repo ini, tanpa dependensi:

```bash
node scripts/codemap.mjs          # menghasilkan graphify-out/GRAPH_REPORT.md
```

Keduanya menulis ke berkas yang sama sehingga gerbang `graph` tetap sah.
Graphify memberi peta relasi lebih kaya; codemap memberi inventaris, peta
impor, dan berkas terbesar — cukup untuk mencegah agen membaca seluruh repo.

Catatan: jangan mengarahkan `scripts.build` proyek ke `codemap.mjs` bila Anda
memakai `graphify` — `forge gate` menjalankan build sebelum memeriksa peta,
sehingga peta graphify akan tertimpa versi yang lebih dangkal.

### design-taste-frontend (inspector visual)
Dipasang sebagai skill klien. Berkas yang dipakai:

- `scripts/inspect.mjs` — audit 390/768/1440, exit 0 = 0 FAIL
- `scripts/lint.mjs` — lint berkas sumber

```bash
node <skills>/design-taste-frontend/scripts/inspect.mjs "http://127.0.0.1:8080/" --out .forge/audit/home
node <skills>/design-taste-frontend/scripts/lint.mjs resources
```

`forge` mencari `inspect.mjs` di `~/.config/opencode/skills/` dan
`~/.claude/skills/`. Lokasi lain: gunakan audit manual, dan catat sebagai SKIP.

### playwright-cli

```bash
npm i -g playwright-cli
playwright-cli open "http://127.0.0.1:8080/"
playwright-cli resize 390 844
playwright-cli screenshot --filename mobile.png
```

### PHP + Composer (Laravel/WordPress)

- Windows: `winget install PHP.PHP.NTS.8.4` lalu `winget install Composer.Composer`
- Ekstensi: `pdo_mysql`, `mbstring`, `fileinfo`, `gd` (WebP), `zip`, `openssl`,
  `intl`, `curl`, dan `pdo_sqlite` untuk tes.
- **Catat:** `composer.lock` modern bisa menuntut PHP ≥ 8.4.1 (Symfony 8.x).
  PHP 8.2/8.3 akan gagal `composer install` walau `composer.json` menulis `^8.2`.
- Verifikasi: `php -v`, `composer --version`, `php artisan test`

### Python (opsional)
- `python --version` ≥ 3.10; `python -m pytest -q` untuk tes.

## Variabel lingkungan

Tidak ada yang wajib. Yang dihormati `forge`:

| Variabel | Fungsi |
|---|---|
| `NO_COLOR` | mematikan warna |
| `HOME` / `USERPROFILE` | mencari skill yang terpasang |

## Perintah yang sering dipakai

```bash
node scripts/forge.mjs doctor
node scripts/forge.mjs new "Nama" --stack laravel
node scripts/forge.mjs gate --url http://127.0.0.1:8080
node scripts/forge.mjs gate --release --strict
node scripts/forge.mjs phases
node scripts/codemap.mjs
```

## Batasan yang diketahui

- Inspector visual butuh server berjalan; `forge` tidak menyalakan server untuk
  Anda.
- `graphify` adalah biner pihak ketiga; repo ini tidak membundelnya.
- Audit kontras dan target sentuh bergantung pada inspector. Tanpa inspector,
  nilainya SKIP — bukan PASS.
