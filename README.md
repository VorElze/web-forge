# web-forge

**Satu perintah. Sembilan fase. Tidak ada "selesai" sebelum terbukti.**

Repo ini membuat agen AI berhenti menulis kode berdasarkan tebakan. Kalimat
"saya ingin membuat website" atau *"I want to build an app"* memicu pipeline
yang sama setiap kali: brief → spec → rencana → fondasi → layar inti → layar
sisa → harden → buktikan → rilis → serah-terima.

Setiap fase punya gerbang yang **dijalankan sebagai kode**, bukan dijanjikan
dalam prosa.

```
 PASS  brief            11 jawaban + acuan
 PASS  spec             spec lengkap, tanpa TBD
 PASS  plan             5 task, semua bergerbang
 PASS  encoding         19 berkas teks bersih
 PASS  secrets          tidak ada rahasia terdeteksi
 PASS  graph            1.3 KB
 PASS  tests            8/8 lulus
 9 pass · 0 fail · 1 warn · 1 skip  → GATE TERBUKA
```

> Keluaran di atas adalah `forge gate` pada repo ini sendiri. Bukan mockup.

---

## Kenapa

Agen yang cerdas tetap bisa salah dengan cara yang mahal: menulis 20 berkas
tanpa spec, mengklaim "0 FAIL" tanpa menjalankan audit, menyerahkan pekerjaan
yang berhenti di "kelihatannya sudah jalan". Yang mencegahnya bukan kalimat
"tolong teliti", melainkan **gerbang yang bisa gagal**.

Tiga aturan yang membedakan repo ini:

1. **SKIP bukan PASS.** Yang belum diukur tidak boleh menyamar jadi lulus.
2. **Fase tidak bisa di-approve tanpa bukti.** `.forge/ledger.json` menolak
   fase yang skill wajibnya tidak tercatat dengan berkas bukti yang ada.
3. **Gate-nya diuji bisa gagal.** `scripts/selftest.mjs` memberi makan input
   rusak (mojibake, BOM, plan tanpa gerbang, bukti palsu) dan memastikan
   gerbang menolaknya.

---

## Mulai (2 menit)

Butuh Node 20+ dan git.

```bash
git clone https://github.com/VorElze/web-forge.git
cd web-forge

node scripts/forge.mjs doctor          # alat apa yang ada di mesin ini
node scripts/forge.mjs new "Nama Situs" --stack laravel
```

Lalu isi `docs/BRIEF.md`, `docs/SPEC.md`, `docs/PLAN.md` **sebelum menulis
kode**, dan jalankan:

```bash
node scripts/forge.mjs gate --url http://127.0.0.1:8080
```

Untuk rilis, hanya ini yang sah:

```bash
node scripts/forge.mjs gate --release --strict
```

Repo ini bisa dipakai dari folder mana pun:

```bash
node /path/ke/web-forge/scripts/forge.mjs gate --project /path/ke/proyek-anda
```

### Paket opsional: `awwwards`, `jury`, dan `hallmark`

Folder `third-party/` menyimpan salinan skill MIT dari `juliobsz/skills`
(`awwwards`, `jury`) dan `Nutlope/hallmark` (`hallmark`), dengan provenance di
`NOTICE.md`. Untuk permintaan build yang cocok dengan pemicu `web-forge`, aturan
routing dalam skill memerintahkan agent memakai **Hallmark + Awwwards** pada
pekerjaan visual baru bila keduanya tersedia; **jury** khusus review saja.

Namun bundling tidak otomatis memasang/mendaftarkan subskill ke host agent.
Hermes tidak mengindeks `SKILL.md` yang berada di bawah `third-party/`, sehingga
salin/junction ketiga direktori skill ke skill path host, lalu reload sesi.
Instruksi routing merupakan panduan pemilihan skill oleh agent — bukan gate
CLI dan tidak dijamin host yang mengabaikan skill descriptions/rules. Baca
`references/80-awwwards-juliobsz.md` dan `references/81-hallmark.md`.

---

## Perintah

| Perintah | Kegunaan |
|---|---|
| `forge doctor` | inventaris alat; exit 1 bila alat wajib hilang |
| `forge new "<nama>"` | membuat `docs/` + `.forge/` (kontrak proyek) |
| `forge gate` | menjalankan semua gerbang, menulis `.forge/report.md` |
| `forge gate --url <u>` | menambah audit visual pada halaman nyata |
| `forge gate --release --strict` | gerbang rilis; SKIP ikut menutup |
| `forge ledger mark <skill> --phase P3 --proof <file>` | mencatat skill yang benar-benar dipakai |
| `forge ledger phase P3 --status approved` | menyetujui fase setelah gerbangnya PASS |
| `forge phases` | peta fase → skill → gerbang |
| `node scripts/codemap.mjs` | peta kode tanpa dependensi |

