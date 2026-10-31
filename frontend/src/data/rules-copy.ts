export interface RuleCopy {
  ruleId: string;
  title: string;
  meaning: string;
  fix: string;
  termId?: string;
  legalBasisVerified: boolean;
  legalBasisText?: string;
}

export const RULES_COPY: Record<string, RuleCopy> = {
  TOILET_IN_SACRED: {
    ruleId: "TOILET_IN_SACRED",
    title: "Toilet/Sanitasi Berada di Zona Paling Suci",
    meaning:
      "Dalam kosmologi Asta Bumi, sudut Kaja-Kangin (Utamaning Utama) merupakan area kesucian tertinggi tempat stana pemujaan Hyang Widhi dan leluhur. Fasilitas sanitasi, toilet, atau septic tank di zona ini bertentangan dengan prinsip kesucian tapak.",
    fix: "Pindahkan toilet atau kamar mandi ke sudut Kelod-Kauh (Nistaning Nista / Teba) yang merupakan area hilir pekarangan.",
    termId: "utamaning-utama",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Bumi & Asta Kosala-Kosali: Zona Utamaning Utama khusus dialokasikan untuk pemujaan dan dilarang difungsikan untuk kegiatan pembuangan kotoran/limbah.",
  },
  TOILET_IN_TEBA_OK: {
    ruleId: "TOILET_IN_TEBA_OK",
    title: "Penempatan Toilet Sesuai di Zona Teba",
    meaning:
      "Kamar mandi dan fasilitas sanitasi diletakkan di sudut Kelod-Kauh (Nistaning Nista). Penempatan ini menjaga zona suci tetap bersih dari polusi udara dan limbah.",
    fix: "Pertahankan posisi ini pada rancangan pelaksanaan bangunan.",
    termId: "nistaning-nista",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Bumi: Sudut hilir pekarangan (Kelod-Kauh) adalah zona yang tepat untuk sanitasi, kandang, dan pembuangan alami pekarangan.",
  },
  PEMERAJAN_OK: {
    ruleId: "PEMERAJAN_OK",
    title: "Tempat Persembahyangan Sesuai di Sudut Kaja-Kangin",
    meaning:
      "Pemerajan atau Sanggah diletakkan tepat pada zona Utamaning Utama (Kaja-Kangin) yang menghadap langsung ke arah Gunung Agung dan poros matahari terbit.",
    fix: "Pastikan elevasi lantai Pemerajan dirancang lebih tinggi dari bangunan hunian lainnya.",
    termId: "pemerajan",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Bumi & Perda Bali No. 5/2005: Tempat persembahyangan keluarga wajib berada pada sudut Kaja-Kangin (Utamaning Utama).",
  },
  PEMERAJAN_IN_PROFANE: {
    ruleId: "PEMERAJAN_IN_PROFANE",
    title: "Tempat Suci Berada di Zona Hilir/Profan",
    meaning:
      "Pemerajan/Sanggah terdeteksi berada di sisi Kelod (hilir/nista). Penempatan ini tidak memuliakan tempat pemujaan keluarga.",
    fix: "Relokasi tempat persembahyangan ke sudut Kaja-Kangin (Utamaning Utama) denah.",
    termId: "pemerajan",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Bumi: Sanggah Pemerajan wajib berada di kuadran Kaja-Kangin, tidak boleh berada di area Kelod.",
  },
  PEMERAJAN_OFF_CORNER: {
    ruleId: "PEMERAJAN_OFF_CORNER",
    title: "Tempat Suci Belum Tepat di Sudut Kaja-Kangin",
    meaning:
      "Pemerajan berada di zona penyangga, namun belum tepat berada pada titik puncak sudut Utamaning Utama.",
    fix: "Geser posisi altar atau tempat sembahyang lebih mendekat ke pojok Kaja-Kangin pekarangan.",
    termId: "pemerajan",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Kosala-Kosali: Penempatan tempat suci diutamakan pada sudut persilangan Kaja dan Kangin.",
  },
  NO_PEMERAJAN: {
    ruleId: "NO_PEMERAJAN",
    title: "Tempat Ibadah Keluarga (Pemerajan) Belum Disediakan",
    meaning:
      "Denah hunian tidak memiliki area persembahyangan keluarga (Pemerajan/Sanggah). Setiap pekarangan hunian di Bali diwajibkan menyediakan ruang sakral keluarga.",
    fix: "Sediakan minimal satu area tempat persembahyangan keluarga pada sudut Utamaning Utama denah.",
    termId: "pemerajan",
    legalBasisVerified: true,
    legalBasisText:
      "Perda Bali No. 5/2005 Pasal 14 & Pedoman Asta Bumi: Pekarangan hunian wajib menyediakan tempat persembahyangan keluarga.",
  },
  KITCHEN_IN_SACRED: {
    ruleId: "KITCHEN_IN_SACRED",
    title: "Dapur (Paon) Diletakkan di Zona Suci",
    meaning:
      "Dapur berada di sisi Kaja/Utama pekarangan. Asap dan aktivitas pengolahan makanan masif dapat mengganggu ketenangan area suci.",
    fix: "Pindahkan Paon (dapur) ke zona Kelod-Kangin (Utamaning Nista) atau sisi selatan pekarangan.",
    termId: "paon",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Kosala-Kosali: Paon diletakkan di sisi tenggara/selatan berkaitan dengan pemuliaan stana Dewa Brahma (unsur api).",
  },
  KITCHEN_OK: {
    ruleId: "KITCHEN_OK",
    title: "Dapur (Paon) Sesuai di Sisi Selatan",
    meaning:
      "Dapur diletakkan di zona Kelod-Kangin / selatan pekarangan, selaras dengan stana Dewa Brahma sebagai poros energi api.",
    fix: "Pertahankan tata letak ini.",
    termId: "paon",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Kosala-Kosali: Penataan Paon di sisi selatan/tenggara mencerminkan keselarasan fungsi ruang tradisi.",
  },
  NATAH_OK: {
    ruleId: "NATAH_OK",
    title: "Natah Terbuka Terpelihara di Pusat Denah",
    meaning:
      "Zona tengah pekarangan (Madyaning Madya) dibiarkan menjadi halaman terbuka tanpa atap penutup. Ini menjamin sirkulasi udara, pencahayaan alami, dan resapan air hujan.",
    fix: "Pertahankan Natah sebagai ruang terbuka hijau.",
    termId: "natah",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Bumi: Natah merupakan pusat orientasi dan ruang keseimbangan mikrokosmos pekarangan rumah Bali.",
  },
  NATAH_BLOCKED: {
    ruleId: "NATAH_BLOCKED",
    title: "Zona Pusat Natah Tertutup Bangunan Masif",
    meaning:
      "Zona tengah pekarangan (Madyaning Madya) tertutup oleh ruangan beratap masif (kamar/ruang tamu/toilet). Hal ini menghilangkan fungsi Natah sebagai paru-paru pekarangan.",
    fix: "Buka area tengah pekarangan sebagai taman terbuka atau teras tanpa atap masif.",
    termId: "natah",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Asta Bumi: Natah wajib dibiarkan terbuka sebagai ruang hijau, sirkulasi udara alami, dan poros keseimbangan pekarangan.",
  },
  KDB_EXCEEDED: {
    ruleId: "KDB_EXCEEDED",
    title: "Perkiraan Luas Bangunan Melebihi Ambang Batas 60%",
    meaning:
      "Perkiraan luas kotak ruangan melebihi 60% luas bidang tapak, menyisakan ruang terbuka hijau kurang dari 40%.",
    fix: "Kurangi luas tertutup bangunan atau perbanyak area taman terbuka (Natah dan Teba) agar resapan air optimal.",
    termId: "kdb",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Penataan Ruang Bali: Koefisien Dasar Bangunan (KDB) hunian dianjurkan maksimal 60% untuk menjaga resapan air tanah.",
  },
  KDB_OK: {
    ruleId: "KDB_OK",
    title: "Koefisien Dasar Bangunan (KDB) Memenuhi Syarat",
    meaning:
      "Luas tertutup bangunan berada di bawah 60%, sehingga pekarangan memiliki ruang terbuka hijau minimal 40%.",
    fix: "Pertahankan proporsi ruang terbuka hijau.",
    termId: "kdb",
    legalBasisVerified: true,
    legalBasisText:
      "Pedoman Penataan Ruang Bali: KDB hunian maksimal 60% terpenuhi.",
  },
};

export function getRuleCopy(ruleId?: string): RuleCopy | undefined {
  if (!ruleId) return undefined;
  return RULES_COPY[ruleId];
}
