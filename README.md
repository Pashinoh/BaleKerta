# BaleKerta 🏛️🌺
### AI-Powered Spatial Compliance & Cultural Architecture Audit Engine
> **Solver for Bali — Bali DigiFest 2026 | AI Web Innovation Challenge**  
> *Fokus Bidang: Bali Smart Society (Pariwisata, Budaya, Lingkungan & Regulasi)*

---

## 📌 1. Latar Belakang & Masalah (*Problem Statement*)

Pembangunan properti (vila, homestay, hotel, ruko, dan hunian) di Bali memiliki kekhasan yang tidak ditemukan di daerah lain. Berdasarkan **Perda Provinsi Bali No. 5 Tahun 2005 tentang Persyaratan Arsitektur Bangunan Gedung**, setiap permohonan Persetujuan Bangunan Gedung (PBG) wajib menyelaraskan tata ruang tapak dengan filosofi arsitektur tradisional Bali:
1. **Asta Bumi & Sanga Mandala:** Pembagian lahan ke dalam 9 zona spasial sakral-profan berdasarkan sumbu suci *Kaja-Kelod* (Gunung–Laut) dan *Kangin-Kauh* (Terbit–Terbenamnya Matahari).
2. **Asta Kosala-Kosali:** Standar proporsi dimensi arsitektur berbasis antropometri tubuh manusia (*depa, hasta, musti, rai*).
3. **Kepatuhan Zonasi PBG/KDB:** Batas Koefisien Dasar Bangunan (maks. 60%) dan penataan ruang terbuka hijau.

### 🔥 *Pain Point* Nyata:
* **Kompleksitas Orientasi Kosmologis:** Arah *Kaja* (Gunung Agung) berbeda-beda di setiap kabupaten. Di Bali Selatan (Denpasar, Badung, Gianyar), Gunung Agung berada di Utara/Timur Laut; sedangkan di Bali Utara (Buleleng), arah gunung berada di Selatan. Arsitek pemula sering keliru menentukan arah suci tapak.
* **Pelanggaran Zonasi Sakral:** Penempatan utilitas kotor/buangan (toilet, septic tank, dapur kotor) di zona suci (*Utamaning Utama*) sering memicu penolakan izin PBG oleh dinas dan resistensi warga desa adat.
* **Ketiadaan Alat Audit Otomatis:** Verifikasi denah saat ini masih dilakukan manual oleh dinas atau arsitek senior, memakan waktu 1–2 minggu per berkas permohonan.

---

## 💡 2. Solusi: BaleKerta

**BaleKerta** adalah sistem inspeksi dan audit tata ruang arsitektur Bali otomatis berbasis kecerdasan buatan (*Multimodal Vision + Geometrical Engine + Legal Knowledge Base*). 

Pengguna cukup mengunggah denah bangunan (JPG/PNG/PDF) dan memilih lokasi tapak lahan. Sistem akan:
1. **Menghitung Azimuth Geospasial ke Gunung Agung** secara otomatis berdasarkan koordinat GPS/wilayah tapak.
2. **Mendeteksi Ruangan & Bounding Box** pada denah secara cerdas menggunakan Vision Language Model (VLM).
3. **Memproyeksikan Grid 9 Sanga Mandala** di atas denah dengan orientasi presisi.
4. **Melakukan Audit Kepatuhan Deterministik** untuk mendeteksi pelanggaran zonasi adat dan Perda No. 5/2005.
5. **Memberikan Visualisasi Bounding Box Merah** beserta rekomendasi perbaikan dan kutipan pasal hukum resmi.

---

## 🏗️ 3. Arsitektur Teknis & Pipeline AI

