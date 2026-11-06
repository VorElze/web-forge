# Paket opsional: `third-party/awwwards` + `third-party/jury` + `third-party/hallmark` (MIT)

Repo ini menyertakan salinan utuh skill dari proyek sumber terbuka berikut
(lisensi MIT, teks lisensi ada di `third-party/juliobsz-skills-LICENSE.txt` dan
`third-party/hallmark/LICENSE`, revisi upstream tercatat di
`third-party/UPSTREAM_REVISION.txt` dan `third-party/HALLMARK_UPSTREAM.txt`):

- `https://github.com/juliobsz/skills` — paket `awwwards/` (membangun) dan
  `jury/` (menilai situs yang sudah ada)
- `https://github.com/Nutlope/hallmark` — paket `hallmark/` (dapur visual:
  anti-slop, tema, material, dan QA screenshot)

Ini **bukan** bagian wajib `web-forge`. `forge gate` **tidak** menjalankan
script ini secara otomatis. Mereka ada supaya Anda bisa memasangnya sebagai
skill agen (atau membacanya sebagai referensi kerja) tanpa mencari ulang
upstream-nya.

## Kapan memakainya

- **`awwwards`** — ketika brief menuntut situs/landing dengan standar kualitas
galeri (motion berat, WebGL, transisi halaman, ritme visual kuat). Ini bisa
bertabrakan dengan kendala proyek web-forge (mis. larangan aset eksternal,
performa mobile, gate rilis yang ketat) — catat pengecualian di `docs/DECISIONS.md`.
- **`jury`** — ketika Anda butuh kartu skor berbasis bukti (screenshot + audit)
untuk URL produksi atau build statis — bagus sebagai lapisan QA sebelum klaim
“siap rilis”.

## Hubungan dengan `web-forge` + `design-taste-frontend`

- `web-forge` mengukur **bukti mekanis** lewat gerbang CLI + ledger.
- `design-taste-frontend` (jika terpasang) menyediakan `inspect.mjs` untuk gate
audit visual `forge gate --url ...`.
- Paket `awwwards/jury` membawa **alur kerja kreatif + skrip QA** yang lebih
berat (Playwright + axe-core). Ini melengkapi, bukan mengganti, inspector
design-taste-frontend.

## Cara memasang di host skill agen (contoh)

Salin atau junction seluruh folder ke direktori skill agen Anda, misalnya:

- Hermes: salin ke `~/.hermes/skills/` **atau** `skills.external_dirs` Anda
- Claude Code: `~/.claude/skills/<nama>/`
- Codex/OpenCode: `~/.config/opencode/skills/<nama>/`

Nama skill mengikuti folder: `awwwards` dan `jury`.

## Dependensi runtime yang umum

Script membutuhkan Node 20+ dan biasanya:

- `playwright` (atau `playwright-core`) + browser Chromium
- `axe-core` (untuk temuan aksesibilitas pada alur `shoot.mjs`)

Instal di **proyek yang sedang dibangun** (bukan wajib global):

```bash
npm i -D playwright axe-core
npx playwright install chromium
```

## Catatan “auto run”

Tidak ada jaminan pemicu kata kunci akan memuat banyak skill sekaligus di setiap
host agen. Cara yang paling andal:

1) tulis instruksi eksplisit kepada agen untuk `skill_view("awwwards")` atau
   `skill_view("jury")`, atau
2) gunakan konfigurasi host Anda (`skills.auto_load`, aturan proyek, atau blok
   protokol SOUL) bila Anda benar-benar ingin selalu aktif.

