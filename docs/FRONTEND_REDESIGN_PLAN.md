# Rencana Redesain Frontend BaleKerta v2

> Dokumen ini ditulis untuk dieksekusi oleh Gemini (atau agent lain) **fase demi fase**.
> Repo: `C:\Users\irfan\Documents\kuliah\me\lomba bali` — `backend/` (FastAPI), `frontend/` (Next.js 14, Tailwind).
> Tenggat lomba: **7 November 2026**. Prioritas: **P0** wajib, **P1** sebaiknya, **P2** jika ada waktu.

---

## 0. Aturan untuk eksekutor

1. Kerjakan **berurutan per fase**. Selesaikan seluruh *Definition of Done* (DoD) sebuah fase sebelum lanjut.
2. Setelah tiap fase: jalankan `npm run build` (frontend) dan `python -m pytest` / skrip uji (backend) sampai bersih, lalu **commit sendiri per fase** (`feat(ui): ...`, `fix(ai): ...`).
3. **Jangan** menambah warna di luar palet (bagian 3). **Jangan** menambah dependensi di luar daftar (bagian 7.2) tanpa alasan tertulis.
4. **Jangan** menyentuh, menampilkan, atau meng-commit isi `.env` / API key.
5. Jangan menampilkan hasil *fallback/mock* seolah-olah hasil AI (lihat Fase 0).
6. Teks antarmuka: **Bahasa Indonesia sederhana**. Istilah Bali selalu disertai arti (lihat Fase 2).
7. Bila menemukan hal yang bertentangan dengan dokumen ini, tulis di `docs/CATATAN_EKSEKUSI.md` dan lanjutkan dengan pilihan paling aman.

---

## 1. Latar belakang

Umpan balik pengguna terhadap UI v1:

| Keluhan | Akar masalah |
| :-- | :-- |
| "Web sulit dipahami" | Dasbor padat: satu layar berisi preset, kanvas, upload, slider, skor, 4 tab. Tidak ada alur. |
| Istilah tidak dimengerti | *Kaja, Natah, Utamaning Utama, Hasta…* dipakai tanpa penjelasan. |
| Ingin lebih interaktif + Leaflet | Arah Gunung Agung hanya dari dropdown kabupaten; tidak ada peta. |
| Desain terasa "AI slop" | Gradien amber, glow, badge kecil ber-uppercase, emoji, 5+ warna status, teks 10px. |

---

## 2. Temuan audit — **perbaiki dulu (Fase 0, P0)**

Hasil pengecekan kode dan log backend. Ini bukan soal tampilan, tapi soal **kejujuran produk** — juri tahap 2 akan membongkar kode pemanggilan AI.

