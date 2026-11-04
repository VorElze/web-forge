# P1 — Spec

Spec yang baik bisa dibaca orang yang tidak ikut membangun, lalu bisa
menjawab "sudah jadi atau belum" tanpa bertanya.

## Kerangka `docs/SPEC.md`

```
# Spec — <nama>

## Sasaran
- (satu baris = satu hasil terukur)

## Non-sasaran
- (yang sengaja tidak dikerjakan)

## Anti-sasaran
- (kegagalan yang tidak boleh terjadi)

## Peta halaman
| Rute | Isi | Publik? | Status |

## Model data
| Entitas | Kolom penting | Aturan |

## Alur utama
1. (langkah pengguna)
2. ...

## Kriteria selesai
- [ ] (bisa diuji: angka, status HTTP, jumlah, ada/tidak)
```

## Kriteria yang bisa diukur

Ganti kata sifat dengan angka. Contoh pasangan buruk → benar:

| Buruk | Benar |
|---|---|
| "Cepat" | "LCP < 2,5 s pada 4G lambat di beranda" |
| "Responsif" | "Tidak ada geser horizontal pada 360/390/768/1024/1440" |
| "Aman" | "Tidak ada 500 pada 27 rute × 2 identitas; tidak ada rahasia di git" |
| "Mudah dipakai" | "Target sentuh ≥ 44 px; kontras ≥ 4,5:1" |
| "SEO bagus" | "Sitemap memuat semua konten terbit; 0 draft; canonical unik" |
| "Konten bisa diubah" | "Pengurus menambah 1 kegiatan tanpa menyentuh kode" |

Aturan praktis: kalau sebuah kriteria tidak bisa gagal, itu bukan kriteria.

## Model data

Tulis entitas, kolom yang mengikat aturan, dan **aturan tampil** — bukan
struktur tabel lengkap. Yang wajib tertulis:

- status publikasi (draft/terbit) dan kolomnya,
- izin (consent) bila ada data orang,
- apa yang tidak boleh berubah (mis. nomor registrasi),
- apa yang otomatis (slug, redirect 301).

## Alur utama

Batasi tiga. Setiap alur punya titik akhir yang bisa diperiksa: "pesan masuk
ke kotak admin", "akun aktif bisa login", "pesanan tersimpan".

## Skill yang dipakai

- `spec-driven-development` — menulis spec sebelum kode.
- `measurable-acceptance-criteria` — mengubah keinginan jadi ambang.
- `domain-modeling` — menyamakan istilah; buat `GLOSSARY.md` bila perlu.
- `api-and-interface-design` — bila ada API/kontrak antar modul.
- `constraint-driven-development` — menulis `CONSTRAINTS.md`: ambang yang tidak
  boleh diturunkan tanpa keputusan sadar.
- `doubt-driven-development` — untuk keputusan yang mahal dibalik.

## Bukti fase

`forge gate` → `spec PASS`: bagian Sasaran, Non-sasaran, dan Kriteria selesai
ada, dan tidak ada `TBD`.
