# BaleKerta
### Engine Pra-Pemeriksaan Kepatuhan Tata Ruang Adat Bali Berbasis AI Vision & Geospasial
> **Solver for Bali — Bali DigiFest 2026 | AI Web Innovation Challenge**  
> *Fokus: Bali Smart Society (Pelestarian Arsitektur Tradisional, Lingkungan & Regulasi PBG)*

---

## 1. Latar Belakang & Masalah (*Problem Statement*)

Pembangunan properti (vila, homestay, hotel, ruko, dan hunian) di Bali memiliki kekhasan arsitektural yang tidak ditemukan di wilayah lain di Indonesia. Berdasarkan **Perda Provinsi Bali No. 5 Tahun 2005 tentang Persyaratan Arsitektur Bangunan Gedung**, setiap permohonan Persetujuan Bangunan Gedung (PBG) wajib menyelaraskan tata ruang tapak dengan filosofi arsitektur tradisional Bali:

1. **Asta Bumi & Sanga Mandala:** Pembagian lahan pekarangan ke dalam kisi 3×3 (9 zona spasial) berdasarkan sumbu suci *Kaja-Kelod* (Gunung–Laut) dan *Kangin-Kauh* (Terbit–Terbenamnya Matahari).
2. **Asta Kosala-Kosali:** Standar proporsi dimensi dan anatomi arsitektur tradisional.
3. **Kepatuhan Zonasi PBG & KDB:** Batas Koefisien Dasar Bangunan (maksimal 60%) untuk menjamin ruang terbuka hijau dan resapan air alami (*Natah* dan *Teba*).

### Masalah Nyata di Lapangan:
* **Kompleksitas Orientasi Kosmologis:** Arah *Kaja* (Gunung Agung) berbeda-beda di setiap kabupaten. Di Bali Selatan (Denpasar, Badung, Gianyar), Gunung Agung berada di Timur Laut; sedangkan di Bali Utara (Singaraja/Buleleng), arah gunung berada di Tenggara/Selatan.
* **Pelanggaran Zonasi Sakral:** Penempatan utilitas kotor (toilet, septic tank) di zona suci (*Utamaning Utama*) bertentangan dengan pakem adat dan menghambat proses verifikasi PBG.
* **Ketiadaan Alat Audit Pra-Pemeriksaan:** Pemohon PBG dan arsitek sering kali baru mengetahui kesalahan tata letak setelah gambar kerja selesai atau saat diverifikasi manual.

---

## 2. Solusi: BaleKerta v2

**BaleKerta** menyederhanakan pra-pemeriksaan denah menjadi **alur intuitif 3 langkah**:

```
[ Langkah 1: Lokasi Tanah ] ──► [ Langkah 2: Denah Bangunan ] ──► [ Langkah 3: Hasil Kepatuhan ]
  - Peta Interaktif Leaflet        - Denah Contoh atau Unggah denah  - Kesimpulan bahasa awam
  - Seret pin lokasi pekarangan    - Deteksi otomatis AI Vision       - Kartu perbaikan & solusi
  - Garis azimuth ke Gn. Agung     - Rotasi orientasi mata angin     - Lembar laporan pra-PBG
  - Preview kisi 9 Sanga Mandala   - Pemetaan koordinat aspect-fit   - Kamus budaya interaktif
```

1. **Langkah 1 — Lokasi Tanah (Peta Leaflet):** Menghitung sudut azimuth geodesik ke puncak Gunung Agung (−8.3433°, 115.5071°) secara instan dan memproyeksikan letak zona suci (*Utamaning Utama*).
2. **Langkah 2 — Denah Bangunan:** Pengguna dapat memilih denah contoh terkalibrasi atau mengunggah denah sendiri (PNG/JPG/WebP) untuk dibaca oleh model **Gemini 3.5 Flash Lite Vision**. Dilengkapi pengatur arah mata angin denah (*0°, 90°, 180°, 270°*).
3. **Langkah 3 — Hasil Kepatuhan:** Kesimpulan satu kalimat dalam bahasa Indonesia lugas, estimasi KDB, kartu masalah dengan panduan solusi konkret, dasar pedoman adat, dan lembar laporan pra-pemeriksaan yang dapat dicetak langsung.
4. **Glosarium Istilah Arsitektur Bali:** 30 entri istilah budaya (*Kaja, Kelod, Natah, Sanga Mandala, Asta Kosala-Kosali, Hasta, dll.*) terintegrasi dengan tooltip interaktif dan laci referensi yang dapat dicari.

