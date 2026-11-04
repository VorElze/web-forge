# Brief — web-forge

Diisi pada: 2026-11-04
Acuan: `hermes-office-skills` (format skill publik) + `design-taste-frontend` (cara audit terukur)

## 8 pertanyaan intake

1. Siapa penggunanya, dan satu hal yang harus bisa mereka lakukan?
   Pemakai agen AI (OpenCode, Claude Code, Codex) dan pemilik proyek non-teknis.
   Satu hal: menyuruh "buat website" lalu mendapat proses yang tidak bisa
   berhenti sebelum terbukti.
2. Tujuan terukur yang menandakan berhasil?
   Tiga angka: (a) 9 fase dengan gerbang yang bisa dijalankan, (b) 0 fase bisa
   di-`approved` tanpa berkas bukti, (c) `selftest` membuktikan gerbang bisa
   gagal (8/8).
3. Apa yang tidak boleh ada (non-sasaran)?
   Framework aplikasi, generator kode lengkap, hosting, akun pengguna, panel
   web, dependensi npm, bahasa selain Indonesia/Inggris.
4. Anti-sasaran: kegagalan yang paling tidak boleh terjadi?
   Menyatakan "selesai" untuk pekerjaan yang tidak diukur. Gerbang yang selalu
   PASS. Berkas sumber yang rusak encoding-nya karena ditulis lewat pipe shell.
5. Siapa pemilik konten dan seberapa sering berubah?
   Pemilik repo; berubah saat ada pola kegagalan baru yang perlu jadi gerbang.
6. Perangkat dan jaringan?
   Windows/macOS/Linux, terminal, tanpa jaringan saat dijalankan (kecuali
   memasang alat).
7. Batasan teknis?
   Node 20+, tanpa dependensi runtime, tanpa CDN, satu CLI. Isi repo harus
   karya sendiri — tidak menyalin teks skill pihak ketiga (alasan lisensi).
8. Kapan selesai, dan apa yang dipotong lebih dulu?
   Selesai bila repo publik bisa dipakai dari nol oleh mesin lain. Yang dipotong
   lebih dulu: integrasi CI, panel web, dan bahasa tambahan.

## Acuan

- Tampilan: tidak berlaku (ini CLI + dokumen).
- Fitur: `graphify` untuk peta kode, `design-taste-frontend` untuk audit visual,
  `spec-driven-development` + `writing-plans` untuk urutan dokumen.
- Alasan: ketiganya sudah terbukti pada satu proyek nyata dan menghasilkan angka,
  bukan opini.