| # | Temuan | Bukti | Tindakan |
| :-: | :-- | :-- | :-- |
| F1 | **Upload denah tidak benar-benar memakai AI.** Pemanggilan Gemini gagal, lalu sistem diam-diam memakai `generate_mock_rooms_fallback()` (daftar ruangan tetap) dan menampilkannya seperti hasil deteksi. Nama ruangan fallback bahkan mirip `test_denah_bali.png`, sehingga terlihat seperti AI berhasil. | Log backend: `[AI INFO] Gemini rate-limit/busy: ... 404 models/gemini-2.5-flash-lite is no longer available...` → `source: smart-fallback-engine` | Hapus fallback palsu untuk upload. Ganti dengan error jelas + tombol coba lagi (lihat 6.3). |
| F2 | **Cache teracuni.** Hasil fallback disimpan ke `backend/data/cache/<hash>.json`, jadi gambar yang sama berikutnya dilayani sebagai `cache` dengan data palsu. | `backend/data/cache/2214f852…json` berisi "Toilet Tamu" dst. | Hapus file cache itu; **jangan pernah** meng-cache hasil non-AI; tambahkan `backend/data/cache/` ke `.gitignore`. |
| F3 | **Kotak ruangan tidak sejajar dengan gambar.** `PlanCanvas` menggambar gambar dengan *aspect-fit* tetapi memetakan koordinat 0–1000 ke seluruh lebar/tinggi kanvas. | Screenshot terakhir: kotak merah "Toilet Tamu" tidak menimpa tulisan toilet di gambar. | Petakan koordinat ke **persegi panjang gambar yang digambar** (offset + skala), bukan ke kanvas. |
| F4 | **Pasal Perda belum terverifikasi.** Nomor pasal/ayat di `backend/data/perda_rules.json` ditulis tanpa memeriksa teks primer Perda Prov. Bali No. 5/2005. | Isi file | Verifikasi ke teks resmi. Pasal yang tidak bisa diverifikasi → hapus nomor, tulis "berdasarkan pedoman Asta Kosala-Kosali/Asta Bumi" dan tandai `verified: false` di JSON. Jangan tampilkan nomor pasal yang belum terverifikasi. |
| F5 | **Sertifikat bertajuk "PEMERINTAH PROVINSI BALI"** padahal ini alat pra-pemeriksaan non-resmi → bisa dianggap dokumen pemerintah palsu. | `PrintCertificateModal.tsx` | Ganti judul: "Laporan Pra-Pemeriksaan BaleKerta" + keterangan "Bukan dokumen resmi dan bukan pengganti proses PBG". Hapus kata "Sertifikasi", "Verified", stempel. |
| F6 | **Slider Hasta tidak memengaruhi audit.** `hasta_cm` hanya dikirim lalu dikembalikan. Rumus Depa = 4 Hasta dan Musti = Hasta/4 juga belum terverifikasi. | `main.py`, `ControlPanel.tsx` | Keluarkan dari alur utama. Pindahkan menjadi "Kalkulator ukuran adat (perkiraan)" di drawer glosarium, diberi label *perkiraan*. |
| F7 | **KDB dihitung kasar** (jumlah luas kotak ruangan ÷ luas gambar). | `audit_checker.py` | Pertahankan, tapi label di UI: "Perkiraan kasar dari luas kotak ruangan". |
| F8 | **Aturan sudut suci perlu ditinjau.** `build_sanga_mandala_grid` memutar sudut suci mengikuti kuadran bearing (4 kemungkinan). Dalam tradisi, *Kangin* (timur) tetap timur; sudut suci = sisi *Kaja* + sisi timur. | `sanga_mandala.py`, `azimuth.py` | Tinjau dengan sumber (Asta Bumi). Jika benar, sederhanakan jadi dua varian: Kaja di atas (TOP_RIGHT) atau Kaja di bawah (BOTTOM_RIGHT) dalam bingkai "utara di atas". Catat keputusan di `docs/CATATAN_EKSEKUSI.md`. |

### Fase 0 — Integritas (P0)

Tugas:
1. **Hidupkan panggilan AI yang nyata.** Buat skrip `backend/tools/check_vision.py` yang memanggil model vision dengan `test_denah_bali.png` dan mencetak model, latensi, JSON mentah. Log **setiap percobaan model beserta error-nya** (jangan hanya error terakhir). Daftar model dari `genai.list_models()`; jadikan model utama konfigurasi `GEMINI_MODEL` di `.env` (default dipilih dari model yang benar-benar tersedia untuk key ini). Pertimbangkan migrasi ke SDK `google-genai` karena `google-generativeai` sudah usang (pesan error API merekomendasikannya). Free tier ±5 permintaan/menit → tangani 429 dengan *retry-after* (lihat 6.3).
2. Hapus `generate_mock_rooms_fallback()` dari jalur `/api/audit`. Preset tetap statis (itu memang data contoh).
3. Perbaiki F2, F3, F4, F5, F6, F7 sesuai tabel.
4. Tambahkan `source` yang jelas ke respons: `"ai:<nama-model>"`, `"cache:ai:<nama-model>"`, atau `"preset"`. UI wajib menampilkannya (lihat 5.4).

DoD Fase 0:
- [ ] `check_vision.py` mencetak hasil nyata dari model Gemini untuk `test_denah_bali.png`; nama ruangan berasal dari **teks di gambar** (TOILET TAMU, KAMAR TIDUR UTAMA, NATAH TERBUKA, DAPUR (PAON), SANGGAH PEMERAJAN).
- [ ] Upload di UI menghasilkan `source` berawalan `ai:`; kotak berimpit dengan tulisan di gambar (uji dengan gambar persegi **dan** gambar lebar 16:9).
- [ ] Bila AI gagal/kena limit: UI menampilkan pesan jelas, tidak ada kotak palsu, tidak ada file cache baru.
- [ ] Tidak ada nomor pasal tak-terverifikasi di UI; sertifikat berjudul "Laporan Pra-Pemeriksaan".
- [ ] Cache lama dihapus, `.gitignore` diperbarui, commit `fix(ai): ...`.

---

## 3. Prinsip desain

### 3.1 Tiga warna saja (tema gelap)

Semua warna lain berasal dari **ketiga warna ini dengan opasitas/tingkat kecerahan berbeda** (tint netral diperbolehkan, rona baru tidak).

