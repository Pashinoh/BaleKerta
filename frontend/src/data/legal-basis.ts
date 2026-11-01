export interface LegalArticle {
  article: string;
  topic: string;
  text: string;
  implication: string;
}

export interface LegalRegulation {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  articles: LegalArticle[];
}

export const LEGAL_REGULATIONS: LegalRegulation[] = [
  {
    id: "perda-bali-5-2005",
    title: "Peraturan Daerah Provinsi Bali No. 5 Tahun 2005",
    subtitle: "Tentang Persyaratan Arsitektur Bangunan Gedung di Provinsi Bali",
    badge: "Regulasi Daerah Utama",
    articles: [
      {
        article: "Pasal 5",
        topic: "Falsafah Tri Hita Karana",
        text: "Setiap perencanaan, perancangan, dan pelaksanaan arsitektur bangunan gedung di Bali wajib berlandaskan filosofi Tri Hita Karana, yaitu memelihara keharmonisan hubungan manusia dengan Sang Pencipta (Parahyangan), sesama manusia (Pawongan), dan alam lingkungan (Palemahan).",
        implication:
          "Audit BaleKerta memastikan seluruh denah menyediakan zona spiritual (Parahyangan), ruang hunian keluarga (Pawongan), serta ruang terbuka hijau pekarangan (Palemahan).",
      },
      {
        article: "Pasal 8",
        topic: "Konsepsi Hierarki Tri Angga",
        text: "Penataan ruang bangunan dan pekarangan harus mengikuti konsep Tri Angga, yang membagi hierarki nilai ruang menjadi Utama (sakral/luhur), Madya (hunian/kegiatan sosial), dan Nista (pelayanan/pembuangan/hilir).",
        implication:
          "Sistem memetakan setiap ruangan ke salah satu dari 9 zona Sanga Mandala untuk memverifikasi kesesuaian derajat kesucian.",
      },
      {
        article: "Pasal 9",
        topic: "Orientasi Kosmologis & Sumbu Kaja-Kelod",
        text: "Orientasi tata letak pekarangan wajib berpedoman pada sumbu suci Kaja-Kelod (Gunung Agung sebagai poros spiritual hulu dan Laut sebagai poros hilir) serta Kangin-Kauh (Matahari Terbit dan Terbenam) yang membentuk sistem perintisan 9 petak Sanga Mandala.",
        implication:
          "Sistem BaleKerta menghitung vektor geodesik riil ke puncak Gunung Agung secara dinamis sesuai letak tapak tanah di Pulau Bali.",
      },
      {
        article: "Pasal 12",
        topic: "Koefisien Dasar Bangunan (KDB Maksimal 60%)",
        text: "Koefisien Dasar Bangunan (KDB) untuk pekarangan hunian diatur maksimal 60% dari luas tapak, guna menjamin tersedianya ruang terbuka hijau, resapan air alami, dan pelestarian halaman tengah (Natah).",
        implication:
          "Engine menghitung rasio luas kotak bangunan terhadap tapak untuk memastikan ruang terbuka hijau Natah tidak tertutup beton melebihi batas 60%.",
      },
      {
        article: "Pasal 14",
        topic: "Kewajiban Penyediaan Tempat Suci Pekarangan",
        text: "Setiap tapak pekarangan hunian masyarakat adat Bali wajib menyediakan fasilitas tempat persembahyangan keluarga (Pemerajan/Sanggah) pada kuadran Utamaning Utama (Kaja-Kangin).",
        implication:
          "Ketiadaan atau penempatan tempat suci di luar zona Utamaning Utama dikenai catatan penyesuaian wajib sebelum pengajuan PBG.",
      },
    ],
  },
  {
    id: "uu-28-2002-pp-16-2021",
    title: "UU No. 28 Tahun 2002 jo. PP No. 16 Tahun 2021",
    subtitle: "Tentang Bangunan Gedung dan Standar Persetujuan Bangunan Gedung (PBG)",
    badge: "Undang-Undang Nasional",
    articles: [
      {
        article: "Pasal 13 UU No. 28/2002",
        topic: "Persyaratan Tata Bangunan & Arsitektur Lokal",
        text: "Persyaratan arsitektur bangunan gedung meliputi persyaratan penampilan bangunan gedung, tata ruang dalam, keseimbangan, keserasian, dan keselarasan dengan lingkungannya, serta mempertimbangkan nilai-nilai sosial budaya dan kearifan lokal setempat.",
        implication:
          "Pemeriksaan adat Asta Kosala-Kosali merupakan instrumen formal perlindungan kearifan lokal yang diamanatkan undang-undang nasional.",
      },
      {
        article: "Pasal 187 PP No. 16/2021",
        topic: "Penilaian Tim Ahli Bangunan Gedung (TABG)",
        text: "Pemeriksaan dokumen rencana teknis permohonan PBG dilakukan oleh Tim Ahli Bangunan Gedung (TABG) untuk menilai pemenuhan standar teknis arsitektur, struktur, dan keselarasan lingkungan adat.",
        implication:
          "Laporan pra-pemeriksaan BaleKerta dirancang sebagai lembar telaah mandiri pra-sidang TABG guna mempercepat persetujuan izin gedung.",
      },
    ],
  },
  {
    id: "lontar-asta-kosala-kosali",
    title: "Naskah Lontar Asta Kosala-Kosali & Asta Bumi",
    subtitle: "Kanon Arsitektur Tradisional dan Kosmologi Pekarangan Bali",
    badge: "Naskah Adat Klasik",
    articles: [
      {
        article: "Lontar Asta Kosala-Kosali",
        topic: "Tata Penempatan Bangunan Hunian",
        text: "Mengatur bahwa Bale Daja (Gedong Meten) untuk ruang tidur kepala keluarga diletakkan di sisi Kaja; Bale Dangin untuk ruang upacara di sisi Kangin; Bale Dauh untuk ruang kerja/istirahat anak di sisi Kauh; Paon (dapur) di sisi Kelod-Kangin; serta melarang ruang tidur di zona pembuangan/kandang ternak (Teba).",
        implication:
          "Memvalidasi peletakan kamar tidur utama agar tidak berada di zona hilir (Teba/Nistaning Nista).",
      },
      {
        article: "Lontar Asta Bumi",
        topic: "Pemurnian Tapak & Pemeliharaan Natah",
        text: "Menetapkan pedoman perputaran sudut hadap suci berdasarkan posisi gunung suci (Kaja) serta mewajibkan pemeliharaan Natah (halaman terbuka di Madyaning Madya) sebagai titik keseimbangan Akasa (langit) dan Pertiwi (bumi).",
        implication:
          "Memastikan titik pusat denah (Natah) tidak tertutup struktur masif agar energi dan sirkulasi alami pekarangan tetap mengalir seimbang.",
      },
    ],
  },
];
