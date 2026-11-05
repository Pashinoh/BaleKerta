export type GlossaryGroup =
  | "Arah"
  | "9 Zona"
  | "Bangunan"
  | "Pedoman"
  | "Ukuran"
  | "Aturan";

export interface GlossaryTerm {
  id: string;
  term: string;
  group: GlossaryGroup;
  short: string;
  why: string;
  example?: string;
  verified: boolean;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // --- ARAH ---
  {
    id: "kaja",
    term: "Kaja",
    group: "Arah",
    short: "Arah menuju gunung (Gunung Agung); arah yang paling disucikan dan dimuliakan dalam kosmologi Bali.",
    why: "Menentukan orientasi utama zona suci (Utamaning Utama) di mana tempat ibadah keluarga (Pemerajan) wajib diletakkan.",
    example: "Di Bali Selatan (Denpasar/Badung), Kaja mengarah ke Timur Laut.",
    verified: true,
  },
  {
    id: "kelod",
    term: "Kelod",
    group: "Arah",
    short: "Arah menuju laut; berlawanan langsung dengan arah Kaja dan dianggap sebagai sisi nista (hilir/biasa).",
    why: "Diperuntukkan bagi fungsi pembuangan, kandang, sanitasi, atau akses keluar rumah (Teba).",
    example: "Di Bali Selatan, Kelod mengarah ke Barat Daya (menuju Samudra Hindia).",
    verified: true,
  },
  {
    id: "kangin",
    term: "Kangin",
    group: "Arah",
    short: "Arah terbitnya matahari (Timur), dipandang sebagai poros terbitnya cahaya dan kehidupan.",
    why: "Bersama arah Kaja membentuk sudut paling suci (Kaja-Kangin) pada pekarangan rumah tinggal.",
    example: "Di pekarangan rumah, area Kaja-Kangin adalah lokasi Sanggah/Pemerajan.",
    verified: true,
  },
  {
    id: "kauh",
    term: "Kauh",
    group: "Arah",
    short: "Arah terbenamnya matahari (Barat), dipandang sebagai poros penutup siklus harian.",
    why: "Digunakan untuk bangunan penunjang kegiatan sehari-hari seperti Bale Dauh (ruang kerja/tamu).",
    example: "Kamar mandi dan toilet biasanya ditempatkan di zona Kaja-Kauh.",
    verified: true,
  },

  // --- 9 ZONA (SANGA MANDALA) ---
  {
    id: "sanga-mandala",
    term: "Sanga Mandala",
    group: "9 Zona",
    short: "Konsep tata ruang adat Bali yang membagi tapak pekarangan menjadi kisi 3×3 (9 zona nilai ruang).",
    why: "Setiap ruangan rumah memiliki nilai kesucian yang harus diletakkan pada zona kisi yang sesuai.",
    example: "Pemerajan harus di Utamaning Utama, sementara toilet di Nistaning Nista.",
    verified: true,
  },
  {
    id: "utamaning-utama",
    term: "Utamaning Utama",
    group: "9 Zona",
    short: "Zona paling suci pada sudut Kaja-Kangin pekarangan.",
    why: "Khusus untuk tempat persembahyangan keluarga (Pemerajan/Sanggah). Dilarang keras ditempati toilet atau septic tank.",
    example: "Sudut kanan-atas pada denah berorientasi Kaja Timur Laut.",
    verified: true,
  },
  {
    id: "madyaning-utama",
    term: "Madyaning Utama",
    group: "9 Zona",
    short: "Zona bernilai suci tingkat menengah di sisi Kaja tengah.",
    why: "Cocok untuk Bale Daja (Meten) atau kamar tidur kepala keluarga/sesepuh.",
    example: "Bale Daja untuk tidur kepala keluarga biasanya di zona Madyaning Utama.",
    verified: true,
  },
  {
    id: "nistaning-utama",
    term: "Nistaning Utama",
    group: "9 Zona",
    short: "Zona di sudut Kaja-Kauh pekarangan.",
    why: "Dapat digunakan untuk kamar tidur keluarga, ruang tamu, atau lumbung padi (Jineng).",
    example: "Bale Dauh (ruang tamu) biasanya berada di zona Nistaning Utama.",
    verified: true,
  },
  {
    id: "utamaning-madya",
    term: "Utamaning Madya",
    group: "9 Zona",
    short: "Zona bernilai tengah cenderung utama di sisi Kangin tengah.",
    why: "Diperuntukkan untuk Bale Dangin (balai upacara adat dan pertemuan keluarga).",
    example: "Bale Dangin sering diletakkan di Utamaning Madya menghadap ke Kangin.",
    verified: true,
  },
  {
    id: "madyaning-madya",
    term: "Madyaning Madya",
    group: "9 Zona",
    short: "Zona pusat persilangan di tengah pekarangan rumah.",
    why: "Harus menjadi Natah (halaman terbuka tanpa atap) sebagai poros sirkulasi udara dan interaksi.",
    example: "Halaman terbuka/ruang sirkulasi di tengah pekarangan adalah Natah di Madyaning Madya.",
    verified: true,
  },
  {
    id: "nistaning-madya",
    term: "Nistaning Madya",
    group: "9 Zona",
    short: "Zona tengah cenderung nista di sisi Kauh tengah.",
    why: "Cocok untuk Bale Dauh (ruang tidur anak, ruang tamu, atau ruang kerja).",
    example: "Ruang tidur anak-anak biasanya ditempatkan di zona Nistaning Madya.",
    verified: true,
  },
  {
    id: "utamaning-nista",
    term: "Utamaning Nista",
    group: "9 Zona",
    short: "Zona sudut Kelod-Kangin pekarangan.",
    why: "Sering digunakan untuk Paon (dapur keluarga) karena dekat dengan poros api Dewa Brahma.",
    example: "Dapur tradisional Paon umumnya ditempatkan di zona Utamaning Nista.",
    verified: true,
  },
  {
    id: "madyaning-nista",
    term: "Madyaning Nista",
    group: "9 Zona",
    short: "Zona di sisi Kelod tengah pekarangan.",
    why: "Cocok untuk gudang, ruang servis, atau transisi menuju area belakang rumah.",
    example: "Ruang gudang dan servis biasanya berada di zona Madyaning Nista.",
    verified: true,
  },
  {
    id: "nistaning-nista",
    term: "Nistaning Nista",
    group: "9 Zona",
    short: "Zona sudut Kelod-Kauh; zona paling hilir dan profan dalam pekarangan.",
    why: "Area penempatan kamar mandi, toilet, tempat sampah, kandang hewan, atau saluran pembuangan limbah.",
    verified: true,
  },

