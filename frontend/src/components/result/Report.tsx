"use client";

import React, { useEffect, useMemo } from "react";
import { AuditResponse } from "@/types/audit";
import {
  Printer,
  X,
  ShieldCheck,
  Compass,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Grid3X3,
} from "lucide-react";
import { Button } from "../ui/Button";
import { sacredCornerLabel } from "../map/MiniZoneGrid";

export interface ReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditResponse | null;
  planNorthDeg?: number;
}

const ROOM_TYPE_READABLE: Record<string, string> = {
  pemerajan_sanggah: "Pemerajan / Sanggah (Suci)",
  natah_open_space: "Natah (Halaman Tengah)",
  taman: "Taman / Ruang Terbuka Hijau",
  bale_daja: "Bale Daja / Kamar Utama",
  bale_dangin: "Bale Dangin (Upacara)",
  bale_dauh: "Bale Dauh / Ruang Kerja",
  kamar_tidur: "Kamar Tidur Hunian",
  dapur_paon: "Paon (Dapur)",
  toilet: "Kamar Mandi / Sanitasi",
  angkul_angkul_pintu: "Angkul-Angkul (Gerbang)",
  ruang_tamu: "Bale / Ruang Keluarga",
  garasi: "Garasi / Area Parkir",
};

const ZONE_HIERARCHY_LABEL: Record<string, string> = {
  UTAMANING_UTAMA: "Utama (Sakral Tertinggi)",
  MADYANING_UTAMA: "Utama (Luhur)",
  NISTANING_UTAMA: "Utama-Madya",
  UTAMANING_MADYA: "Madya (Adat & Sosial)",
  MADYANING_MADYA: "Madya (Pusat Natah)",
  NISTANING_MADYA: "Madya (Hunian)",
  UTAMANING_NISTA: "Nista-Utama (Dapur/Api)",
  MADYANING_NISTA: "Nista (Servis)",
  NISTANING_NISTA: "Nista (Teba / Sanitasi)",
};

