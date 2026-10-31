"use client";

import React, { useState } from "react";
import PlanCanvas from "@/components/PlanCanvas";
import { Room, Violation, GridLayout } from "@/types/audit";
import { 
  Building2, 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  AlertTriangle,
  Layers
} from "lucide-react";

// Preset Demo Offline Data for Instant Preview
const LOCAL_PRESETS = [
  {
    id: "preset_1_pass",
    title: "Pola Adat Ideal (Sanga Mandala)",
    regency: "gianyar",
    badge: "100% Layak PBG",
    badgeColor: "emerald",
    kaja_bearing: 55.95,
    kaja_direction: "Timur Laut (NE)",
    regency_name: "Gianyar",
    rooms: [
      { name: "Sanggah Pemerajan Keluarga", type: "pemerajan_sanggah", box: [50, 700, 240, 940] },
      { name: "Bale Daja (Gedong Meten)", type: "bale_daja", box: [60, 360, 260, 640] },
      { name: "Bale Dangin (Upacara Yadnya)", type: "bale_dangin", box: [360, 700, 620, 940] },
      { name: "Natah (Halaman Terbuka)", type: "natah_open_space", box: [350, 360, 650, 640] },
      { name: "Bale Dauh (Kamar Anak)", type: "bale_dauh", box: [360, 60, 620, 320] },
      { name: "Paon Tradisional (Dapur)", type: "dapur_paon", box: [700, 370, 920, 640] },
      { name: "Kamar Mandi / Toilet Teba", type: "toilet", box: [720, 70, 920, 300] },
      { name: "Angkul-angkul (Pintu Masuk)", type: "angkul_angkul_pintu", box: [850, 720, 980, 880] }
    ] as Room[],
    violations: [] as Violation[]
  },
  {
    id: "preset_2_toilet_violation",
    title: "Rumah Modern (Toilet di Zona Suci)",
    regency: "badung",
    badge: "Melanggar Perda",
    badgeColor: "red",
    kaja_bearing: 43.12,
    kaja_direction: "Timur Laut (NE)",
    regency_name: "Badung",
    rooms: [
      { name: "Kamar Mandi Utama (Ensuite)", type: "toilet", box: [50, 700, 260, 950] },
      { name: "Kamar Tidur Utama", type: "kamar_tidur", box: [60, 340, 320, 650] },
      { name: "Ruang Tamu & Foyer", type: "ruang_tamu", box: [360, 680, 620, 940] },
      { name: "Living Room / Lounge", type: "ruang_keluarga", box: [350, 350, 640, 650] },
      { name: "Kamar Tidur Anak", type: "kamar_tidur", box: [360, 60, 600, 320] },
      { name: "Dapur Bersih", type: "dapur_paon", box: [700, 680, 920, 930] },
      { name: "Garasi Mobil", type: "garasi", box: [720, 60, 950, 320] }
    ] as Room[],
    violations: [
      {
        id: "viol_1",
        room_name: "Kamar Mandi Utama (Ensuite)",
        room_type: "toilet",
        box: [50, 700, 260, 950],
        zone_id: "UTAMANING_UTAMA",
        zone_name: "Utamaning Utama (Kaja-Kangin)",
        severity: "CRITICAL",
        issue: "Toilet ditempatkan di sudut suci Utamaning Utama",
        recommendation: "Pindahkan toilet ke sudut Kelod-Kauh (Teba) agar tidak menodai kesucian pekarangan.",
        legal_reference: "Perda Bali No. 5/2005 Pasal 14 ayat (2): Utilitas sanitasi dilarang keras menempati zona suci."
      },
      {
        id: "viol_2",
        room_name: "Pemerajan / Sanggah",
        room_type: "missing_facility",
        box: [0, 667, 333, 1000],
        zone_id: "UTAMANING_UTAMA",
        zone_name: "Utamaning Utama",
        severity: "CRITICAL",
        issue: "Tidak ada alokasi tempat persembahyangan keluarga pada denah",
        recommendation: "Sediakan minimal 1 petak area terbuka/pelinggih di kuadran Kaja-Kangin.",
        legal_reference: "Perda Bali No. 5/2005 Pasal 14 ayat (1): Setiap hunian wajib menyediakan tempat pemujaan keluarga."
      }
    ] as Violation[]
  },
  {
    id: "preset_3_villa_overbuild",
    title: "Vila Canggu (Over-KDB & Natah Ditutup)",
    regency: "buleleng",
    badge: "Rotasi Bali Utara (Kaja di Selatan)",
    badgeColor: "amber",
    kaja_bearing: 119.19,
    kaja_direction: "Tenggara (ESE)",
    regency_name: "Buleleng",
    rooms: [
      { name: "Sanggah Sudut", type: "pemerajan_sanggah", box: [720, 700, 940, 940] },
      { name: "Dapur & Bar Lounge", type: "dapur_paon", box: [50, 340, 300, 680] },
      { name: "Suite Room 1", type: "kamar_tidur", box: [320, 670, 640, 950] },
      { name: "Enclosed Living Hall (Menutup Natah)", type: "ruang_tamu", box: [320, 330, 650, 660] },
      { name: "Suite Room 2", type: "kamar_tidur", box: [320, 50, 640, 320] },
      { name: "Suite Room 3", type: "kamar_tidur", box: [70, 70, 300, 320] }
    ] as Room[],
    violations: [
      {
        id: "viol_3",
        room_name: "Enclosed Living Hall (Menutup Natah)",
        room_type: "ruang_tamu",
        box: [320, 330, 650, 660],
        zone_id: "MADYANING_MADYA",
        zone_name: "Madyaning Madya (Natah)",
        severity: "WARNING",
        issue: "Bangunan masif tertutup menutupi area sakral Natah",
        recommendation: "Biarkan pekarangan tengah terbuka tanpa atap sebagai ruang sirkulasi udara dan tata hijau.",
        legal_reference: "Perda Bali No. 5/2005 Pasal 16 ayat (1): Natah wajib dibiarkan terbuka."
      }
    ] as Violation[]
  }
];

