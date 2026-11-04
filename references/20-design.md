# P3/P4 — Desain dan audit visual

Desain bukan selera yang tak bisa diuji. Yang tak bisa diuji adalah "cantik".
Yang bisa diuji: kontras, luapan, target sentuh, hierarki, dan kepadatan.

## Arah visual dulu, komponen kemudian

Sebelum menulis CSS, tetapkan lima hal dan catat di `docs/DECISIONS.md`:

1. **Audiens dan nada** — tenang/tegas, arsip/kampanye, institusi/komunitas.
2. **Palet** — 6–8 token: latar, permukaan, tinta, tinta sekunder, aksen,
   teks-di-atas-aksen, panel gelap + teksnya.
3. **Tipografi** — satu display, satu teks. Maksimal dua keluarga.
4. **Skala huruf** — token `--step-*`; jangan menambah ukuran di luar token.
5. **Aturan gerak** — hanya transform/opacity; hormati `prefers-reduced-motion`.

Bila butuh arah dari acuan nyata, muat `design-taste-frontend`,
`awesome-design-md`, `popular-web-designs`. Bila acuan berupa gambar, muat
`screenshot-to-code` dan bandingkan hasil render dengan gambar aslinya.

## Dua belas aturan anti-slop

1. Tanpa gradien dekoratif.
2. Tanpa kartu berbingkai + bayangan + sudut bulat sekaligus.
3. Tanpa baris ikon "fitur" generik tiga kolom.
4. Tanpa label HURUF BESAR berspasi lebar sebagai hiasan.
5. Tanpa garis penghubung pada bagan organisasi — pakai baris, tone, jarak.
6. Tanpa teks pahlawan yang hanya mengulang nama produk.
7. Tanpa angka statistik yang tidak punya sumber.
8. Tanpa foto stok berwarna cerah pada tema tenang.
9. Tanpa animasi masuk pada setiap elemen; satu pola saja.
10. Tanpa menu tersembunyi di balik ikon tanpa label.
11. Tanpa ukuran huruf baru di luar token.
12. Tanpa warna baru di luar palet — termasuk untuk status.

Kalau salah satu dilanggar, tulis alasannya di `docs/DECISIONS.md`.

## Protokol audit (harus menjalankan, bukan mengira)

Alat: `design-taste-frontend` → `scripts/inspect.mjs`.

```bash
node <skills>/design-taste-frontend/scripts/inspect.mjs "http://127.0.0.1:8080/" --out .forge/audit/home
```

- Exit `0` = tidak ada FAIL. Exit `1` = ada FAIL; buka
  `.forge/audit/home/report.json`.
- Jalankan untuk **setiap** rute yang berubah, pada 390 / 768 / 1440 px.

### Luapan horizontal — cara mengukur yang benar

Snapshot tanpa scroll melaporkan `0` palsu. Urutannya:

1. `window.scrollTo(9999, 0)`
2. tunggu dua `requestAnimationFrame`
3. baca `document.documentElement.scrollWidth - clientWidth`
4. sebutkan elemen terlebar (`getBoundingClientRect().right > innerWidth`)

Lebar uji: 360 / 390 / 768 / 1024 / 1440.

### Kontras

Hitung dengan alpha-compositing terhadap latar sebenarnya, ambang **4,5:1**
untuk teks normal. Laporkan nilai minimum yang ditemukan, bukan "aman".

### Target sentuh

Hitung elemen interaktif dengan sisi < 44 px. Pisahkan tautan inline di dalam
paragraf — itu pengecualian yang sah, tombol bukan.

## Skill yang dipakai

- `design-taste-frontend` — arah + audit terukur (wajib).
- `frontend-design` — menghindari tampilan template.
- `impeccable` — critique, hierarchy, motion, empty state.
- `ui-ux-pro-max` — pola komponen, palet, pasangan font.
- `forms-and-data-entry` — label, autocomplete, validasi, keyboard.
- `antislop-ui`, `antislop-layoutmobile`, `antislop-human` — saringan akhir.
- `touch-target-audit`, `css-overflow-verification` — pengukuran khusus.
- `web-design-guidelines` — audit aksesibilitas menyeluruh.

## Bukti fase

`.forge/audit/*/report.json` ada, 0 FAIL pada rute × lebar yang dikonfigurasi,
dan `forge gate --url <url>` mengembalikan `design-audit PASS`.