  // --- BANGUNAN ---
  {
    id: "natah",
    term: "Natah",
    group: "Bangunan",
    short: "Halaman terbuka tanpa atap di pusat pekarangan (Madyaning Madya).",
    why: "Menjamin pencahayaan alami, sirkulasi udara, ruang resapan air hujan, serta keseimbangan energi rumah.",
    example: "Natah di tengah pekarangan menghubungkan Bale Daja, Bale Dangin, Bale Dauh, dan akses ke Teba.",
    verified: true,
  },
  {
    id: "pemerajan",
    term: "Pemerajan / Sanggah",
    group: "Bangunan",
    short: "Tempat suci pemujaan leluhur dan Hyang Widhi bagi keluarga penghuni rumah.",
    why: "Wajib berada di zona Utamaning Utama (Kaja-Kangin) dan posisinya harus lebih tinggi dari bangunan lain.",
    verified: true,
  },
  {
    id: "bale-daja",
    term: "Bale Daja (Meten)",
    group: "Bangunan",
    short: "Bangunan tempat tidur utama di sisi Kaja pekarangan.",
    why: "Digunakan oleh kepala keluarga atau anak perempuan yang belum menikah, sering dibangun dengan dinding tertutup.",
    example: "Bale Daja untuk tidur kepala keluarga biasanya ditempatkan di sisi Kaja pekarangan.",
    verified: true,
  },
  {
    id: "bale-dangin",
    term: "Bale Dangin",
    group: "Bangunan",
    short: "Bangunan terbuka bertiang di sisi Kangin untuk ritual keagamaan (Manusa Yadnya).",
    why: "Memerlukan orientasi matahari terbit untuk kesucian pelaksanaan upacara siklus hidup.",
    example: "Bale Dangin sering diletakkan di sisi Timur pekarangan menghadap matahari pagi untuk upacara.",
    verified: true,
  },
  {
    id: "bale-dauh",
    term: "Bale Dauh",
    group: "Bangunan",
    short: "Bangunan di sisi Kauh pekarangan untuk ruang tamu atau kamar tidur anggota keluarga laki-laki.",
    why: "Menyeimbangkan zonasi pekarangan di sisi barat menghadap ke Natah.",
    example: "Bale Dauh untuk ruang tamu biasanya diletakkan di sisi Barat pekarangan.",
    verified: true,
  },
  {
    id: "paon",
    term: "Paon",
    group: "Bangunan",
    short: "Dapur tradisional tempat mengolah makanan keluarga.",
    why: "Ditempatkan di sisi Kelod-Kangin (selatan-timur) berkaitan dengan stana Dewa Brahma (unsur api).",
    example: "Dapur Paon diletakkan di sisi Selatan-Timur pekarangan, tepat di bawah sinar matahari langsung.",
    verified: true,
  },
  {
    id: "jineng",
    term: "Jineng (Klumpu)",
    group: "Bangunan",
    short: "Lumbung penyimpanan padi atau hasil bumi dengan ruang santai beratap di bawahnya.",
    why: "Biasanya berdekatan dengan dapur atau area logistik pekarangan.",
    example: "Jineng untuk menyimpan hasil pertanian biasanya diletakkan di zona dengan nilai sedang.",
    verified: true,
  },
  {
    id: "teba",
    term: "Teba",
    group: "Bangunan",
    short: "Halaman belakang di sisi Kelod untuk kebun, kandang ternak, pengolahan kompos, dan sanitasi.",
    why: "Sebagai area penyangga kebersihan dan pembuangan alami sebelum limbah keluar tapak.",
    example: "Area Teba di belakang rumah biasanya untuk kandang ayam atau kebun sayur kecil.",
    verified: true,
  },
  {
    id: "angkul-angkul",
    term: "Angkul-angkul",
    group: "Bangunan",
    short: "Pintu gerbang utama pekarangan rumah tinggal tradisional Bali.",
    why: "Dilengkapi aling-aling (dinding penghalang pandang) sebagai filter privasi dan energi luar pekarangan.",
    example: "Angkul-angkul menjadi gerbang utama yang memisahkan pekarangan rumah dari jalan umum.",
    verified: true,
  },