| Peran | Nama | Hex | Dipakai untuk |
| :-- | :-- | :-- | :-- |
| 1. Dasar | **Ink** (arang hangat) | skala: `950 #0E0D0C` `900 #151311` `800 #1D1A17` `700 #2A2622` `600 #3A352F` | latar, kartu, garis 1px |
| 2. Teks | **Bone** (putih tulang) | `100 #EDE7DA` (teks utama) `400 #A39B8B` (teks sekunder) | teks, ikon, tombol utama, garis zona suci |
| 3. Aksen | **Clay** (bata/terakota) | `#D2603F` | **hanya** untuk "perlu perhatian/pelanggaran" |

Aturan semantik (tegas):
- **Clay = masalah.** Kotak ruangan melanggar, ikon peringatan, jumlah masalah. Tidak untuk tombol, tautan, atau dekorasi.
- **Sesuai = Bone** (garis/ikon centang berwarna Bone), bukan hijau. Status dibedakan dengan **ikon + kata** ("Sesuai" / "Perlu diperbaiki"), bukan hanya warna.
- **Tombol utama = Bone solid** (teks Ink). Tombol sekunder = garis Bone/Ink-600.
- Zona suci (*Utamaning Utama*) = **garis putus Bone** + label, bukan emas.
- Kontras teks ≥ 4.5:1 (periksa Clay di atas Ink-900 dan Bone-400 di atas Ink-900 dengan alat kontras).
- Daftarkan sebagai token di `tailwind.config.ts` (`ink`, `bone`, `clay`) dan variabel CSS di `globals.css`. **Hapus** seluruh kelas `amber-*`, `emerald-*`, `red-*`, `slate-*`, `blue-*` dari kode.

### 3.2 Daftar larangan ("anti AI-slop")

- ❌ Gradien, glow, `shadow-*` berwarna, `backdrop-blur`, efek kaca.
- ❌ Emoji di antarmuka (⚠️ ⚖️ 💡 🏛️). Pakai ikon `lucide-react` monokrom ukuran 16–20px.
- ❌ Label mikro ber-uppercase + letter-spacing, deretan pill/badge menumpuk, teks < 13px.
- ❌ Animasi dekoratif (`animate-pulse`, `animate-ping`, `animate-bounce`).
- ❌ Copy pemasaran ("AI-powered", "Next-gen", "Revolusioner"). Gunakan kalimat biasa.
- ❌ `rounded-2xl/3xl` di mana-mana. Pakai radius 6px (kontrol) dan 8px (kartu).
- ❌ Kartu di dalam kartu di dalam kartu. Maksimal satu tingkat; pisahkan dengan garis 1px dan jarak.

### 3.3 Yang dipakai
- **Tipografi:** Geist Sans (sudah ada) untuk teks; Geist Mono untuk angka/koordinat/derajat. Ukuran dasar 15px, minimum 13px. Skala: 13 / 15 / 18 / 24 / 32. Tinggi baris 1.5.
- **Jarak:** kelipatan 4px (4, 8, 12, 16, 24, 32, 48).
- **Border:** 1px `ink-700`. Fokus: outline 2px Bone, offset 2px (`focus-visible`).
- **Gerak:** hanya transisi warna/opasitas 120–160ms; hormati `prefers-reduced-motion`.
- **Tema:** satu tema gelap saja (tidak perlu toggle).

---

## 4. Arsitektur informasi

Ganti dasbor padat dengan **alur 3 langkah** pada satu halaman. Panel kiri = visual besar (peta atau denah), panel kanan = langkah aktif. Di layar sempit (< 1024px) ditumpuk vertikal.

```
┌──────────────────────────────────────────────────────────────┐
│ BaleKerta                         Panduan Istilah   ● API ok │  header
├──────────────────────────────────────────────────────────────┤
│  Periksa apakah tata letak rumah sesuai aturan adat Bali.    │  1 kalimat
│  ①Lokasi tanah ─── ②Denah ─── ③Hasil                          │  stepper
├───────────────────────────────┬──────────────────────────────┤
│                               │  Langkah aktif                │
│   PETA (langkah 1)            │  - judul + 1 kalimat bantuan  │
│   atau                        │  - kontrol                    │
│   KANVAS DENAH (langkah 2–3)  │  - tombol "Lanjut"            │
│                               │                              │
├───────────────────────────────┴──────────────────────────────┤
│  Kamus mini 9 zona (selalu terlihat di langkah 2–3)           │
└──────────────────────────────────────────────────────────────┘
```

