# Dataset Pengujian Denah Asli Bali (18 Sampel Arsitektur Nyata)

Direktori ini berisi **18 berkas gambar denah arsitektur nyata** (bukan gambar sintetis/mockup) yang dikumpulkan dari literatur arsitektur tradisional Bali, jurnal akademik (*Jurnal Arsitektur Undagi — Universitas Warmadewa*), dan publikasi proyek arsitektur Bali (*ArchDaily* / *Wikimedia Commons*) untuk keperluan **Stress Test End-to-End** mesin **BaleKerta**.

## Cara Menjalankan Stress Test

Pastikan server backend aktif di `http://localhost:8000`, lalu jalankan:

```bash
cd backend
python tools/test_real_plans.py
```

Hasil lengkap pengujian akan dicetak ke terminal dan disimpan secara otomatis ke [`../stress_test_results.json`](../stress_test_results.json).

---

## Daftar 18 Sampel Denah Uji

| No | Nama Berkas | Proyek / Studi Kasus | Kategori | Kabupaten Uji | Sumber |
|---:|---|---|---|---|---|
| 1 | `denah_1_tradisional_bali.jpg` | Kompleks Rumah Adat Bali (*A Balinese Compound*) | Tradisional Pakem | Gianyar | *Indonesian Heritage Vol. 6: Architecture* (Wikimedia Commons) |
| 2 | `denah_2_umah_hati_ubud.jpg` | Umah Hati Villa — Floor Plan | Vila Kontemporer | Gianyar | Studio Jencquel (ArchDaily) |
| 3 | `denah_2_umah_hati_site.jpg` | Umah Hati Villa — Master Site Plan (Kontur Tanpa Label) | Site Plan Lanskap (Uji Negatif) | Gianyar | Studio Jencquel (ArchDaily) |
| 4 | `denah_3_oberoi_mainhouse.jpg` | The Oberoi Luxury Villa — Main House Floor Plan | Vila Modern | Badung | Arkana Architects (ArchDaily) |
| 5 | `denah_3_oberoi_masterplan.jpg` | The Oberoi Luxury Villa — Master Plan | Master Plan Vila | Badung | Arkana Architects (ArchDaily) |
| 6 | `denah_4_terrace_villa_neba.jpg` | Terrace Villa Ubud | Vila Tropis | Gianyar | Studio Neba (ArchDaily) |
| 7 | `denah_5_canggu_321.jpg` | 321 Canggu Residence | Hunian Modern | Badung | 321 Architects (ArchDaily) |
| 8 | `denah_6_suncoast_canggu.jpg` | Suncoast Villa Berawa | Vila Modern | Badung | Biombo Architects (ArchDaily) |
| 9 | `denah_7_cala_blanca.jpg` | Cala Blanca Villa (CAD Murni Minim Teks) | Vila Modern (Edge Case) | Badung | Biombo Architects (ArchDaily) |
| 10 | `denah_8_bandido_bali.jpg` | Bandido Bali Villas Bingin | Vila Resort | Badung | Javi Diaz Architects (ArchDaily) |
| 11 | `denah_9_bali_temple.jpg` | Diagram Tata Ruang Pura Bali (Tri Mandala: Nista/Madya/Utama) | Arsitektur Sakral | Karangasem | Wikimedia Commons |
| 12 | `denah_10_desa_hay.jpg` | Desa Hay Sanctuary Resort | Resort Kontemporer | Tabanan | Moments_id (ArchDaily) |
| 13 | `denah_11_chameleon.jpg` | Chameleon Villa Buwit | Vila Lanskap | Tabanan | Word of Mouth Architecture (ArchDaily) |
| 14 | `denah_12_iron_wood.jpg` | Iron Wood House Bali | Hunian Tropis | Gianyar | Studio Jencquel (ArchDaily) |
| 15 | `denah_13_zenubud.jpg` | Zenubud House — Roof Plan (Atap Sirap Tanpa Ruang) | Rencana Atap (Uji Negatif) | Gianyar | ANTI Architecture (ArchDaily) |
| 16 | `denah_14_undagi_meten_kasus1.jpg` | Rumah Tradisional Bali — Kasus 1 (Kaja-Utara, Desa Adat) | Tradisional Pakem (Jurnal) | Denpasar | Jurnal Arsitektur *Undagi* Univ. Warmadewa |
| 17 | `denah_15_undagi_meten_kasus2.jpg` | Rumah Tradisional Bali — Kasus 2 (Kaja-Selatan / Buleleng) | Tradisional Pakem (Jurnal) | Buleleng | Jurnal Arsitektur *Undagi* Univ. Warmadewa |
| 18 | `denah_16_undagi_meten_kasus3.jpg` | Rumah Tradisional Bali — Kasus 3 (Transformasi Ruang) | Tradisional Pakem (Jurnal) | Gianyar | Jurnal Arsitektur *Undagi* Univ. Warmadewa |
| 19 | `test_denah_bali.png` | Denah Kalibrasi Unit Test Fase 0 (Sanggah, Meten, Paon, Natah, Toilet) | Kalibrasi Vision AI | Gianyar | Dataset Internal |