  // --- PEDOMAN ---
  {
    id: "asta-kosala-kosali",
    term: "Asta Kosala-Kosali",
    group: "Pedoman",
    short: "Naskah lontar pedoman arsitektur tradisional Bali yang mengatur proporsi, anatomi, dan hierarki bangunan.",
    why: "Menjadi acuan standar ukuran antropometris berbasis dimensi tubuh pemilik rumah.",
    example: "Perda Bali No. 5/2005 mengamanatkan penerapan Asta Kosala-Kosali dalam bangunan.",
    verified: true,
  },
  {
    id: "asta-bumi",
    term: "Asta Bumi",
    group: "Pedoman",
    short: "Naskah pedoman tata guna tapak pekarangan, kontur tanah, serta orientasi kosmologis (Kaja-Kelod).",
    why: "Menjadi dasar penentuan zona Sanga Mandala dan kelayakan tapak hunian adat.",
    verified: true,
  },

  // --- UKURAN ---
  {
    id: "hasta",
    term: "Hasta",
    group: "Ukuran",
    short: "Satuan panjang tradisional dari siku tangan hingga ujung jari tengah pemilik rumah (sekitar 40–50 cm).",
    why: "Digunakan sebagai modul dasar proporsi ruang dalam Asta Kosala-Kosali.",
    verified: false,
  },
  {
    id: "depa",
    term: "Depa",
    group: "Ukuran",
    short: "Rentang jarak dari ujung jari tengah tangan kiri ke tangan kanan saat dibentangkan lurus (sekitar 4 Hasta).",
    why: "Ukuran perkiraan adat untuk jarak antar-bangunan atau bentang atap.",
    verified: false,
  },
  {
    id: "musti",
    term: "Musti",
    group: "Ukuran",
    short: "Ukuran kepalan tangan tegak dengan ibu jari terlipat (sekitar 1/4 Hasta).",
    why: "Ukuran perkiraan adat untuk penambahan ornamen atau modul tiang kayu.",
    verified: false,
  },

  // --- ATURAN ---
  {
    id: "perda-bali-5-2005",
    term: "Perda Bali No. 5/2005",
    group: "Aturan",
    short: "Peraturan Daerah Provinsi Bali tentang Persyaratan Arsitektur Bangunan Gedung Berwawasan Budaya Bali.",
    why: "Dasar hukum positif kewajiban penerapan arsitektur tradisional Bali pada bangunan gedung.",
    verified: true,
  },
  {
    id: "pbg",
    term: "PBG",
    group: "Aturan",
    short: "Persetujuan Bangunan Gedung; izin resmi dari pemerintah daerah untuk mendirikan atau mengubah bangunan.",
    why: "Di Bali, pemenuhan kaidah tata ruang adat dan arsitektur lokal menjadi bagian telaah teknis PBG.",
    verified: true,
  },
  {
    id: "kdb",
    term: "KDB",
    group: "Aturan",
    short: "Koefisien Dasar Bangunan: persentase luas lantai dasar bangunan terhadap total luas persil tanah.",
    why: "Di Bali diatur maksimal 60% agar tersisa minimal 40% ruang terbuka hijau dan resapan air (Natah & Teba).",
    verified: true,
  },
];

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  const cleanId = id.toLowerCase().trim();
  return GLOSSARY_TERMS.find(
    (item) => item.id.toLowerCase() === cleanId || item.term.toLowerCase().includes(cleanId)
  );
}
