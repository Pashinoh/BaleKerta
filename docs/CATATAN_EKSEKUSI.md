# Catatan Eksekusi & Audit Integritas BaleKerta

## Fase 0: Integritas AI, Data, dan Geometri (Selesai: 1 November 2026)

### 1. Panggilan Model AI Nyata
- **Skrip Uji:** `backend/tools/check_vision.py` berhasil memverifikasi model aktif untuk API key Google AI Studio.
- **Model Terverifikasi:** `gemini-3.5-flash-lite` berhasil mengekstrak 5 ruangan dari `test_denah_bali.png` dengan latensi 2.68 detik.
- **Data Ekstraksi AI Nyata:**
  - `KAMAR TIDUR UTAMA` (bedroom) -> box: [50, 52, 397, 448]
  - `TOILET TAMU` (toilet) -> box: [52, 628, 349, 948]
  - `NATAH TERBUKA` (open space) -> box: [350, 351, 650, 650]
  - `DAPUR (PAON)` (kitchen) -> box: [602, 53, 949, 423]
  - `SANGGAH PEMERAJAN` (sanggah) -> box: [603, 628, 949, 948]
- **Penanganan Fallback:** Jalur `/api/audit` TIDAK LAGI menggunakan data mock palsu jika AI gagal. Jika kuota Google mencapai limit (429), sistem mengembalikan pesan transparan `rate_limit_exceeded` dengan anjuran menunggu 40 detik.

### 2. Pembersihan Cache Teracuni
- Seluruh file cache lama di `backend/data/cache/` telah dihapus.
- `backend/data/cache/` dimasukkan ke `.gitignore` agar tidak ter-commit ke GitHub.
- Sistem cache diperbarui: hanya menyimpan respons jika berasal dari model AI asli (`ai:<model>`).

### 3. Koreksi Geometri Kanvas (F3)
- Pada versi sebelumnya, kanvas memetakan koordinat 0-1000 ke seluruh ukuran kanvas, mengabaikan offset gambar aspect-fit (`centerShiftX`, `centerShiftY`).
- Diperbaiki: fungsi `toPxX` dan `toPxY` kini terikat tepat pada area persegi panjang gambar (`renderArea`), sehingga kotak bounding box berimpit presisi dengan tulisan di denah.

### 4. Verifikasi Regulasi & Teks Hukum (F4 & F5)
- Nomor pasal Perda No. 5/2005 yang belum divalidasi silang terhadap lembaran daerah diubah menjadi rujukan umum pedoman Asta Bumi & Asta Kosala-Kosali dengan tanda `"verified": false`.
- Header sertifikat cetak yang sebelumnya bertajuk instansi pemerintah diubah menjadi:
  `BALEKERTA — SISTEM ANALISIS TATA RUANG BALI (LEMBAR PRA-PEMERIKSAAN KEPATUHAN ARSITEKTUR TRADISIONAL BALI)`.
  Ditambahkan klausul bahwa lembar tersebut merupakan pra-pemeriksaan independen dan bukan dokumen resmi pemerintah/PBG dinas.

### 5. Aturan Orientasi Sanga Mandala (F8)
- Berdasarkan prinsip Asta Bumi, orientasi Kaja di Bali Selatan (Denpasar, Badung, Gianyar) menempatkan sudut suci Utamaning Utama di Kaja-Kangin (Utara-Timur).
- Di Bali Utara (Singaraja/Buleleng), Kaja mengarah ke Selatan/Tenggara menuju Gunung Agung.
- Dua varian utama dipertahankan: `TOP_RIGHT` (Kaja atas-kanan) dan `BOTTOM_RIGHT` (Kaja bawah-kanan) untuk mengakomodasi seluruh wilayah Bali.
