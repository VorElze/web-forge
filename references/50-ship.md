# P8 — Merilis

Rilis bukan momen, melainkan urutan yang bisa diulang. Situs lama adalah milik
orang lain: jangan disentuh tanpa arsip.

## Sebelum rilis (semua harus ya)

- [ ] `forge gate --release --strict` → exit 0.
- [ ] Konten asli sudah masuk; penanda "contoh" sudah dicabut dengan sadar.
- [ ] Sandi/demo bawaan sudah diganti.
- [ ] `public/uploads` (atau folder unggahan) sudah diarsipkan terpisah — tidak
      ikut git.
- [ ] Database diekspor; langkah impor ditulis di `docs/DEPLOY.md`.
- [ ] Rollback bisa dilakukan tanpa berpikir: arsip bertanggal + perintah impor.
- [ ] Situs lama diarsipkan: tangkapan layar, berkas, database.

## Rilis

1. Build produksi tanpa dev-dependency.
2. Unggah kode + hasil build + aset + unggahan.
3. `.env` produksi: `APP_ENV=production`, `APP_DEBUG=false`, URL benar.
4. Document root menunjuk ke folder publik, bukan akar aplikasi.
5. Migrasi (bukan `migrate:fresh`), lalu cache config/route/view.
6. Satu perintah verifikasi setelah deploy (lihat bawah).

## Sesudah rilis — ukur, jangan percaya

- Rute utama → 200; rute tak ada → 404 dengan tautan pulang.
- Login berfungsi; sandi produksi berbeda dari lokal.
- Formulir uji terkirim, masuk ke panel, lalu dihapus.
- `sitemap.xml` valid dan hanya memuat konten terbit.
- `robots.txt` memuat baris sitemap.
- Pratinjau tautan (WhatsApp/OG): judul, deskripsi, gambar tampil.
- Ponsel nyata: tidak ada geser horizontal, menu bisa dibuka.
- Log server bersih dari error baru selama 15 menit pertama.

## Rollback

Arsip lama → kembalikan folder → impor database → arahkan domain → simpan arsip
baru sebelum mencoba lagi. Rollback yang belum pernah diuji bukan rollback.

## Skill yang dipakai

- `shipping-and-launch`, `live-web-release-verification`
- `git-workflow-and-versioning`, `github`
- `ci-cd-and-automation` (bila ada pipeline)
- Deploy spesifik: `cpanel-shared-hosting-deploy`, `static-cpanel-site-delivery`,
  `cleo-hosting`, `self-hosted-web-service-ops`
- Setelah live: `observability-and-instrumentation`,
  `service-availability-diagnosis`

## Bukti fase

Hasil probe eksternal (bukan dari mesin build) ditempel ke `.forge/report.md`,
dan `docs/DEPLOY.md` memuat langkah yang benar-benar dijalankan.