// 9-Grid Sanga Mandala Generator for Visualizer
function createSampleGrid(quadrant: string): GridLayout {
  let matrix = [
    ["NISTANING_UTAMA", "MADYANING_UTAMA", "UTAMANING_UTAMA"],
    ["NISTANING_MADYA", "MADYANING_MADYA", "UTAMANING_MADYA"],
    ["NISTANING_NISTA", "MADYANING_NISTA", "UTAMANING_NISTA"]
  ];

  if (quadrant === "BOTTOM_RIGHT") {
    matrix = [
      ["NISTANING_NISTA", "MADYANING_NISTA", "UTAMANING_NISTA"],
      ["NISTANING_MADYA", "MADYANING_MADYA", "UTAMANING_MADYA"],
      ["NISTANING_UTAMA", "MADYANING_UTAMA", "UTAMANING_UTAMA"]
    ];
  }

  const bounds = [(0), (333), (666), (1000)];
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push({
        row: r,
        col: c,
        zone_id: matrix[r][c],
        box: [bounds[r], bounds[c], bounds[r + 1], bounds[c + 1]] as [number, number, number, number],
        center: [(bounds[r] + bounds[r + 1]) / 2, (bounds[c] + bounds[c + 1]) / 2] as [number, number]
      });
    }
  }

  return {
    kaja_quadrant: quadrant,
    grid_matrix: matrix,
    cells
  };
}

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState("preset_2_toilet_violation");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const activePreset = LOCAL_PRESETS.find((p) => p.id === selectedPresetId) || LOCAL_PRESETS[1];
  const gridLayout = createSampleGrid(activePreset.regency === "buleleng" ? "BOTTOM_RIGHT" : "TOP_RIGHT");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">BaleKerta</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  AI ARCHITECTURAL AUDIT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pemeriksa Kepatuhan Asta Kosala-Kosali & Perda Bali No. 5/2005
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Bali DigiFest 2026</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-300 font-medium">Solver for Bali</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Preset Selector Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Uji Coba Cepat Preset Denah (Verifikasi Tahap 2)</span>
            </div>
            <span className="text-xs text-slate-400">
              Pilih denah sampel untuk melihat rendering kanvas & deteksi pelanggaran
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LOCAL_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setSelectedRoom(null);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{preset.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        preset.badgeColor === "emerald"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : preset.badgeColor === "red"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    Lokasi: {preset.regency_name} | {preset.rooms.length} Ruangan
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visualizer & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Canvas Viewport (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <PlanCanvas
              gridLayout={gridLayout}
              rooms={activePreset.rooms}
              violations={activePreset.violations}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              kajaBearing={activePreset.kaja_bearing}
              kajaDirection={activePreset.kaja_direction}
              regencyName={activePreset.regency_name}
            />

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Pembuktian Azimuth Bali Utara vs Bali Selatan</span>
              </div>
              <p>
                Perhatikan bagaimana saat memilih <strong>Vila Canggu (Buleleng)</strong>, posisi 
                zona suci (<strong>Utamaning Utama</strong>) berotasi secara otomatis ke 
                <strong> Pojok Kanan Bawah</strong> karena Gunung Agung berada di arah Selatan/Tenggara dari Singaraja.
              </p>
            </div>
          </div>

          {/* Right Column: Inspection Info & Violations (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Status Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Status Kepatuhan Audit
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    activePreset.violations.length === 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {activePreset.violations.length === 0 ? "LAYAK PBG" : "TERDAPAT PELANGGARAN"}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span
                  className={`text-4xl font-black ${
                    activePreset.violations.length === 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {activePreset.violations.length === 0 ? "100" : "45"}
                </span>
                <span className="text-sm text-slate-400 font-medium">/ 100 Skor Kepatuhan</span>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activePreset.violations.length === 0 ? "bg-emerald-500 w-full" : "bg-red-500 w-[45%]"
                  }`}
                />
              </div>

              {/* Violations List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Daftar Peringatan Regulasi ({activePreset.violations.length})
                </span>

                {activePreset.violations.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-200">
                      Semua tata letak ruangan mematuhi pakem Asta Bumi, Asta Kosala-Kosali, dan Perda No. 5/2005.
                    </p>
                  </div>
                ) : (
                  activePreset.violations.map((viol) => (
                    <div
                      key={viol.id}
                      className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          {viol.room_name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                          {viol.severity}
                        </span>
                      </div>
                      <p className="text-slate-300">{viol.issue}</p>
                      <div className="p-2 rounded bg-slate-950/60 border border-red-500/20 text-[11px] text-red-200/90 italic">
                        ⚖️ {viol.legal_reference}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selected Room Inspector */}
            {selectedRoom && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 animate-fade-in">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Ruangan Terpilih: {selectedRoom.name}
                </span>
                <p className="text-slate-300">
                  Tipe: <code className="text-amber-200">{selectedRoom.type}</code> | Koordinat Box:{" "}
                  <code>[{selectedRoom.box.join(", ")}]</code>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
