# P3–P5 — Membangun

Aturan tunggal: **irisan tipis, selalu bisa dijalankan, selalu bergerbang.**
Jangan menulis lima layar lalu menyalakannya.

## Urutan yang tidak boleh dibalik

1. Shell: layout, navigasi, halaman kosong, 404.
2. Token desain: warna, huruf, jarak, skala.
3. Satu alur inti dari brief.
4. Alur inti kedua dan ketiga.
5. Layar sekunder, autentikasi, panel.
6. Baru kemudian: hiasan.

Setiap langkah diakhiri `forge gate`. Gate merah = jangan lanjut menambah layar.

## Graphify lebih dulu, grep kemudian

Peta kode dibangun sebelum menulis fitur dan dibangun ulang sebelum menutup
pekerjaan:

```bash
graphify update .             # menghasilkan graphify-out/GRAPH_REPORT.md + graph.json
```

Sebelum mengubah apa pun, tanyakan ke peta: modul mana yang memiliki perilaku
ini? Setelah perubahan besar, bangun ulang — laporan yang lebih tua dari kode
dianggap basi oleh `forge gate` (status WARN, dan `--strict` menutup rilis).

Aturan praktis: `graphify-query-first` sebelum `grep` untuk pertanyaan
"bagaimana X bekerja", bukan untuk mencari satu nama fungsi.

## Diff minimal (ponytail)

- Perbaiki di lapisan paling sempit yang bertanggung jawab.
- Jangan menambah abstraksi untuk satu pemakaian.
- Jangan mengubah format seluruh berkas; diff berisik menyembunyikan bug.
- Tandai utang dengan komentar `shortcut:` supaya `ponytail-debt` bisa
  mendaftarnya di akhir.

## Kejujuran berkas sumber

Bug paling mahal yang tak terlihat oleh tes adalah **encoding**.

- Tulis berkas dengan editor/alat tulis, **jangan** lewat pipe shell
  (`echo`, `-replace`, `Set-Content`) pada konsol non-UTF-8.
- Simpan UTF-8 **tanpa BOM**. BOM merusak header HTTP, cookie, dan status 404.
- Karakter seperti panah (`U+2192`), em-dash (`U+2014`), dan titik tengah
  (`U+00B7`) mudah berubah menjadi pasangan byte yang salah — misalnya
  `U+00E2 U+2020`, `U+00E2 U+20AC`, `U+00C2 U+00B7`. Halaman tetap "lolos audit"
  karena audit mengukur tata letak, bukan glyph.
- `forge gate` memeriksa BOM dan mojibake di setiap berkas teks.

## Aturan per stack

**Laravel/PHP**
- PHP 8.4+ bila `composer.lock` memuat Symfony 8.x — 8.3 akan gagal install.
- `php artisan test` setiap perubahan; `pdo_sqlite` aktif untuk tes.
- Gambar lewat satu pipeline (`ImageStore`-pola), markdown disanitasi, CSRF di
  semua form, header keamanan di middleware.
- Jangan menyimpan path gambar di model; simpan id media.

**Next/React**
- Server component secara default; `"use client"` hanya bila perlu.
- Route matrix diuji dengan `playwright-cli`, bukan dengan mata.
- Hydration error = FAIL, bukan peringatan.

**Statis/HTML**
- Tanpa dependensi runtime. CSS satu berkas, JS < 60 KB gzip.
- Semua aset lokal; tidak ada CDN bila `noExternalAssets: true`.

**API**
- Kontrak ditulis lebih dulu (schema), lalu tes kontrak, lalu implementasi.
- Kode status dan bentuk error adalah bagian dari kontrak.

## Skill yang dipakai

- `incremental-implementation`, `surgical-patch`, `safe-refactor`, `ponytail`
- `graphify`, `graphify-query-first`, `codebase-design`
- `tdd` / `test-driven-development` untuk logika yang bisa salah
- `diagnosing-bugs` / `systematic-debugging` bila ada kegagalan tanpa sebab jelas

## Bukti fase

`forge gate` → `tests PASS`, `build PASS`, `graph PASS`, dan `design-audit
PASS` untuk setiap rute yang berubah.