---

## Sembilan fase

| Fase | Hasil | Gerbang |
|---|---|---|
| **P0 Intake** | `docs/BRIEF.md`, satu acuan bernama | 8 jawaban + acuan |
| **P1 Spec** | sasaran, non-sasaran, kriteria selesai | tanpa `TBD` |
| **P2 Plan** | task ≤ 1 sesi, tiap task ber-`Gate:` | ≥ 3 task bergerbang |
| **P3 Fondasi** | shell, token, peta kode | audit visual 0 FAIL |
| **P4 Layar inti** | tiga alur utama | 0 FAIL @ 390/768/1440 |
| **P5 Layar sisa** | layar sekunder, auth, panel | rute 200, tanpa 500 |
| **P6 Harden** | keamanan, performa, a11y | kontras ≥ 4.5, target ≥ 44 px |
| **P7 Prove** | tes + review konteks terpisah | verdict bernomor |
| **P8 Ship** | rilis + probe eksternal | rute, sitemap, 404, form |
| **P9 Handoff** | `docs/HANDOFF.md` + daftar utang | bisa dijalankan orang baru |

Peta lengkap skill per fase: [`references/60-skills.md`](references/60-skills.md)
(sumber kebenaran mesin: [`manifest.json`](manifest.json)).

---

## Gerbang

| Gerbang | Mengukur |
|---|---|
| `brief` | delapan jawaban + acuan |
| `spec` | bagian wajib ada, tanpa `TBD` |
| `plan` | ≥ 3 task, semua punya `Gate:` |
| `encoding` | 0 BOM, 0 mojibake |
| `secrets` | `.env` tidak ter-track, 0 pola kunci |
| `tests` | test runner terdeteksi → exit 0 |
| `build` | build script → exit 0 |
| `graph` | `graphify-out/GRAPH_REPORT.md` lebih baru dari kode |
| `design-audit` | `inspect.mjs` 0 FAIL per rute × lebar |
| `ledger` | fase approved punya bukti + skill wajib |

Status: `PASS` · `FAIL` · `WARN` · `SKIP`. Hanya `FAIL` yang menutup `gate`;
`--release --strict` juga menutup pada `SKIP`.

---

## Pasang sebagai skill agen

Repo ini mengikuti format Agent Skills. Salin folder ini ke direktori skill
klien Anda, atau pakai berkas adaptor:

| Klien | Berkas |
|---|---|
| OpenCode | `adapters/opencode/AGENTS.md` + `commands/forge.md` |
| Claude Code | `adapters/claude-code/CLAUDE.md` |
| Codex | `adapters/codex/AGENTS.md` |
| Cursor | `adapters/cursor/.cursorrules` |
| Lainnya | `adapters/generic/AGENTS.md` |

Setelah terpasang, kalimat seperti **"saya ingin membuat website"** atau
**"build me an app"** memuat `SKILL.md` dan memulai pipeline yang sama.

---

## Tanpa alat apa pun

Gerbang dokumen, encoding, rahasia, dan peta kode berjalan dengan Node saja.
Alat tambahan menaikkan mutu, bukan syarat:

| Alat | Bila tidak ada |
|---|---|
| `graphify` | pakai `scripts/codemap.mjs` — path laporan sama |
| `design-taste-frontend` (`inspect.mjs`) | `design-audit` → SKIP, rilis tertutup |
| `playwright-cli` | uji interaksi manual, catat sebagai SKIP |

---

## Batasan yang diakui

- Tidak menulis kode fitur untuk Anda; ia menolak melewatkan langkah.
- Tidak menyalakan server, database, atau deploy.
- Peta kode bawaan lebih dangkal daripada `graphify`.
- Skill eksternal hanya **dirujuk** dengan ID, tidak dibundel (lihat `NOTICE.md`).
- Angka audit bergantung pada inspector; tanpa itu statusnya SKIP, bukan lulus.

---

## Lisensi

MIT — lihat [`LICENSE`](LICENSE). Karya asli; tidak memuat salinan skill pihak
ketiga.
