# Constraints — web-forge

Ambang ini tidak boleh diturunkan tanpa menulis alasannya di
`docs/DECISIONS.md` dan menyebutkannya di riwayat commit.

| Dimensi | Ambang | Cara diperiksa |
|---|---|---|
| Tes | 0 gagal | `npm test` |
| Gerbang yang bisa gagal | ≥ 6 skenario negatif di selftest | `scripts/selftest.mjs` |
| Encoding | 0 file BOM, 0 mojibake | `gate` → `encoding` |
| Rahasia | 0 pola kunci di berkas ter-track, `.env` tidak ter-track | `gate` → `secrets` |
| Peta kode | `GRAPH_REPORT.md` > 200 byte dan lebih baru dari kode | `gate` → `graph` |
| Bukti | 100% fase `approved` punya path bukti yang ada | `gate` → `ledger` |
| Dependensi runtime | 0 | `package.json` tanpa `dependencies` |
| Node | ≥ 20 | `engines` |

## Dilarang sebagai jalan pintas

- Menambah `try/catch` yang menelan error hanya agar gerbang hijau.
- Menurunkan ambang di tabel ini agar pekerjaan lama lulus.
- Menghapus atau melewati tes yang gagal.
- Menulis `SKIP` lalu memperlakukannya sebagai `PASS`.
- Menambah dependensi untuk hal yang bisa ditulis < 50 baris.