```
[ Pengguna ] 
     │
     ├── 1. Unggah Gambar Denah (PNG/JPG)
     ├── 2. Input Koordinat / Lokasi Tapak (cth: Gianyar)
     └── 3. Input Antropometri Pemilik (cth: 1 Hasta = 45 cm)
     │
     ▼
[ Frontend: Next.js + Tailwind CSS + HTML5 Canvas ]
     │
     ▼ (REST API / Multipart Form-Data)
[ Backend: Python FastAPI ]
     │
     ├── A. Geodesic Azimuth Calculator
     │      Menghitung sudut bantalan (bearing angle) dari koordinat tapak 
     │      ke puncak Gunung Agung (-8.3433° S, 115.5071° E).
     │
     ├── B. Multimodal Vision Parser (Gemini 1.5 Flash Vision)
     │      Mengekstrak label ruangan & koordinat 2D bounding box [ymin, xmin, ymax, xmax] 
     │      dengan Strict JSON Schema.
     │
     ├── C. Spatial Sanga Mandala Engine (NumPy / Shapely)
     │      Membuat 9 kuadran grid berorientasi sudut Kaja-Kelod, 
     │      lalu menghitung perpotongan poligon/titik tengah ruangan (Centroid).
     │
     └── D. Deterministic Legal Auditor (Perda No. 5/2005 Knowledge Base)
            Mengecek aturan zonasi (misal: Toilet di Utamaning Utama = CRITICAL VIOLATION)
            dan mengembalikan referensi pasal hukum tanpa risiko halusinasi.
     │
     ▼
[ Output Respons JSON ] ──► [ Frontend Visualizer: Canvas Overlay + Audit Report Card ]
```

---

## ⚙️ 4. AI & Technology Stack Disclosure

Sesuai ketentuan transparansi kompetisi *AI Web Innovation Challenge*, berikut adalah daftar teknologi yang digunakan:

* **Frontend:** Next.js 14 / React, TypeScript, Tailwind CSS, HTML5 Canvas API (untuk rendering overlay 9 zona dan kotak pelanggaran).
* **Backend:** Python 3.11, FastAPI, Uvicorn, Pydantic.
* **Spatial & Math Engine:** NumPy, Shapely (kalkulasi poligon 2D dan perpotongan koordinat).
* **AI Core Model:** Google Gemini 1.5 Flash (Multimodal Vision API dengan *Structured JSON Output*).
* **Legal Knowledge Base:** Transkrip & Ekstrak Pasal Perda Provinsi Bali No. 5 Tahun 2005 & pedoman naskah Asta Kosala-Kosali.
* **Deployment:** Vercel (Frontend) & Railway/Render (Backend).

---

## 🚀 5. Cara Menjalankan Proyek (*Local Development*)

### Prasyarat:
* Node.js v18+ & npm/pnpm
* Python 3.10+
* Google Gemini API Key

### A. Clone Repository
```bash
git clone https://github.com/Pashinoh/balekerta.git
cd balekerta
```

### B. Konfigurasi Environment Variable
Salin template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel dengan kredensial yang sesuai:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
```

### C. Menjalankan Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### D. Menjalankan Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 📊 6. Rencana Tahapan Pengembangan (Roadmap Tahap 1 & 2)

- [x] **v1.0-submission (Tahap 1 - Batas 7 November):**
  - [x] Perumusan masalah & arsitektur pipeline AI hibrida.
  - [ ] Implementasi Vision Parser dengan Gemini Flash (ekstraksi denah ke JSON).
  - [ ] Implementasi Spatial Sanga Mandala Grid berotasi otomatis sesuai lokasi tapak.
  - [ ] Rule engine audit zonasi dasar (Toilet, Pemerajan, Dapur, Bale).
  - [ ] Web visualizer interaktif dengan HTML5 canvas.
  - [ ] Live deployment URL & video demo alur input-ke-output.
- [ ] **v2.0-final (Tahap 2 - Finalis Top 5):**
  - [ ] Integrasi konversi antropometri dinamis (*depa, hasta, musti*) ke ukuran meteran.
  - [ ] Ekspor laporan resmi format PDF siap lampiran PBG dinas.
  - [ ] Dukungan denah multi-lantai (*Bhur, Bwah, Swah*).

---

## 👥 Tim Pengembang (*Credits*)
* **Pengembang:** Pashinoh & Tim
* **Event:** AI Web Innovation Challenge — Bali DigiFest 2026
* **Lisensi:** MIT License
