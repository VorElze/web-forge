# P7 — Membuktikan

Fase ini ada karena satu alasan: **penulis tidak boleh menilai pekerjaannya
sendiri**. Penulis yang sama akan melihat yang dia maksud, bukan yang tampil.

## Matriks bukti

Jalankan semuanya; satu baris tanpa angka bukan bukti.

| Yang diklaim | Cara mengukur | Ambang lulus |
|---|---|---|
| Semua halaman hidup | rute × identitas (anonim, pengguna, admin) | 0 × HTTP 500 |
| Tata letak utuh | 11+ rute × 5 lebar; `scrollWidth - clientWidth` setelah `scrollTo(9999,0)` + 2 rAF | 0 px luapan |
| Keterbacaan | kontras hasil alpha-compositing | min ≥ 4,5:1 |
| Bisa disentuh | elemen interaktif < 44 px (kecuali tautan inline) | 0 temuan |
| Tidak ada pihak ketiga | rekam semua permintaan jaringan | 0 host asing (bila dilarang) |
| Formulir bekerja | kirim 1 pesan uji, cek masuk, hapus | 1 baris muncul |
| PDF benar | magic bytes `%PDF-` + ukuran byte | cocok |
| CSV idempoten | impor 2× | jumlah baris sama |
| Angka konsisten | ringkasan beranda vs halaman laporan, 3 periode | selisih 0 |
| Kode terpetakan | `graphify-out/GRAPH_REPORT.md` lebih baru dari kode | ya |
| Tes | `php artisan test` / `npm test` | 0 gagal |

## Format verdict

Gate menulis verdict, bukan opini. Bentuk yang dipakai:

```
VERDICT: APPROVE | REVISE | BLOCK
Temuan:
1. [FAIL] <lokasi> — <apa> — <bukti angka> — <perbaikan>
2. [WARN] ...
Batas: <apa yang tidak diuji>
```

- **APPROVE** — semua gerbang PASS, sisa WARN dijelaskan dan disengaja.
- **REVISE** — ada FAIL yang bisa diperbaiki tanpa mengubah lingkup.
- **BLOCK** — gagal pada keamanan, data orang, atau integritas arsitektur.

Verdict tanpa angka tidak sah. "Terlihat bagus" bukan verdict.

## Pemisahan penulis dan gate

- Penulis menulis kode dan mengisi ledger.
- Gate dijalankan pada konteks terpisah (sub-agen lain, sesi baru, atau reviewer
  manusia) yang **tidak melihat riwayat penulisan** — hanya diff dan hasil ukur.
- Reviewer dilarang memperbaiki kode saat menilai; perbaikan terjadi setelah
  verdict keluar.

Skill: `code-review`, `requesting-code-review`, `receiving-code-review`,
`caveman-review`, `ponytail-review`, `release-gate-scan`, `verify-and-stop`,
`gate-harness-selfcheck`, `dogfood` (QA eksploratif), `verification-before-completion`.

`gate-harness-selfcheck` penting: buktikan gerbangnya benar-benar bisa gagal.
Umpankan satu berkas rusak ke gate; kalau tetap PASS, gerbangnya tidak mengukur.

## Membaca hasil `forge gate`

| Status | Arti | Tindakan |
|---|---|---|
| PASS | diukur, lulus | lanjut |
| FAIL | diukur, gagal | perbaiki, jangan diabaikan |
| WARN | diukur, di bawah standar tapi tidak memblokir | jelaskan di `DECISIONS.md` |
| SKIP | **tidak diukur** | bukan lulus. `--release --strict` menutup rilis |

SKIP yang sah hanya bila alatnya memang tidak ada, dan alasannya ditulis.
SKIP karena malas adalah FAIL yang menyamar.

## Bukti fase

`.forge/report.md` tanpa FAIL, verdict tertulis, dan setiap temuan bernomor
punya angka pendukung.