export const Report: React.FC<ReportProps> = ({
  isOpen,
  onClose,
  data,
  planNorthDeg = 0,
}) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const docFilename = `BaleKerta_Laporan_Inspeksi_${dateStr}`;
  const docNumber = `BK-PBG/${yyyy}${mm}${dd}/001`;

  useEffect(() => {
    if (!isOpen) return;
    const originalTitle = document.title;
    document.title = docFilename;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.title = originalTitle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, docFilename, onClose]);

  const sacredCorner = useMemo(() => {
    const q = data?.kaja_vector?.kaja_quadrant || "TOP_RIGHT";
    const c = sacredCornerLabel(q, planNorthDeg);
    const map: Record<string, { label: string; row: number; col: number }> = {
      "kanan-atas": { label: "Sudut Kanan Atas", row: 0, col: 2 },
      "kanan-bawah": { label: "Sudut Kanan Bawah", row: 2, col: 2 },
      "kiri-bawah": { label: "Sudut Kiri Bawah", row: 2, col: 0 },
      "kiri-atas": { label: "Sudut Kiri Atas", row: 0, col: 0 },
    };
    return map[c] || { label: "Sudut Kanan Atas", row: 0, col: 2 };
  }, [data?.kaja_vector?.kaja_quadrant, planNorthDeg]);

  if (!isOpen || !data) return null;

  const { audit_report, kaja_vector, rooms, grid_layout } = data;
  const isPass = audit_report.compliance_score >= 80;
  const rthPercentage = Math.max(0, +(100 - audit_report.kdb_percentage).toFixed(1));

  const isRoomViolated = (roomName: string, box?: [number, number, number, number]) => {
    return audit_report.violations.some(
      (v) =>
        v.room_name.toLowerCase() === roomName.toLowerCase() ||
        (v.box &&
          box &&
          v.box[0] === box[0] &&
          v.box[1] === box[1] &&
          v.box[2] === box[2] &&
          v.box[3] === box[3])
    );
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = docFilename;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  };

  return (
    <div
      id="printable-report-wrapper"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-5"
    >
      {/* Modal Container */}
      <div
        id="printable-report-card"
        className="relative w-full max-w-5xl bg-ink-900 border border-ink-700 rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* Top Action Toolbar (Hidden when printing) */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-ink-700 bg-ink-950 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-700 flex items-center justify-center text-bone-100 shrink-0">
              <ShieldCheck size={17} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="report-modal-title"
                className="text-[14.5px] sm:text-[15.5px] font-bold text-bone-100 leading-tight"
              >
                Pratinjau Dokumen Pra-Pemeriksaan PBG (Siap Cetak A4)
              </h2>
              <p className="text-[11.5px] font-mono text-bone-400">
                Nama Berkas: {docFilename}.pdf
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={15} />}
            >
              Cetak / Simpan PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau laporan"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-bone-400 hover:text-bone-100 hover:bg-ink-850 rounded-lg border border-ink-700 transition-colors"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Viewport holding the A4 Architectural Paper Sheet */}
        <div
          id="printable-report-body"
          className="p-3 sm:p-6 overflow-y-auto bg-ink-950"
        >
          {/* A4 Paper Sheet: Crisp Warm-White Architectural Paper both on screen and in print */}
          <div
            id="printable-report-sheet"
            className="mx-auto max-w-[210mm] bg-[#FDFBF7] text-[#181614] border border-[#D4CBB8] rounded-lg shadow-xl p-5 sm:p-8 space-y-4 print:space-y-3 font-sans"
          >
            {/* ============================================================ */}
            {/* KOP DOKUMEN RESMI PRA-PEMERIKSAAN ARSITEKTUR ADAT BALI        */}
            {/* ============================================================ */}
            <div className="border-b-2 border-[#181614] pb-3 print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#5C5349]">
                    <span>PROVINSI BALI &middot; TELAAH MANDIRI PRA-SIDANG TABG</span>
                  </div>
                  <h1 className="text-[18px] sm:text-[20px] print:text-[16px] font-bold tracking-tight text-[#181614] uppercase leading-tight">
                    BaleKerta: Lembar Pra-Inspeksi Tata Ruang Adat Bali
                  </h1>
                  <p className="text-[11.5px] print:text-[10px] font-medium text-[#423B34] leading-snug">
                    Verifikasi Kepatuhan Spasial Asta Kosala-Kosali, Asta Bumi &amp; Perda Provinsi Bali No. 5 Tahun 2005
                  </p>
                </div>

                {/* Metadata Box */}
                <div className="shrink-0 bg-[#F4EFE4] border border-[#CFC4B0] rounded-md px-3 py-2 text-[10px] print:text-[8.5px] font-mono space-y-0.5 sm:text-right">
                  <div className="font-bold text-[#181614]">NO. DOKUMEN: {docNumber}</div>
                  <div className="text-[#423B34]">
                    Tanggal:{" "}
                    {now.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-[#5C5349]">
                    Wilayah: {kaja_vector.location || "Pulau Bali"}
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SEKSI 1: RINGKASAN EKSEKUTIF & 4 METRIK UTAMA                */}
            {/* ============================================================ */}
            <div className="space-y-2.5 print-avoid-break">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F4EFE4] border border-[#CFC4B0] rounded-md px-3.5 py-2">
                <div className="flex items-center gap-2">
                  {isPass ? (
                    <CheckCircle2 size={16} className="text-[#1F5E3B] shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle size={16} className="text-[#B84322] shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-[11.5px] print:text-[10px] font-bold uppercase tracking-wider text-[#181614]">
                    1. Kesimpulan Kelayakan Tata Ruang Adat
                  </span>
                </div>
                <span
                  className={`text-[10.5px] print:text-[9px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
                    isPass
                      ? "bg-[#E6F2EA] text-[#184D2F] border-[#8AB89E]"
                      : "bg-[#FCEBE6] text-[#9C3416] border-[#D98268]"
                  }`}
                >
                  {isPass
                    ? "MEMENUHI KEPATUHAN ADAT (LAYAK PBG)"
                    : `PERLU PENYESUAIAN RUANG (${audit_report.violations.length} TEMUAN)`}
                </span>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:gap-2 font-mono">
                <div className="p-2.5 print:p-2 bg-[#FAF6EE] border border-[#CFC4B0] rounded-md">
                  <span className="text-[9.5px] print:text-[8px] text-[#5C5349] uppercase block">
                    Skor Kepatuhan Adat
                  </span>
                  <span className="text-[17px] print:text-[14px] font-bold text-[#181614] block mt-0.5">
                    {audit_report.compliance_score} / 100
                  </span>
                  <span className="text-[9px] print:text-[7.5px] text-[#5C5349] block">
                    Ambang Lulus: &ge; 80 Poin
                  </span>
                </div>

                <div className="p-2.5 print:p-2 bg-[#FAF6EE] border border-[#CFC4B0] rounded-md">
                  <span className="text-[9.5px] print:text-[8px] text-[#5C5349] uppercase block">
                    Luas Terbangun (KDB)
                  </span>
                  <span className="text-[17px] print:text-[14px] font-bold text-[#181614] block mt-0.5">
                    {audit_report.kdb_percentage}%
                  </span>
                  <span className="text-[9px] print:text-[7.5px] text-[#5C5349] block">
                    Batas Maks. 60.0% (Ps. 12)
                  </span>
                </div>

                <div className="p-2.5 print:p-2 bg-[#FAF6EE] border border-[#CFC4B0] rounded-md">
                  <span className="text-[9.5px] print:text-[8px] text-[#5C5349] uppercase block">
                    Ruang Terbuka Hijau
                  </span>
                  <span className="text-[17px] print:text-[14px] font-bold text-[#181614] block mt-0.5">
                    {rthPercentage}%
                  </span>
                  <span className="text-[9px] print:text-[7.5px] text-[#5C5349] block">
                    Natah &amp; Resapan Air
                  </span>
                </div>

                <div className="p-2.5 print:p-2 bg-[#FAF6EE] border border-[#CFC4B0] rounded-md">
                  <span className="text-[9.5px] print:text-[8px] text-[#5C5349] uppercase block">
                    Ruangan Terdeteksi
                  </span>
                  <span className="text-[17px] print:text-[14px] font-bold text-[#181614] block mt-0.5">
                    {rooms.length} Ruang
                  </span>
                  <span className="text-[9px] print:text-[7.5px] text-[#5C5349] block">
                    {audit_report.violations.length === 0
                      ? "Nir-Pelanggaran Spasial"
                      : `${audit_report.violations.length} Catatan Perbaikan`}
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SEKSI 2: DIAGRAM MATRIKS SANGA MANDALA 3x3 & PARAMETER TAPAK */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 print:gap-2.5 print-avoid-break">
              {/* Left (5 cols): Visual 3x3 Sanga Mandala Spatial Grid */}
              <div className="sm:col-span-5 p-3 print:p-2.5 bg-[#FAF6EE] border border-[#CFC4B0] rounded-md flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-[#DED5C3] pb-1.5">
                  <span className="text-[10.5px] print:text-[9px] font-bold uppercase tracking-wider text-[#181614] flex items-center gap-1.5">
                    <Grid3X3 size={12} aria-hidden="true" />
                    <span>2A. Peta Kisi 9 Zona Sanga Mandala</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#5C5349]">
                    Utara: {planNorthDeg}&deg;
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-[#EFE8DA] p-1.5 rounded border border-[#CFC4B0]">
                  {[0, 1, 2].map((r) =>
                    [0, 1, 2].map((c) => {
                      const cell = grid_layout?.cells?.find(
                        (item) => item.row === r && item.col === c
                      );
                      const zoneId = cell?.zone_id || "";
                      const isSacred = r === sacredCorner.row && c === sacredCorner.col;
                      const isCenter = r === 1 && c === 1;
                      const isTeba =
                        r === 2 - sacredCorner.row && c === 2 - sacredCorner.col;

                      // Find rooms mapped to this zone
                      const cellRooms = rooms.filter(
                        (rm) => rm.zone?.row === r && rm.zone?.col === c
                      );

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`p-1.5 rounded border text-center flex flex-col justify-between min-h-[54px] print:min-h-[44px] ${
                            isSacred
                              ? "bg-[#181614] text-[#FAF6EE] border-[#181614]"
                              : isCenter
                              ? "bg-[#FDFBF7] text-[#181614] border-[#8F826D]"
                              : isTeba
                              ? "bg-[#FCEBE6] text-[#9C3416] border-[#D98268]"
                              : "bg-[#FAF6EE] text-[#2E2924] border-[#CFC4B0]"
                          }`}
                        >
                          <div className="text-[8.5px] print:text-[7.5px] font-mono font-bold uppercase leading-tight">
                            {isSacred
                              ? "Utamaning Utama"
                              : isCenter
                              ? "Madyaning Madya"
                              : zoneId
                              ? zoneId.replace(/_/g, " ")
                              : `Sel (${r + 1},${c + 1})`}
                          </div>
                          <div className="text-[8px] print:text-[7px] leading-tight mt-1 font-medium line-clamp-2">
                            {cellRooms.length > 0
                              ? cellRooms.map((rm) => rm.name).join(", ")
                              : isSacred
                              ? "(Area Suci)"
                              : isCenter
                              ? "(Natah)"
                              : "-"}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="text-[9.5px] print:text-[8px] text-[#423B34] font-mono flex items-center justify-between pt-0.5">
                  <span className="flex items-center gap-1">
                    <Landmark size={11} aria-hidden="true" />
                    <span>Area Suci: <strong>{sacredCorner.label}</strong></span>
                  </span>
                  <span>Pusat: <strong>Natah (Halaman)</strong></span>
                </div>
              </div>

              {/* Right (7 cols): Technical Geodesic, KDB & Score Ledger */}
              <div className="sm:col-span-7 p-3 print:p-2.5 bg-[#FAF6EE] border border-[#CFC4B0] rounded-md flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-[#DED5C3] pb-1.5">
                  <span className="text-[10.5px] print:text-[9px] font-bold uppercase tracking-wider text-[#181614] flex items-center gap-1.5">
                    <Compass size={12} aria-hidden="true" />
                    <span>2B. Parameter Geodesik Tapak &amp; Perhitungan Sistem</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#5C5349]">
                    Datum WGS84
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] print:text-[8.5px] font-mono">
                  <div className="p-2 bg-[#FDFBF7] border border-[#DED5C3] rounded space-y-1">
                    <div className="font-bold text-[#181614] border-b border-[#EAE2D3] pb-0.5">
                      Vektor Geodesik Arah Kaja
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Koordinat Tapak:</span>
                      <span className="font-semibold text-[#181614]">
                        {kaja_vector.latitude.toFixed(4)}&deg;, {kaja_vector.longitude.toFixed(4)}&deg;
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Titik Acuan Suci:</span>
                      <span className="text-[#181614]">Gn. Agung (3.142 mdpl)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Sudut Azimuth Kaja:</span>
                      <span className="font-bold text-[#181614]">
                        {kaja_vector.bearing_degrees.toFixed(1)}&deg; ({kaja_vector.cardinal_direction})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Jarak Geodesik:</span>
                      <span className="text-[#181614]">
                        {kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "Terpetakan"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#FDFBF7] border border-[#DED5C3] rounded space-y-1">
                    <div className="font-bold text-[#181614] border-b border-[#EAE2D3] pb-0.5">
                      Evaluasi KDB &amp; Bobot Nilai
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Rasio KDB Terbangun:</span>
                      <span className="font-semibold text-[#181614]">
                        {audit_report.kdb_percentage}% (Maks. 60%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Area Terbuka / Natah:</span>
                      <span className="text-[#181614]">{rthPercentage}% (Min. 40%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Nilai Dasar Awal:</span>
                      <span className="text-[#181614]">100 Poin</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C5349]">Potongan Penalti:</span>
                      <span className={100 - audit_report.compliance_score > 0 ? "text-[#9C3416] font-bold" : "text-[#184D2F] font-semibold"}>
                        {100 - audit_report.compliance_score > 0
                          ? `-${100 - audit_report.compliance_score} Poin`
                          : "0 Poin (Nir-Penalti)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Official PBG Note */}
                <div className="p-2 bg-[#F4EFE4] border border-[#CFC4B0] rounded text-[9.5px] print:text-[8px] text-[#423B34] leading-snug">
                  <strong>Keterangan Teknis:</strong> Sudut Kaja dihitung menggunakan trigonometri bola bumi (Forward Azimuth) dari titik koordinat persil menuju puncak Gunung Agung, lalu diproyeksikan ke matriks 9 zona Sanga Mandala sesuai arah utara gambar denah.
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SEKSI 3: TABEL INVENTARISASI & EVALUASI ZONA RUANGAN         */}
            {/* ============================================================ */}
            <div className="space-y-1.5 print-avoid-break">
              <div className="flex items-center justify-between border-b border-[#181614] pb-1">
                <h3 className="text-[11.5px] print:text-[9.5px] font-bold uppercase tracking-wider text-[#181614]">
                  3. Tabel Inventarisasi &amp; Evaluasi Zona Ruangan ({rooms.length} Ruang)
                </h3>
                <span className="text-[9.5px] print:text-[8px] font-mono text-[#5C5349]">
                  Pemetaan Poligon &amp; Centroid Sanga Mandala
                </span>
              </div>

              <div className="overflow-x-auto border border-[#CFC4B0] rounded-md">
                <table className="w-full text-left text-[10.5px] print:text-[8.5px]">
                  <thead className="bg-[#EFE8DA] border-b border-[#CFC4B0] text-[#181614] font-mono">
                    <tr>
                      <th className="py-1.5 px-2.5 w-9 text-center font-bold">No</th>
                      <th className="py-1.5 px-2.5 font-bold">Nama Ruangan pada Denah</th>
                      <th className="py-1.5 px-2.5 font-bold">Klasifikasi Fungsi Adat</th>
                      <th className="py-1.5 px-2.5 font-bold">Zona Sanga Mandala</th>
                      <th className="py-1.5 px-2.5 font-bold">Derajat Nilai Ruang</th>
                      <th className="py-1.5 px-2.5 text-center font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DED5C3] bg-[#FDFBF7]">
                    {rooms.map((r, i) => {
                      const violated = isRoomViolated(r.name, r.box);
                      const zoneId = r.zone?.zone_id || "";
                      return (
                        <tr
                          key={`${r.name}-${i}`}
                          className={violated ? "bg-[#FCEBE6]/60" : ""}
                        >
                          <td className="py-1.5 px-2.5 text-center font-mono text-[#5C5349]">
                            {i + 1}
                          </td>
                          <td className="py-1.5 px-2.5 font-semibold text-[#181614]">
                            {r.name}
                          </td>
                          <td className="py-1.5 px-2.5 text-[#423B34]">
                            {ROOM_TYPE_READABLE[r.type] || r.type.replace(/_/g, " ")}
                          </td>
                          <td className="py-1.5 px-2.5 font-mono text-[#181614] font-medium">
                            {r.zone?.zone_name || zoneId.replace(/_/g, " ") || "Terpetakan"}
                          </td>
                          <td className="py-1.5 px-2.5 text-[#423B34]">
                            {ZONE_HIERARCHY_LABEL[zoneId] || "Zona Pekarangan"}
                          </td>
                          <td className="py-1.5 px-2.5 text-center font-mono">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9px] print:text-[7.5px] font-bold uppercase border ${
                                violated
                                  ? "bg-[#FCEBE6] text-[#9C3416] border-[#D98268]"
                                  : "bg-[#E6F2EA] text-[#184D2F] border-[#8AB89E]"
                              }`}
                            >
                              {violated ? "Pelanggaran" : "Sesuai Adat"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SEKSI 4: CATATAN PENYESUAIAN TATA RUANG & REKOMENDASI        */}
            {/* ============================================================ */}
            <div className="space-y-1.5 print-avoid-break">
              <h3 className="text-[11.5px] print:text-[9.5px] font-bold uppercase tracking-wider border-b border-[#181614] pb-1 text-[#181614]">
                4. Rincian Temuan &amp; Rekomendasi Teknis Penyesuaian Ruang ({audit_report.violations.length})
              </h3>

              {audit_report.violations.length === 0 ? (
                <div className="p-3 print:p-2 border border-[#8AB89E] rounded-md bg-[#E6F2EA]/60 text-[10.5px] print:text-[8.5px] text-[#184D2F] flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="shrink-0" aria-hidden="true" />
                  <span>
                    <strong>Nir-Pelanggaran Spasial:</strong> Seluruh penempatan ruangan pada denah telah mematuhi hierarki kesucian Sanga Mandala, pemeliharaan Natah terbuka, dan batas Koefisien Dasar Bangunan (KDB &le; 60%).
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 text-[10.5px] print:text-[8.5px]">
                  {audit_report.violations.map((v, i) => (
                    <div
                      key={v.id || i}
                      className="p-2.5 print:p-2 border border-[#D98268] rounded-md bg-[#FCEBE6]/45 space-y-1 print-avoid-break"
                    >
                      <div className="font-bold text-[#9C3416] flex items-center justify-between gap-2 text-[11px] print:text-[9px]">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
                          <span>
                            {i + 1}. {v.room_name} ({v.zone_name})
                          </span>
                        </span>
                        <span className="font-mono text-[9.5px] print:text-[8px] px-1.5 py-0.5 rounded bg-[#FCEBE6] border border-[#D98268]">
                          Kode: {v.rule_id}
                        </span>
                      </div>
                      <p className="text-[#181614] pl-5 leading-snug">
                        <strong>Temuan:</strong> {v.issue}
                      </p>
                      <p className="text-[#423B34] pl-5 leading-snug">
                        <strong>Rekomendasi Perbaikan:</strong> {v.recommendation}
                        {v.legal_reference && (
                          <span className="font-mono text-[#5C5349] ml-1.5">
                            [Rujukan: {v.legal_reference}]
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* SEKSI 5: LANDASAN HUKUM & PENGESAHAN DOKUMEN                 */}
            {/* ============================================================ */}
            <div className="space-y-2.5 print-avoid-break pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9.5px] print:text-[8px]">
                <div className="p-2 bg-[#FAF6EE] border border-[#CFC4B0] rounded">
                  <span className="font-bold text-[#181614] font-mono block mb-0.5">
                    Perda Provinsi Bali No. 5 Tahun 2005
                  </span>
                  <p className="text-[#423B34] leading-snug">
                    <strong>Ps. 5 &amp; 8:</strong> Falsafah Tri Hita Karana &amp; Tri Angga &middot;{" "}
                    <strong>Ps. 9:</strong> Orientasi Sumbu Kaja-Kelod &amp; Sanga Mandala &middot;{" "}
                    <strong>Ps. 12:</strong> KDB Maksimal 60% &middot;{" "}
                    <strong>Ps. 14:</strong> Penyediaan Pemerajan di Kaja-Kangin.
                  </p>
                </div>

                <div className="p-2 bg-[#FAF6EE] border border-[#CFC4B0] rounded">
                  <span className="font-bold text-[#181614] font-mono block mb-0.5">
                    UU No. 28/2002 jo. PP No. 16/2021 &amp; Lontar Adat
                  </span>
                  <p className="text-[#423B34] leading-snug">
                    <strong>PP 16/2021 Ps. 187:</strong> Pemeriksaan teknis TABG untuk PBG &middot;{" "}
                    <strong>Asta Kosala-Kosali &amp; Asta Bumi:</strong> Hirarki kesucian Bale Daja, pemeliharaan Natah tengah, dan penempatan sanitasi di Teba.
                  </p>
                </div>
              </div>

              {/* Signature & Disclaimer Footer */}
              <div className="pt-2.5 border-t-2 border-[#181614] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-[10px] print:text-[8.5px] text-[#423B34]">
                <div className="space-y-0.5 max-w-md">
                  <p className="font-bold text-[#181614] text-[11.5px] print:text-[9.5px]">
                    BaleKerta Cultural Spatial Engine
                  </p>
                  <p className="text-[9px] print:text-[7.5px] text-[#5C5349] leading-tight">
                    Dokumen ini merupakan lembar pra-pemeriksaan teknis mandiri untuk membantu penyusunan berkas sebelum sidang Tim Ahli Bangunan Gedung (TABG), bukan pengganti sertifikat resmi PBG Dinas PUPR.
                  </p>
                </div>

                <div className="sm:text-right shrink-0 space-y-1">
                  <p className="text-[#5C5349]">Diperiksa &amp; Diverifikasi oleh:</p>
                  <div className="h-7 print:h-5" />
                  <p className="font-mono font-bold text-[#181614] border-t border-[#8F826D] pt-1">
                    ( Arsitek Perancang / Pemohon PBG )
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
