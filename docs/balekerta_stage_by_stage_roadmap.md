# Kerangka Kerja Bertahap (Stage-by-Stage Framework): BaleKerta 🏛️🌺
> **Prinsip Utama:** *Satu tahap tuntas dan teruji 100% sebelum melangkah ke tahap berikutnya.*  
> **Standar Mutu:** Memenuhi Technical Gate & Rubrik Penilaian Bali DigiFest 2026.

---

## 📌 Peta Tahapan Proyek

| Tahap | Fokus Utama | Target Luaran | Status |
| :---: | :--- | :--- | :---: |
| **Tahap 1** | **Backend Core & Engine AI** | API FastAPI, Azimuth, Sanga Mandala, Rule Checker, Caching | ✅ **SELESAI** |
| **Tahap 2** | **Frontend Visualizer & Canvas** | Next.js, HTML5 Canvas, Overlay 9 Zona, Bounding Box Merah | 🟡 **BERIKUTNYA** |
| **Tahap 3** | **Integrasi End-to-End & Presets** | Form Upload, Selector Wilayah Bali, 3 Preset Uji Juri | ⚪ Belum Mulai |
| **Tahap 4** | **Panel Laporan Audit & UI Polish** | Kartu Skor, Referensi Pasal Perda, Saran Remediasi | ⚪ Belum Mulai |
| **Tahap 5** | **Live Deployment & Stress Test** | Deploy Backend (Cloud) + Frontend (Vercel) | ⚪ Belum Mulai |
| **Tahap 6** | **Penyusunan 4 Berkas Wajib** | Proposal PDF A4 5 Hal, Git Tag `v1.0-submission`, Disclosure | ⚪ Belum Mulai |

---

## 🔍 Rincian Tiap Tahap & Kriteria Kematangan (*Definition of Done*)

### ✅ Tahap 1: Backend Core & Engine AI (STATUS: SELESAI)
- [x] Endpoint `/api/health`, `/api/regencies`, `/api/presets`, dan `/api/presets/{id}` aktif.
- [x] Matematika Azimuth Gunung Agung terverifikasi presisi.
- [x] Rule checker Perda No. 5/2005 & scoring audit tuntas diuji.
- [x] Ter-push bersih ke GitHub.

### 🟡 Tahap 2: Frontend Foundation & Interactive Canvas Visualizer
- [ ] Inisialisasi Next.js 14 + Tailwind CSS + Lucide Icons di `frontend/`.
- [ ] Komponen `PlanCanvas.tsx` untuk render gambar denah proporsional.
- [ ] Proyeksi garis grid 3x3 Sanga Mandala transparan dengan label nama zona adat.
- [ ] Render bounding box ruangan dengan warna dinamis (Hijau = Sesuai, Merah = Melanggar).

### ⚪ Tahap 3: Integrasi End-to-End & Kontrol Interaktif
- [ ] Selector Kabupaten di Bali (rotasi grid otomatis jika pilih Buleleng).
- [ ] Dropzone upload denah baru (`POST /api/audit`).
- [ ] 3 Tombol preset instan (< 500 ms respons tanpa panggil API luar).

### ⚪ Tahap 4: Panel Laporan Audit & Penyempurnaan UI/UX
- [ ] Meteran Skor Kepatuhan (0–100%) & status resmi (Layak PBG / Melanggar).
- [ ] Rincian kutipan pasal Perda No. 5/2005 & saran perbaikan arsitektur.
- [ ] Fitur ekspor ringkasan audit digital.

### ⚪ Tahap 5: Live Deployment & Keandalan Produk (Production Gate)
- [ ] Deploy Backend ke Cloud (Render/Railway).
- [ ] Deploy Frontend ke Vercel dengan konfigurasi environment aman.
- [ ] Verifikasi kestabilan live testing dari perangkat luar.

### ⚪ Tahap 6: Penyusunan 4 Berkas Wajib Submission (Batas 7 November)
- [ ] Proposal Solusi PDF A4 (Maks. 5 Halaman) + Diagram Arsitektur HD.
- [ ] Git Release Tag `v1.0-submission` & README.md showcase.
- [ ] Lembar AI & Technology Disclosure Sheet.
- [ ] Submit pendaftaran resmi di portal DigiFest.
