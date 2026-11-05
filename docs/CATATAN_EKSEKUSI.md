# Catatan Eksekusi & Audit Integritas BaleKerta

Dokumen ini mencatat seluruh riwayat audit, perbaikan teknis, pengujian, dan evolusi arsitektur sistem **BaleKerta** fase demi fase menuju kepatuhan penuh standar kompetisi **Bali DigiFest 2026**.

---

## Fase 0: Integritas AI, Data, dan Geometri (Selesai: 1 November 2026)

### 1. Panggilan Model AI Nyata
- **Skrip Uji:** `backend/tools/check_vision.py` berhasil memverifikasi model aktif untuk API key Google AI Studio.
- **Model Terverifikasi:** `gemini-3.5-flash-lite` berhasil mengekstrak 5 ruangan dari `backend/tests/samples/test_denah_bali.png` dengan latensi 2.68 detik.
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

---

## Fase 1: Redesain Antarmuka Minimalis (No AI Slop) (Selesai: 2 November 2026)

### 1. Palet 3 Warna Tegas
- Menghapus seluruh gradien semu, efek blur kaca (*glassmorphism*), dan badge kecil ber-uppercase yang membuat tampilan terasa "AI slop".
- Menetapkan palet 3 warna harmonis bernuansa arsitektur Bali:
  - **Ink** (`#0E0D0C` s/d `#2A2622`): Latar kanvas gelap hangat, permukaan kartu, dan garis pembatas.
  - **Bone** (`#EDE7DA` / `#A39B8B`): Teks utama, garis ruangan yang telah sesuai, tombol navigasi, dan garis zona suci.
  - **Clay** (`#D2603F`): Khusus untuk menandai masalah, pelanggaran tata ruang, dan peringatan kritis.

### 2. Standarisasi Tipografi & Mikro-Interaksi
- Font Geist / Geist Mono untuk presisi teknis arsitektur.
- Animasi transisi halus menggunakan animejs dengan durasi terukur (300-400ms) tanpa animasi berulang yang mengganggu fokus kerja.

---

## Fase 2: Alur Spasial 3 Langkah & Stepper Interaktif (Selesai: 3 November 2026)

### 1. Pemisahan Alur Kerja Menjadi 3 Langkah Terpandu
- **Langkah 1 (Lokasi & Orientasi Lahan):** Peta interaktif Leaflet + Azimuth live Gunung Agung + deteksi kuadran arah Kaja.
- **Langkah 2 (Denah & Penyelarasan Mata Angin):** Unggah denah atau pilih preset contoh terkalibrasi + pemilih rotasi mata angin (0°, 90°, 180°, 270°) + kanvas visualisasi aspect-fit.
- **Langkah 3 (Hasil Pemeriksaan):** Kesimpulan satu kalimat dalam bahasa Indonesia lugas + kartu masalah + estimasi KDB + lembar laporan pra-PBG.

### 2. Sticky Control Dock & Stepper Header
- Komponen dock navigasi lengket di bawah kanvas untuk memudahkan pengguna berpindah langkah atau menjalankan audit secara instan.
- Stepper header responsif yang menandai progres pemeriksaan secara visual.

---

## Fase 3: Peta Geodesik Leaflet & Halaman Panduan Lengkap (`/panduan`) (Selesai: 4 November 2026)

### 1. Sinkronisasi Geospasial KajaMap & Dynamic Sanga Mandala Grid
- Implementasi peta Leaflet dengan tiles CARTO Dark tanpa beban visual berlebih.
- Mengintegrasikan kalkulasi azimuth geodesik Haversine ke titik koordinat puncak Gunung Agung (−8.3433°, 115.5071°).
- Menyediakan endpoint backend baru: `GET /api/sanga-mandala-grid` untuk mengirim struktur matriks 9 zona dinamis berdasarkan rotasi mata angin dan kuadran Kaja.

### 2. Revamp Halaman Panduan & Glosarium (`/panduan`)
- Membangun 3 tab navigasi interaktif:
  1. **Glosarium Istilah:** 30 entri istilah budaya arsitektur tradisional Bali lengkap dengan pencarian instan dan klasifikasi kategori (Tata Ruang, Bangunan Sakral, Bangunan Hunian, Anatomi & Pengukuran, Filosofi & Regulasi).
  2. **Kalkulator Sikut Hasta:** Kalkulator antropometris Asta Kosala-Kosali (Hasta, Depa, Musti, Nyari, Rai, Agul) dengan simulator dimensi ruang berdasarkan tinggi badan pemohon.
  3. **Struktur Sanga Mandala:** Visualisasi kisi 9 zona kosmologis lengkap dengan dewa penguasa (*Dewata Nawa Sanga*), elemen panca maha bhuta, dan izin fungsi bangunan.
