# Pemetaan Regulasi & Pakem Arsitektur Tradisional Bali ke Aturan Deterministik BaleKerta

Dokumen ini menjelaskan landasan hukum, naskah sastra tradisional (Lontar), dan formulasi matematis yang digunakan oleh engine evaluasi deterministik BaleKerta.

---

## 1. Dasar Hukum & Rujukan Normatif

1. **Peraturan Daerah Provinsi Bali Nomor 5 Tahun 2005 tentang Persyaratan Arsitektur Bangunan Gedung:**
   - **Pasal 4 & 5:** Kewajiban penerapan falsafah *Tri Hita Karana* (keharmonisan Parahyangan, Pawongan, Palemahan) dalam penataan bangunan gedung di Provinsi Bali.
   - **Pasal 9:** Penataan tapak pekarangan berpedoman pada konsepsi *Sanga Mandala* (pembagian sembilan zona kosmologis) dan sumbu suci *Kaja-Kelod* serta *Kangin-Kauh*.
   - **Pasal 14 & 15:** Ketentuan Koefisien Dasar Bangunan (KDB) maksimum 60% untuk menjaga resapan air alami dan kelestarian ruang terbuka (*Natah* dan *Teba*).
2. **Lontar Asta Bumi:**
   - Pedoman tata letak pekarangan, hierarki kesucian tanah, penentuan orientasi berdasarkan gunung (*Kaja*) dan laut (*Kelod*), serta larangan peletakan fungsi kotor di area sakral.
3. **Lontar Asta Kosala-Kosali:**
   - Pedoman dimensi antropometris arsitektur tradisional Bali berbasis proporsi tubuh manusia (*Hasta*, *Depa*, *Musti*, *Nyari*, *Rai*).

---

## 2. Matriks Zonasi Sanga Mandala (3 x 3)

Pekarangan dibagi menjadi sembilan kuadran berdasarkan dua sumbu kosmis:
- **Sumbu Kaja - Kelod:** Sumbu spiritual mengarah ke Gunung Agung (*Kaja* = Suci/Utama) versus Laut (*Kelod* = Profan/Nista).
- **Sumbu Kangin - Kauh:** Sumbu peredaran matahari dari Timur (*Kangin* = Terbit/Awal/Utama) ke Barat (*Kauh* = Terbenam/Akhir/Nista).

| Zona Sanga Mandala | Tingkat Kesucian | Fungsi Peruntukan yang Selaras | Pelanggaran Kritis |
| :--- | :--- | :--- | :--- |
| **Utamaning Utama** | Utama (Paling Suci) | Sanggah / Pamerajan (Tempat Ibadah Keluarga) | Toilet, Septic Tank, Tempat Sampah |
| **Madyaning Utama** | Utama - Madya | Bale Daja / Gedong Meten (Ruang Tidur Kepala Keluarga) | Area Pembuangan Kotoran |
| **Nistaning Utama** | Utama - Nista | Bale Dauh bagian utara, ruang kerja | Toilet |
| **Utamaning Madya** | Madya - Utama | Bale Dangin / Bale Gede (Upacara Yadnya / Tamu Terhormat) | Kandang Ternak, Toilet |
| **Madyaning Madya** | Titik Pusat (*Natah*) | Ruang terbuka hijau / halaman tengah tanpa atap | Tertutup bangunan masif (KDB melampaui) |
| **Nistaning Madya** | Madya - Nista | Bale Dauh (Ruang istirahat / kegiatan harian) | Area pembuangan limbah B3 |
| **Utamaning Nista** | Nista - Utama | Angkul-angkul (Pintu Gerbang Utama / Akses Masuk) | Sanggah / Pamerajan (terbalik) |
| **Madyaning Nista** | Nista - Madya | Paon (Dapur tradisional), garasi, utilitas umum | Sanggah / Ruang Suci |
| **Nistaning Nista** | Nista (Paling Rendah) | Kamar mandi / Toilet, Septic Tank, Teba, Kandang | Sanggah, Bale Meten |

---

## 3. Formulasi Algoritma Deterministik

### A. Kalkulasi Geodesik Poros Kaja
Sudut azimuth Kaja dihitung menggunakan rumus *Great-Circle Initial Bearing* (Haversine) dari koordinat GPS tapak $P_1(\phi_1, \lambda_1)$ ke titik puncak Gunung Agung $P_2(\phi_2 = -8.3433^\circ, \lambda_2 = 115.5071^\circ)$:

$$\Delta\lambda = \lambda_2 - \lambda_1$$
$$\theta = \text{atan2}\left(\sin(\Delta\lambda)\cos(\phi_2), \;\cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta\lambda)\right)$$
$$\text{Azimuth} = (\theta \times \frac{180}{\pi} + 360) \pmod{360}$$

### B. Normalisasi Bounding Box Adaptif (Aspect-Fit Compound)
Untuk mengakomodasi denah arsitektur riil yang tidak selalu bujur sangkar, BaleKerta membentuk poligon pembungkus gabungan (*compound bounding box*) dari seluruh ruangan terdeteksi:

$$X_{\min} = \min(x_{i, \min}), \quad X_{\max} = \max(x_{i, \max})$$
$$Y_{\min} = \min(y_{i, \min}), \quad Y_{\max} = \max(y_{i, \max})$$

Setiap ruangan $i$ dipetakan ke kuadran matriks $3 \times 3$ berdasarkan titik pusat geometrisnya (*centroid*):

$$C_{x,i} = \frac{x_{i, \min} + x_{i, \max}}{2}, \quad C_{y,i} = \frac{y_{i, \min} + y_{i, \max}}{2}$$
$$\text{Kolom} = \left\lfloor \frac{C_{x,i} - X_{\min}}{(X_{\max} - X_{\min}) / 3} \right\rfloor, \quad \text{Baris} = \left\lfloor \frac{C_{y,i} - Y_{\min}}{(Y_{\max} - Y_{\min}) / 3} \right\rfloor$$

### C. Koefisien Dasar Bangunan (KDB) Tanpa Over-Counting
BaleKerta menggunakan operasi *2D Geometric Union* (Shapely) pada poligon semua ruangan untuk menghitung luas tutupan tanah riil ($A_{\text{bangunan}}$) dibagi luas pekarangan ($A_{\text{tapak}}$):

$$\text{KDB} = \frac{\text{Area}\left(\bigcup_{i=1}^n \text{Polygon}_i\right)}{\text{Area}(\text{Tapak})} \times 100\%$$
$$\text{Status} = \begin{cases} \text{Sesuai Regulasi}, & \text{jika KDB} \le 60\% \\ \text{Melanggar Batas}, & \text{jika KDB} > 60\% \end{cases}$$