- **Langkah 1 — Lokasi tanah** (peta Leaflet) → menghasilkan arah *Kaja*.
- **Langkah 2 — Denah** → pilih contoh **atau** unggah; atur "sisi atas gambar menghadap ke mana"; tombol **Periksa denah**.
- **Langkah 3 — Hasil** → kesimpulan satu kalimat, daftar masalah, daftar ruangan, laporan.
- Pengguna bisa kembali ke langkah sebelumnya; memindah pin di peta **memperbarui hasil secara langsung** bila hasil sudah ada (preset/cache = instan).

---

## 5. Spesifikasi fitur

### 5.1 Peta Leaflet (Fase 4, P0)

Tujuan: membuat arah Gunung Agung terlihat dan dapat dimainkan, bukan hanya angka.

Fungsi:
- Peta terkunci ke Bali: `maxBounds` ≈ lat −9.0…−7.9, lon 114.3…116.0; `minZoom 9`; pusat awal Denpasar.
- **Klik peta / seret pin** → set lokasi tanah. Di luar batas Bali → pesan "Pilih lokasi di dalam Pulau Bali."
- Penanda **Gunung Agung** (−8.3433, 115.5071) dengan label.
- **Garis putus** dari pin ke puncak Gunung Agung + label tengah garis: "Kaja ke arah Timur Laut · 56°".
- Pilihan cepat per kabupaten (chip/dropdown) → `flyTo` koordinatnya (data dari `GET /api/regencies`).
- Tombol "Gunakan lokasi saya" (Geolocation, opsional; tangani penolakan izin).
- **Inset kompas/9-zona mini** di samping peta: kisi 3×3 kecil dengan sudut suci diberi garis Bone tebal + label "Zona paling suci". Berubah saat pin dipindah → pengguna langsung paham akibat lokasi.
- Teks bantuan di panel kanan, mis.: "*Kaja* artinya arah menuju gunung. Di tanah Anda, gunung berada ke **timur laut**, jadi zona paling suci ada di **pojok kanan-atas** denah."
- Ikon penanda: `L.divIcon` berisi SVG monokrom (hindari masalah aset ikon default Leaflet di Next.js).
- Ubin peta: **CARTO `dark_nolabels`/`dark_all`** (netral abu-gelap, selaras palet). Wajib tampilkan atribusi "© OpenStreetMap contributors © CARTO". Tangani kegagalan muat ubin (latar Ink-800 + pesan kecil, pin tetap berfungsi).
- `scrollWheelZoom` mati sampai peta diklik (agar tidak menghalangi scroll halaman di ponsel). Navigasi keyboard bawaan Leaflet aktif.
- Implementasi Next.js: komponen `"use client"`, dimuat via `dynamic(() => import("./KajaMap"), { ssr: false })`; `import "leaflet/dist/leaflet.css"` di komponen peta.

Data ke backend: `lat`, `lon` → `GET /api/kaja` (lihat 6.1). Tidak memanggil AI.

### 5.2 Glosarium istilah Bali (Fase 2, P0)

Tiga lapis bantuan agar pengguna awam tidak tersesat:

1. **Tooltip inline** — komponen `<Term id="natah">Natah</Term>`: teks bergaris bawah titik-titik; hover/fokus/tap membuka kartu kecil (istilah, arti satu kalimat, tautan "Selengkapnya"). Aksesibel keyboard (`aria-describedby`, Esc menutup).
2. **Drawer "Panduan Istilah"** (tombol di header, juga tautan "Selengkapnya"): daftar bisa dicari, dikelompokkan: *Arah*, *9 Zona*, *Bangunan*, *Pedoman*, *Ukuran*, *Aturan*. Setiap entri: arti, **kenapa penting untuk denah**, contoh.
3. **Label zona di denah** dapat diklik → membuka entri zona di drawer.

Sumber data: `frontend/src/data/glossary.ts` (array bertipe `{id, term, group, short, why, example?, verified}`).

Entri awal (draf isi; **eksekutor wajib memeriksa ke sumber/ahli budaya**, set `verified:false` untuk yang ragu):