- Menambahkan tombol navigasi kembali `"← Kembali ke Pemeriksaan Denah"` dan drawer istilah yang terintegrasi di seluruh langkah audit.

---

## Fase 4: Engine Maturity, Adaptive Compound Bounds, KDB 2D Union & Stress Test (Selesai: 5 November 2026)

### 1. Normalisasi Tapak Adaptif (*Adaptive Compound Bounding Box*)
- Pada denah nyata dari jurnal dan lapangan arsitektur, denah bangunan sering kali tidak berbentuk bujur sangkar sempurna (persegi panjang asimetris) atau hanya menempati sebagian sudut tapak.
- Mengembangkan fungsi `normalize_to_compound_bounds()` di `backend/engine/audit_checker.py` untuk mengidentifikasi poligon selubung luar tapak secara otomatis dan memetakan kisi 9 zona Sanga Mandala secara proporsional.

### 2. Kalkulasi Koefisien Dasar Bangunan (KDB) Berbasis 2D Union Polygon
- Versi sebelumnya menjumlahkan luas kotak setiap ruangan secara terpisah, menyebabkan *over-counting* (luas KDB membengkak) jika terdapat poligon ruangan yang bersinggungan atau tumpang tindih.
- Diperbarui: menggunakan kalkulasi poligon gabungan (*2D union polygon*) untuk menghitung luas bersih jejak bangunan (*footprint*), menghasilkan estimasi persentase KDB yang akurat dan dapat dipertanggungjawabkan secara matematis.

### 3. Perlindungan Kuota Gemini AI & Hash Cache Murni
- Menyelesaikan masalah *cache mismatch* di `backend/engine/vision_parser.py`: kunci cache disatukan menjadi hash SHA-256 byte gambar murni (`hashlib.sha256(image_bytes).hexdigest()`), menjamin *cache hit* 100% pada unggahan ulang denah yang sama.
- Memperpendek batas waktu panggilan (*timeout*) menjadi 25 detik dan memprioritaskan model berkecepatan tinggi (`gemini-2.5-flash-lite`, `gemini-2.5-flash`).
- Menambahkan penanganan khusus `ResourceExhausted / 429`: jika kuota Google AI Studio habis, sistem seketika membatalkan *retry loop*, menampilkan pesan informatif, dan menyediakan tombol uji instan menggunakan denah contoh bawaan tanpa gangguan.

### 4. Stress Test End-to-End Menggunakan 18 Denah Arsitektur Nyata
- Mengumpulkan 18 sampel denah arsitektur asli Bali (bukan mockup sintetis) dari *Jurnal Arsitektur Undagi*, *ArchDaily*, dan *Wikimedia Commons*.
- Menjalankan skrip uji otomatis `backend/tools/test_real_plans.py`:
  - **Hasil Evaluasi:** Seluruh 18 denah berhasil diproses tanpa kegagalan runtime (*zero crashes*).
  - **Temuan Kepatuhan:** Denah pakem tradisional (Gianyar/Denpasar) terdeteksi patuh dengan skor tinggi, sedangkan vila kontemporer dengan orientasi non-standar terdeteksi memiliki catatan penempatan utilitas kotor/toilet di zona suci secara akurat.
  - Laporan lengkap didokumentasikan di `backend/tests/stress_test_results.json` dan `backend/tests/samples/README.md`.

---

## Fase 5: Pembersihan Berkas Repository & Standardisasi Dokumentasi (Selesai: 5 November 2026)

### 1. Pembersihan Berkas Lokal & Git Tracking
- Menghapus file sisa kosong (*stray file*): `frontend/src/app/panduan/restored_client.tsx` (0 byte).
- Merapikan root direktori: memindahkan file gambar uji `test_denah_bali.png` ke `backend/tests/samples/test_denah_bali.png` dan memperbarui skrip `backend/tools/check_vision.py`.
- Memperbarui `.gitignore` agar secara ketat mengabaikan `.pytest_cache/`, `backend/.pytest_cache/`, `backend/data/cache/`, `frontend/tsconfig.tsbuildinfo`, `scratch/`, dan file sementara build.

### 2. Pemutakhiran Dokumentasi & Standar Kompetisi
- Memperbarui `README.md` utama dengan URL resmi `https://github.com/Pashinoh/BaleKerta.git`, diagram alur arsitektur Mermaid, spesifikasi endpoint API, panduan instalasi lokal, dan panduan Docker Compose.
- Menjamin seluruh 43 unit test backend (`pytest tests -q`) lolos 100% dan frontend terkompilasi bersih tanpa peringatan TypeScript/ESLint (`npm run build`).
