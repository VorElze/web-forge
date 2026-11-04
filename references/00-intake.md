# P0 — Intake

Tujuan fase ini: berhenti menebak. Delapan jawaban dan **satu acuan** yang
disebut namanya. Tanpa acuan, jangan menulis satu baris kode pun.

## Aturan acuan

Satu artefak yang bisa dibuka: URL, tangkapan layar, atau berkas desain.
Dua acuan boleh, tapi harus jelas mana yang menang bila bertabrakan.

- Tampilan (bagaimana terlihat dan terasa)
- Fitur (alur mana yang ditiru)
- Alasan: apa yang membuat acuan ini cocok untuk audiens proyek

Kalau pemilik tidak punya acuan, tugas pertama adalah memilihkannya — bukan
langsung mendesain dari nol.

## Delapan pertanyaan

Tanyakan satu per satu, jangan borongan. Catat jawabannya apa adanya di
`docs/BRIEF.md`.

| # | Pertanyaan | Kenapa penting |
|---|---|---|
| 1 | Siapa penggunanya, dan satu hal apa yang harus bisa mereka lakukan? | Menentukan layar inti; sisanya sekunder |
| 2 | Apa tujuan terukur yang menandakan berhasil? | Angka, bukan perasaan. "Formulir terkirim 10/bulan" |
| 3 | Apa yang **tidak** boleh ada? | Non-sasaran mencegah pembengkakan |
| 4 | Kegagalan apa yang paling tidak boleh terjadi? | Anti-sasaran menentukan gerbang keras |
| 5 | Siapa pemilik konten dan seberapa sering berubah? | Menentukan perlu panel admin atau tidak |
| 6 | Perangkat dan jaringan apa yang dipakai? | Ponsel murah + data seluler mengubah anggaran byte |
| 7 | Batasan teknis: hosting, framework, larangan aset eksternal? | Menentukan stack, bukan selera |
| 8 | Kapan selesai, dan apa yang dipotong lebih dulu? | Urutan pemotongan ditulis sebelum panik |

## Anti-sasaran yang sering muncul

Tulis sebagai kalimat yang bisa diuji:

- "Konten contoh tidak boleh tampil sebagai fakta."
- "Tidak boleh ada geser horizontal di 390 px."
- "Tidak boleh ada aset dari domain pihak ketiga."
- "Pengunjung tidak boleh melihat nama anggota tanpa izin."

## Skill yang dipakai

- `interview-me` — wawancara satu pertanyaan sekali jalan sampai ~95% yakin.
- `brainstorming` — bila arah masih terbuka lebar.
- `idea-refine` — bila idenya masih satu kalimat kabur.
- `context-engineering` — menyiapkan `AGENTS.md`/`CLAUDE.md` proyek.
- `request-token-efficiency` — menjaga tiap permintaan tidak melebar.

## Bukti fase

`docs/BRIEF.md` memuat delapan jawaban dan bagian **Acuan** yang terisi.
`forge gate` harus mengembalikan `brief PASS`.