| Kelompok | Istilah | Arti singkat (draf) |
| :-- | :-- | :-- |
| Arah | **Kaja** | Arah menuju gunung (Gunung Agung). Arah paling dimuliakan. |
| Arah | **Kelod** | Arah menuju laut; berlawanan dengan Kaja. Dianggap sisi "rendah". |
| Arah | **Kangin** | Arah matahari terbit (timur). |
| Arah | **Kauh** | Arah matahari terbenam (barat). |
| Zona | **Sanga Mandala** | Pembagian pekarangan menjadi 9 zona (3×3) dari yang paling suci ke paling biasa. |
| Zona | **Utamaning Utama** | Zona paling suci (sudut Kaja-Kangin); tempat persembahyangan keluarga. |
| Zona | **Madyaning Madya** | Zona tengah; pusat pekarangan (*Natah*). |
| Zona | **Nistaning Nista** | Zona paling "rendah" (Kelod-Kauh); untuk *teba*, sampah, kandang, sanitasi. |
| Zona | *(6 zona lain)* | Madyaning Utama, Nistaning Utama, Utamaning Madya, Nistaning Madya, Utamaning Nista, Madyaning Nista — masing-masing satu kalimat. |
| Bangunan | **Natah** | Halaman terbuka di tengah pekarangan; sebaiknya tidak ditutup bangunan. |
| Bangunan | **Pemerajan / Sanggah** | Tempat persembahyangan keluarga. |
| Bangunan | **Bale Daja (Meten)** | Bangunan sisi Kaja; umumnya kamar tidur kepala keluarga. |
| Bangunan | **Bale Dangin** | Bangunan sisi Kangin; untuk kegiatan upacara. |
| Bangunan | **Bale Dauh** | Bangunan sisi Kauh; ruang tamu/kerja/anak. |
| Bangunan | **Paon** | Dapur; umumnya di sisi Kelod. |
| Bangunan | **Jineng** | Lumbung padi. |
| Bangunan | **Teba** | Bagian belakang pekarangan (sisi Kelod); kebun, kandang, pembuangan. |
| Bangunan | **Angkul-angkul** | Gerbang masuk pekarangan. |
| Pedoman | **Asta Kosala-Kosali** | Pedoman tata bangunan tradisional Bali (ukuran, proporsi, penempatan). |
| Pedoman | **Asta Bumi** | Pedoman tata pekarangan/tanah. |
| Ukuran | **Hasta / Depa / Musti** | Ukuran berbasis tubuh: siku-ke-ujung-jari / rentang dua tangan / kepalan tangan. (Kalkulator konversi bertanda *perkiraan*.) |
| Aturan | **Perda Bali No. 5/2005** | Peraturan daerah tentang persyaratan arsitektur bangunan gedung. |
| Aturan | **PBG** | Persetujuan Bangunan Gedung (izin mendirikan bangunan). |
| Aturan | **KDB** | Koefisien Dasar Bangunan: persentase tanah yang boleh tertutup bangunan. |

DoD khusus: tiap istilah Bali yang muncul di UI (zona, ruangan, hasil) dibungkus `<Term>`; tidak ada istilah Bali "telanjang" tanpa arti.

### 5.3 Kanvas denah (Fase 5, P0/P1)

- **Perbaikan F3** (pemetaan koordinat ke persegi gambar).
- Kisi 9 zona: garis halus Ink-600; **zona suci** = garis putus Bone + label. Label zona memakai nama + arti singkat ("Utamaning Utama · paling suci").
- Kotak ruangan: **Sesuai** = garis Bone 1.5px, isi transparan 6%; **Perlu diperbaiki** = garis Clay 2px + isi Clay 14% + ikon peringatan kecil. Tidak ada label di semua kotak sekaligus: tampilkan label saat *hover/fokus/dipilih* atau lewat daftar ruangan (hindari kanvas ramai).
- Interaksi: hover/klik ruangan ↔ baris di daftar ruangan menyorot satu sama lain (dua arah). Navigasi keyboard: daftar ruangan dapat difokus (`Tab`), `Enter` memilih.
- **Orientasi denah (baru, penting):** kontrol "Sisi atas gambar menghadap ke…" — Utara (default) / Timur / Selatan / Barat, dengan petunjuk "Cari tanda panah utara pada denah." Nilai ini diteruskan ke backend sebagai `plan_north_deg` ∈ {0,90,180,270} dan memutar kisi zona (lihat 6.2).
- Zoom/pan: opsional (P2). Minimal: tombol "Perbesar" membuka kanvas penuh layar.
- Tanpa gambar (mode contoh): gambar denah skematis sederhana dari kotak ruangan (garis Ink-600), bukan latar "blueprint" bergaya.

### 5.4 Langkah 2 & 3 — input dan hasil (Fase 5–6, P0)

