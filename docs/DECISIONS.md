# Keputusan — web-forge

Format: keputusan — alasan — konsekuensi.

## D-01 — Satu CLI Node, tanpa dependensi

**Keputusan:** seluruh alat ada di `scripts/forge.mjs` + `scripts/codemap.mjs`,
Node 20+, tanpa paket npm.

**Alasan:** Node hampir selalu ada di mesin pengembang web; satu berkas lebih
mudah diaudit daripada rantai dependensi. Bash dan PowerShell akan terpecah
menjadi dua implementasi yang cepat berbeda perilaku.

**Konsekuensi:** pengguna tanpa Node tidak bisa memakai gerbang. Diakui di
`references/70-tooling.md`.

## D-02 — `manifest.json` adalah sumber kebenaran skill

**Keputusan:** daftar fase, skill wajib, dan bukti hidup di `manifest.json`.
`references/60-skills.md` hanya versi bacaan.

**Alasan:** dokumen akan basi; manifes bisa dibaca mesin dan menggerakkan gerbang.

**Konsekuensi:** bila keduanya berbeda, manifes menang. Perubahan skill wajib
harus lewat manifes.

## D-03 — SKIP bukan PASS

**Keputusan:** gerbang yang tidak bisa diukur berstatus `SKIP`, dan
`--release --strict` menutup rilis selama ada SKIP.

**Alasan:** satu-satunya cara membuat "belum diukur" tidak menyamar sebagai
"lulus".

**Konsekuensi:** proyek tanpa inspector visual tidak bisa merilis lewat
`--strict` sampai audit dijalankan manual atau alatnya dipasang.

## D-04 — `codemap.mjs` sebagai fallback graphify

**Keputusan:** repo membawa pembuat peta kode sendiri yang menulis ke path yang
sama (`graphify-out/GRAPH_REPORT.md`).

**Alasan:** mewajibkan biner pihak ketiga membuat gerbang tidak bisa dipenuhi di
mesin bersih — dan gerbang yang mustahil dipenuhi akan diakali.

**Konsekuensi:** dua tingkat kedalaman peta. `graphify` tetap disarankan dan
disebut lebih kaya.

## D-05 — Tidak menyalin teks skill pihak ketiga

**Keputusan:** repo hanya memuat karya sendiri; skill lain disebut sebagai ID.

**Alasan:** sebagian skill di ekosistem berlisensi Apache-2.0 atau tanpa
lisensi jelas. Menyalin isinya memaksa audit lisensi per berkas dan berisiko
melanggar.

**Konsekuensi:** pemetaan skill adalah rujukan, bukan salinan; kualitas akhir
bergantung pada skill yang terpasang di klien.

## D-06 — Skill non-perangkat-lunak tidak dipaksa

**Keputusan:** hanya skill yang bisa mengubah artefak proyek yang masuk pipeline.

**Alasan:** memaksa skill catatan Apple atau produksi musik pada pembangunan
situs menghasilkan pekerjaan palsu, bukan mutu.

**Konsekuensi:** aturan pengecualian ditulis eksplisit di `manifest.json`
(`excluded`) supaya tidak terlihat seperti kelalaian.