---

## 3. Prinsip Desain: Bebas "AI Slop"

Sistem antarmuka BaleKerta dibangun dengan disiplin ketat tanpa ornamen dekoratif berlebihan:

* **Palet 3 Warna:**
  * **Ink** (`#0E0D0C` s/d `#2A2622`): Latar kanvas gelap hangat, permukaan kartu, dan garis pembatas.
  * **Bone** (`#EDE7DA` / `#A39B8B`): Teks utama, garis ruangan yang telah sesuai, tombol navigasi, dan garis zona suci.
  * **Clay** (`#D2603F`): Khusus untuk menandai masalah, pelanggaran tata ruang, dan peringatan kritis.
* **Tanpa Elemen Semu:** Tidak ada gradien warna-warni, efek blur kaca, teks mikro ber-uppercase berlebih, animasi dekoratif, maupun emoji pada antarmuka.
* **Kejujuran Data (Integritas AI):** Transparansi sumber data ditampilkan dengan jelas (*Preset Bawaan*, *Dianalisis langsung oleh AI*, atau *Dari Cache AI valid*). Jika kuota AI mencapai batas, sistem mengembalikan pesan transparan dan tombol coba lagi tanpa data mock palsu.

---

## 4. Stack Teknologi & Transparansi AI

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Leaflet 1.9 & React-Leaflet (peta interaktif CARTO Dark), HTML5 Canvas API (koordinat aspect-fit).
* **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic.
* **Model AI Aktif:** Google Gemini 3.5 Flash Lite Vision (`models/gemini-3.5-flash-lite`) via Google Generative AI SDK (latensi rata-rata ~2.6 detik per denah).
* **Geodesik & Spasial:** Geodesic azimuth calculation, rotasi kisi matriks Sanga Mandala 3×3, kalkulasi luas poligon ruangan (KDB).
* **Knowledge Base:** Pedoman Asta Bumi, Asta Kosala-Kosali, dan Perda Prov. Bali No. 5/2005.

---

## 5. Cara Menjalankan Secara Lokal (*Local Development*)

### Prasyarat:
* Node.js v18+ & npm
* Python 3.10+
* Google Gemini API Key

### A. Clone Repository
```bash
git clone https://github.com/Pashinoh/gatau-mo-isi-apa.git
cd gatau-mo-isi-apa
```

### B. Konfigurasi Environment Variable
Salin template konfigurasi:
```bash
cp .env.example .env
```
Buka `.env` dan masukkan API key Gemini Anda:
```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.5-flash-lite
```

### C. Menjalankan Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Di Windows:
.\venv\Scripts\activate
# Di Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Uji endpoint backend:
```bash
python scripts/test_geo_and_rotation.py
```

### D. Menjalankan Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Buka peramban di `http://localhost:3000`.

---

## 6. Batasan Sistem (*Disclaimers*)

1. **Pra-Pemeriksaan Independen:** BaleKerta berfungsi sebagai alat pra-pemeriksaan otomatis dan sarana edukasi arsitektur adat. Keputusan resmi perizinan bangunan tetap berada di bawah wewenang Tim Profesi Ahli (TPA) dan Dinas PUPR/Perkim terkait melalui proses PBG resmi.
2. **Kalkulasi KDB Kasar:** Persentase Koefisien Dasar Bangunan (KDB) dihitung secara perkiraan kasar dari rasio luas total bounding box ruangan terhadap luas bidang tapak gambar.
3. **Kalkulator Ukuran Adat:** Modul konversi ukuran tubuh (*Hasta*, *Depa*, *Musti*) pada kamus istilah bersifat estimasi antropometris tradisi dan bukan parameter mutlak audit struktural.