**Langkah 2**
- Dua pilihan jelas (tab sederhana): **Pakai contoh** | **Unggah denah saya**.
- Contoh: 3 baris daftar (radio), masing-masing judul + satu kalimat bahasa awam, mis. "Rumah modern — toilet berada di sudut paling suci."
- Unggah: dropzone sederhana (garis putus Ink-600), validasi PNG/JPG/WebP ≤ 10 MB, pratinjau nama + ukuran, tombol hapus.
- Banner status sumber data, selalu terlihat di langkah 3: "Contoh bawaan (bukan hasil AI)" **atau** "Dibaca oleh AI (model …)" **atau** "Dari cache (hasil AI sebelumnya)".
- Tombol utama **Periksa denah**; saat memuat tampilkan indikator teks ("AI sedang membaca denah…") — tanpa spinner dekoratif besar.
- Error AI (limit/timeout): kotak Clay-outline, kalimat jelas ("Layanan AI sedang penuh. Coba lagi dalam 40 detik."), tombol **Coba lagi**, dan tautan "Lihat contoh bawaan". **Tidak ada hasil palsu.**

**Langkah 3 — Hasil**
- **Kesimpulan satu kalimat** di atas, mis. "Denah ini belum sesuai: ada 2 hal yang perlu diperbaiki." / "Tidak ditemukan pelanggaran pada pemeriksaan ini."
- Skor angka kecil (Geist Mono) sebagai pelengkap, bukan pusat perhatian. Hapus gauge/ring besar.
- **Daftar masalah** (urut tingkat keparahan). Tiap kartu, urutan isi:
  1. Judul bahasa awam: "Toilet berada di zona paling suci".
  2. **Apa artinya** — 1–2 kalimat memakai `<Term>`.
  3. **Cara memperbaiki** — langkah konkret.
  4. Tombol "Lihat di denah" (menyorot kotak).
  5. "Dasar aturan" — **lipatan tertutup**; hanya menampilkan referensi yang `verified:true`.
- **Daftar ruangan** (tabel): Ruangan | Zona (dengan `<Term>`) | Status (ikon + kata).
- "Yang sudah sesuai" — lipatan tertutup.
- Catatan kaki permanen: "Pra-pemeriksaan otomatis berdasarkan pedoman tradisional; bukan keputusan dinas dan bukan pengganti proses PBG."
- KDB: satu baris "Perkiraan kasar luas terbangun: 59%" (F7), tanpa grafik besar. Tab "Dasar Hukum" dihapus (digantikan glosarium).
- Tombol **Unduh/Cetak laporan** → laporan pra-pemeriksaan (F5). Tambahkan `@media print` sehingga hanya laporan yang tercetak (bukan seluruh halaman).

Teks isi aturan diletakkan di `frontend/src/data/rules-copy.ts`, kunci = `rule_id` dari backend (6.4): `{ title, meaning, fix, terms: [...] }`.

---

## 6. Perubahan backend

### 6.1 Endpoint baru `GET /api/kaja?lat=&lon=` (Fase 3, P0)
Kembalikan: `bearing_degrees`, `cardinal_direction`, `kaja_quadrant`, `distance_km`, `in_bali` (bool), `location_label` (kabupaten terdekat). Cepat, tanpa AI. Validasi lat/lon; di luar Bali → `in_bali:false` (tetap 200). Tambah uji untuk Denpasar (~56° NE), Singaraja (Kaja ke selatan/tenggara), dan titik di luar Bali.

### 6.2 Parameter tambahan pada audit (Fase 3, P0)
- `GET /api/presets/{id}` dan `POST /api/audit` menerima `lat`, `lon` (opsional; menggantikan `regency`) dan `plan_north_deg` ∈ {0,90,180,270} (default 0).
- Hitung kisi "utara di atas", lalu **putar matriks 3×3 searah jarum jam sebesar `plan_north_deg`** (definisi: arah dalam gambar yang menunjuk ke utara, diukur searah jarum jam dari sisi atas).
- Terapkan hasil tinjauan F8 pada penentuan sudut suci. Tambah uji: Denpasar `plan_north_deg=0` → suci kanan-atas; `=90` → suci kanan-bawah; Singaraja `=0` → kanan-bawah.
- Hapus `hasta_cm` dari kontrak audit (F6).

### 6.3 Penanganan AI & limit (Fase 0, P0)
- Tidak ada fallback palsu. Kegagalan → HTTP 503 dengan body `{ "error": "ai_unavailable", "retry_after_s": <int|null>, "message": "..." }`; limit → 429 dengan `retry_after_s` dari header/detail API bila tersedia.
- Satu kali *retry* otomatis dengan jeda singkat bila `retry_after_s` ≤ 10 detik; selain itu serahkan ke UI.
- Cache hanya untuk hasil AI yang **valid** (skema JSON lolos, ≥ 1 ruangan, kotak dalam 0–1000, ymin<ymax, xmin<xmax). Simpan juga nama model di berkas cache.
- Validasi keluaran AI dengan Pydantic; tolak/abaikan ruangan tidak valid, laporkan jumlah yang dibuang.

### 6.4 `rule_id` pada setiap temuan (Fase 6, P0)
Tambahkan `rule_id` ke tiap item `violations`/`compliances` di `audit_checker.py`, mis.: `TOILET_IN_SACRED`, `PEMERAJAN_IN_PROFANE`, `PEMERAJAN_OFF_CORNER`, `NO_PEMERAJAN`, `KITCHEN_IN_SACRED`, `NATAH_BLOCKED`, `KDB_EXCEEDED`, `TOILET_IN_TEBA_OK`, `PEMERAJAN_OK`, `KITCHEN_OK`, `NATAH_OK`, `KDB_OK`. Tambahkan `verified` bila ada referensi hukum. Frontend memetakan `rule_id` → teks awam (5.4). Tambahkan `source` (5.4 / Fase 0) pada respons.

---

## 7. Struktur & dependensi

### 7.1 Struktur file target (frontend)

```
frontend/src/
├── app/
│   ├── layout.tsx            # font, metadata, <html lang="id" class="dark">
│   ├── globals.css           # token warna (CSS vars), @media print
│   └── page.tsx              # hanya merangkai Stepper + langkah
├── components/
│   ├── ui/                   # Button, Card, Disclosure, Tooltip, Drawer, Tabs
│   ├── layout/               # Header, Stepper
│   ├── glossary/             # Term.tsx, GlossaryDrawer.tsx
│   ├── map/                  # KajaMap.tsx (dynamic), MiniZoneGrid.tsx
│   ├── plan/                 # PlanCanvas.tsx, RoomList.tsx, OrientationPicker.tsx, UploadBox.tsx, SampleList.tsx
│   └── result/               # Verdict.tsx, IssueCard.tsx, SourceBanner.tsx, Report.tsx
├── data/
│   ├── glossary.ts
│   └── rules-copy.ts
├── lib/
│   ├── api.ts                # + getKaja, audit dengan lat/lon/plan_north_deg, error terstruktur
│   └── geo.ts                # batas Bali, format derajat/arah
└── types/audit.ts
```
Hapus komponen v1 yang tergantikan (`ControlPanel.tsx`, `AuditReportPanel.tsx`, `PrintCertificateModal.tsx`, `UploadDropzone.tsx`) setelah padanannya selesai.

### 7.2 Dependensi baru (satu-satunya yang diizinkan)
`leaflet@^1.9.4`, `react-leaflet@^4.2.1` (kompatibel React 18), `@types/leaflet` (dev). `lucide-react` sudah ada. Tidak perlu pustaka UI/animasi tambahan.

---

## 8. Fase kerja & DoD

| Fase | Isi | Prioritas |
| :-: | :-- | :-: |
| 0 | Integritas AI/data (bagian 2) | P0 |
| 1 | Design system: token, font, komponen dasar, `Header`, `Stepper`; buang gaya lama | P0 |
| 2 | Glosarium: `glossary.ts`, `Term`, `GlossaryDrawer` | P0 |
| 3 | Backend: `/api/kaja`, `lat/lon/plan_north_deg`, uji | P0 |
| 4 | Peta Leaflet + `MiniZoneGrid` (Langkah 1) | P0 |
| 5 | Langkah 2 + kanvas baru + `RoomList` + orientasi | P0 |
| 6 | Langkah 3: `rule_id`, `rules-copy`, kartu masalah, laporan cetak | P0 |
| 7 | QA, aksesibilitas, responsif, polesan, dokumentasi | P0 |

**Fase 1 DoD**
- [ ] Hanya token `ink`, `bone`, `clay` yang dipakai; `grep -rE "amber-|emerald-|red-|slate-|blue-|gradient|animate-(pulse|ping|bounce)|backdrop-blur" frontend/src` → kosong.
- [ ] Tidak ada emoji di JSX; tidak ada teks < 13px.
- [ ] Header + Stepper (3 langkah, dapat diklik ke langkah yang sudah dilewati) tampil benar di 375 / 768 / 1280px.

**Fase 2 DoD**
- [ ] ≥ 25 entri glosarium (semua istilah pada tabel 5.2), field `verified` terisi jujur.
- [ ] `Term` bekerja dengan mouse, keyboard, dan sentuhan; drawer dapat dicari.

**Fase 3 DoD**
- [ ] Uji backend lulus: `/api/kaja` (3 kasus), rotasi `plan_north_deg` (4 kasus), regresi preset (skor preset 1 = 100, preset 2 = 45 kecuali aturan sengaja berubah — catat perubahan).

**Fase 4 DoD**
- [ ] Peta tampil tanpa error SSR; klik/seret pin memperbarui garis, label derajat, MiniZoneGrid, dan teks bantuan dalam < 300 ms.
- [ ] Pin di luar Bali ditolak dengan pesan; ubin gagal-muat tidak merusak UI; atribusi tampil.

**Fase 5 DoD**
- [ ] Kotak ruangan presisi di atas gambar untuk rasio 1:1 dan 16:9 (uji manual dengan `test_denah_bali.png` dan versi dipotong lebar).
- [ ] Hover/klik kanvas ↔ `RoomList` saling menyorot; seluruh isi dapat dioperasikan dengan keyboard.
- [ ] `OrientationPicker` mengubah letak zona suci sesuai uji 6.2.
- [ ] `SourceBanner` benar untuk preset / ai / cache / error.

**Fase 6 DoD**
- [ ] Setiap masalah menampilkan: judul awam, arti (dengan `<Term>`), cara memperbaiki, "Lihat di denah", "Dasar aturan" (hanya yang verified).
- [ ] Laporan cetak: judul "Laporan Pra-Pemeriksaan BaleKerta", keterangan non-resmi, hanya laporan yang tercetak (cek dengan Print Preview).

**Fase 7 DoD** → lihat bagian 9.

Format commit: satu commit per fase, mis. `feat(ui): design system 3 warna dan stepper`.

---

## 9. QA checklist akhir

Fungsional
- [ ] Alur tanpa membaca dokumentasi: pengguna baru bisa menyelesaikan Langkah 1→3 dengan contoh bawaan dalam < 1 menit.
- [ ] Upload denah nyata menghasilkan `source` `ai:*`; saat limit tampil pesan + Coba lagi; tidak ada data palsu.
- [ ] Memindah pin dari Denpasar ke Singaraja memutar zona suci (hasil audit ikut berubah).
- [ ] Mengubah orientasi denah ke Timur/Selatan/Barat memutar zona suci sesuai.

Tampilan & bahasa
- [ ] Hanya 3 warna (Ink/Bone/Clay + tint). Clay hanya muncul untuk masalah.
- [ ] Tidak ada gradien/glow/emoji/animasi dekoratif/teks < 13px.
- [ ] Semua istilah Bali punya arti (tooltip/drawer). Teks tidak mengandung klaim "resmi".

Teknis
- [ ] `npm run build` bersih (tanpa error lint/tipe); backend uji lulus.
- [ ] Lighthouse Accessibility ≥ 90 pada halaman utama; fokus keyboard terlihat; kontras ≥ 4.5:1.
- [ ] Responsif: 375 / 768 / 1280px tanpa scroll horizontal.
- [ ] `git grep -nE "AQ\\.|GEMINI_API_KEY=.+"` tidak menemukan kunci di repo; `.env` tidak ter-track.
- [ ] README diperbarui: cara menjalankan, penjelasan `source`, batasan (free tier AI, KDB perkiraan, bukan dokumen resmi).

---

## 10. Risiko & keputusan terbuka

| Hal | Default yang diambil | Catatan |
| :-- | :-- | :-- |
| Ubin peta | CARTO dark | Gratis untuk penggunaan ringan; perhatikan kebijakan bila trafik tinggi. Alternatif: OSM standar + filter CSS gelap. |
| Warna "sesuai" | Bone (bukan hijau) | Konsekuensi aturan 3 warna; dibantu ikon + kata. Jika ingin warna keempat, putuskan terpisah. |
| Kuota AI free tier | ±5 req/menit | Juri bisa kena limit → pertahankan contoh bawaan + cache hasil AI valid; pertimbangkan key/proyek khusus untuk masa penjurian. |
| Keabsahan isi budaya & hukum | Ditandai `verified` | Minta peninjauan narasumber (dosen/arsitek Bali) sebelum 7 November. |
| Fitur ukuran adat (Hasta) | Kalkulator "perkiraan" di drawer | Belum memengaruhi audit; jangan diklaim sebagai fitur audit. |
