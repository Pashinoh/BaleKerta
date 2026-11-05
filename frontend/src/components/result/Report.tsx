"use client";

import React, { useEffect } from "react";
import { AuditResponse, Room } from "@/types/audit";
import { cleanLocationLabel } from "@/lib/geo";
import { Printer, X, CheckCircle2, AlertCircle } from "lucide-react";

export interface ReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditResponse | null;
  planNorthDeg?: number;
}

const ZONE_DISPLAY_MAP: Record<string, { title: string; balinese: string; tier: string }> = {
  UTAMANING_UTAMA: { title: "Utamaning Utama", balinese: "Kaja Kangin", tier: "Utama I (Suci)" },
  MADYANING_UTAMA: { title: "Madyaning Utama", balinese: "Kaja", tier: "Utama II" },
  NISTANING_UTAMA: { title: "Nistaning Utama", balinese: "Kaja Kauh", tier: "Utama III" },
  UTAMANING_MADYA: { title: "Utamaning Madya", balinese: "Kangin", tier: "Madya I" },
  MADYANING_MADYA: { title: "Madyaning Madya", balinese: "Tengah (Natah)", tier: "Madya II (Pusat)" },
  NISTANING_MADYA: { title: "Nistaning Madya", balinese: "Kauh", tier: "Madya III" },
  UTAMANING_NISTA: { title: "Utamaning Nista", balinese: "Kelod Kangin", tier: "Nista I" },
  MADYANING_NISTA: { title: "Madyaning Nista", balinese: "Kelod", tier: "Nista II (Lebuh)" },
  NISTANING_NISTA: { title: "Nistaning Nista", balinese: "Kelod Kauh", tier: "Nista III (Teba)" },
};

function formatZoneInfo(zoneId?: string, rawZoneName?: string) {
  if (zoneId && ZONE_DISPLAY_MAP[zoneId]) {
    return ZONE_DISPLAY_MAP[zoneId];
  }
  const clean = (rawZoneName || zoneId || "-").replace(/_/g, " ");
  return { title: clean, balinese: "-", tier: "Madya" };
}

export const Report: React.FC<ReportProps> = ({
  isOpen,
  onClose,
  data,
  planNorthDeg = 0,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const { kaja_vector, audit_report, rooms, grid_layout } = data;
  const isPass = audit_report.compliance_score >= 80;
  const rthPercentage = Math.max(0, Number((100 - audit_report.kdb_percentage).toFixed(1)));
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const docNumber = `BK-PBG/${new Date().getFullYear()}/${Math.abs(
    Math.round(kaja_vector.latitude * 1000)
  )}`;
  const regionLabel = cleanLocationLabel(kaja_vector.location);

  const isRoomViolating = (room: Room): boolean => {
    return audit_report.violations.some((v) => {
      if (v.box && room.box) {
        const [vy1, vx1, vy2, vx2] = v.box;
        const [ry1, rx1, ry2, rx2] = room.box;
        if (vy1 === ry1 && vx1 === rx1 && vy2 === ry2 && vx2 === rx2) return true;
      }
      return v.room_name.toLowerCase() === room.name.toLowerCase();
    });
  };

  const getRoomsInCell = (zoneId: string): Room[] => {
    return rooms.filter((r) => r.zone?.zone_id === zoneId);
  };

  const quadrantLabelMap: Record<string, string> = {
    TOP_RIGHT: "Kanan Atas (Kaja-Kangin)",
    BOTTOM_RIGHT: "Kanan Bawah",
    BOTTOM_LEFT: "Kiri Bawah",
    TOP_LEFT: "Kiri Atas",
  };
  const sacredQuadDisplay =
    quadrantLabelMap[kaja_vector.kaja_quadrant] || kaja_vector.kaja_quadrant.replace(/_/g, " ");

  return (
    <div
      id="printable-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 overflow-y-auto print:static print:p-0 print:bg-white print:block"
    >
      <div
        id="printable-report-card"
        role="dialog"
        aria-modal="true"
        aria-label="Pratinjau Dokumen Pra-Pemeriksaan PBG"
        className="relative w-full max-w-4xl bg-ink-900 border border-ink-800 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none print:bg-white print:block"
      >
        {/* Top Action Bar (Screen Only) */}
        <div className="no-print px-5 py-3 border-b border-ink-800 bg-ink-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-semibold text-bone-100">
              Pratinjau Lembar Evaluasi PBG (1 Halaman A4)
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-ink-900 text-bone-400 border border-ink-800">
              Siap Cetak / Simpan PDF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[36px] px-4 py-1.5 rounded-lg bg-bone-100 text-ink-950 hover:bg-bone-200 font-semibold text-[13px] inline-flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer size={15} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau"
              className="min-w-[36px] min-h-[36px] rounded-lg border border-ink-800 bg-ink-900 text-bone-400 hover:text-bone-100 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SINGLE-PAGE A4 ARCHITECTURAL SHEET                               */}
        {/* ================================================================ */}
        <div
          id="printable-report-scroll"
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-ink-950 print:p-0 print:bg-white print:overflow-visible"
        >
          <div
            id="printable-report-sheet"
            className="mx-auto max-w-[210mm] bg-[#FFFFFF] text-[#18181B] rounded-lg shadow-lg p-6 sm:p-8 space-y-4 font-sans"
          >
            {/* 1. DOCUMENT HEADER (Strict 2-Column Grid so Left & Right never collide) */}
            <div className="grid grid-cols-12 gap-4 items-end pb-3 border-b-2 border-[#18181B]">
              <div className="col-span-8 space-y-0.5">
                <div className="text-[9.5px] font-mono uppercase tracking-widest text-[#52525B] font-bold">
                  BALEKERTA · SISTEM EVALUASI TATA RUANG ADAT BALI
                </div>
                <h1 className="text-[17px] sm:text-[18px] font-bold tracking-tight text-[#18181B] leading-snug">
                  Berita Acara Evaluasi Kepatuhan Sanga Mandala (PBG)
                </h1>
                <p className="text-[10.5px] text-[#52525B] leading-tight">
                  Lampiran Verifikasi Teknis Berdasarkan Perda Provinsi Bali No. 5 Tahun 2005 &amp; Pakem Asta Bumi
                </p>
              </div>

              <div className="col-span-4 text-right font-mono text-[10px] text-[#52525B] space-y-0.5">
                <div className="font-bold text-[#18181B] text-[10.5px]">{docNumber}</div>
                <div>Tanggal: {currentDate}</div>
                <div className="truncate" title={regionLabel}>
                  {regionLabel}
                </div>
              </div>
            </div>

            {/* 2. UNIFIED 2-ROW EXECUTIVE SUMMARY & GEODESIC METADATA */}
            <div className="rounded-lg border border-[#D4D4D8] overflow-hidden print-avoid-break">
              {/* Top Row: 4 Key Verdict Metrics */}
              <div className="grid grid-cols-4 divide-x divide-[#D4D4D8] bg-[#F8FAFC]">
                <div className="p-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#64748B] block">
                    Status Kelayakan
                  </span>
                  <div className="mt-0.5 flex items-center gap-1">
                    {isPass ? (
                      <CheckCircle2 size={13} className="text-[#15803D] shrink-0" />
                    ) : (
                      <AlertCircle size={13} className="text-[#B91C1C] shrink-0" />
                    )}
                    <span
                      className={`text-[12px] font-bold whitespace-nowrap ${
                        isPass ? "text-[#15803D]" : "text-[#B91C1C]"
                      }`}
                    >
                      {isPass ? "LAYAK AJU PBG" : "PERLU REVISI"}
                    </span>
                  </div>
                </div>

                <div className="p-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#64748B] block">
                    Skor Kepatuhan
                  </span>
                  <span className="mt-0.5 text-[14px] font-bold font-mono text-[#0F172A] block tabular-nums">
                    {audit_report.compliance_score}
                    <span className="text-[10.5px] font-normal text-[#64748B]"> / 100</span>
                  </span>
                </div>

                <div className="p-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#64748B] block">
                    KDB &amp; RTH Natah
                  </span>
                  <span className="mt-0.5 text-[12px] font-bold font-mono text-[#0F172A] block tabular-nums">
                    {audit_report.kdb_percentage}%{" "}
                    <span className="text-[10px] font-normal text-[#64748B]">
                      (RTH {rthPercentage}%)
                    </span>
                  </span>
                </div>

                <div className="p-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#64748B] block">
                    Poros Suci Kaja
                  </span>
                  <span className="mt-0.5 text-[12px] font-bold font-mono text-[#0F172A] block truncate">
                    {kaja_vector.bearing_degrees.toFixed(1)}° ({kaja_vector.cardinal_direction.replace(/\s*\([A-Z]+\)/, "")})
                  </span>
                </div>
              </div>

              {/* Bottom Row: 4 Geodesic Site Parameters */}
              <div className="grid grid-cols-4 divide-x divide-[#E4E4E7] border-t border-[#D4D4D8] bg-[#FFFFFF] text-[9.5px] font-mono text-[#52525B]">
                <div className="px-2.5 py-1.5">
                  <span className="text-[#71717A] block text-[8.5px]">Koordinat WGS84</span>
                  <strong className="text-[#18181B]">
                    {kaja_vector.latitude.toFixed(4)}° LS, {kaja_vector.longitude.toFixed(4)}° BT
                  </strong>
                </div>
                <div className="px-2.5 py-1.5">
                  <span className="text-[#71717A] block text-[8.5px]">Jarak ke Gn. Agung</span>
                  <strong className="text-[#18181B]">
                    {kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "-"} (3.142 mdpl)
                  </strong>
                </div>
                <div className="px-2.5 py-1.5">
                  <span className="text-[#71717A] block text-[8.5px]">Sudut Sanggah (Suci)</span>
                  <strong className="text-[#18181B]">{sacredQuadDisplay}</strong>
                </div>
                <div className="px-2.5 py-1.5">
                  <span className="text-[#71717A] block text-[8.5px]">Utara Gambar Denah</span>
                  <strong className="text-[#18181B]">{planNorthDeg}° dari Sisi Atas</strong>
                </div>
              </div>
            </div>

            {/* 3. SIDE-BY-SIDE: ROOM EVALUATION TABLE (7 cols) + 3x3 SANGA MANDALA MATRIX (5 cols) */}
            <div className="grid grid-cols-12 gap-4 items-start print-avoid-break">
              {/* Left 7 Cols: Room Evaluation Table */}
              <div className="col-span-7 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-mono uppercase tracking-wider text-[#3F3F46] font-bold">
                    1. Evaluasi Tata Ruang ({rooms.length} Ruang)
                  </h2>
                  <span className="text-[9px] font-mono text-[#71717A]">
                    Batas KDB Maks: 60%
                  </span>
                </div>

                <div className="border border-[#D4D4D8] rounded-md overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-[#F4F4F5] border-b border-[#D4D4D8] text-[#3F3F46] font-mono text-[9px] uppercase">
                        <th className="py-1.5 px-2 w-7 text-center">No</th>
                        <th className="py-1.5 px-2.5">Nama Ruangan</th>
                        <th className="py-1.5 px-2.5">Zona Sanga Mandala</th>
                        <th className="py-1.5 px-2.5 w-20 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E7]">
                      {rooms.map((room, idx) => {
                        const violating = isRoomViolating(room);
                        const zInfo = formatZoneInfo(room.zone?.zone_id, room.zone?.zone_name);

                        return (
                          <tr key={`${room.name}-${idx}`} className="bg-white">
                            <td className="py-1.5 px-2 text-center font-mono text-[9.5px] text-[#71717A]">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2.5 font-semibold text-[#18181B]">
                              {room.name}
                            </td>
                            <td className="py-1.5 px-2.5 text-[#3F3F46]">
                              <span className="font-medium text-[#18181B]">{zInfo.title}</span>{" "}
                              <span className="text-[9px] text-[#71717A]">({zInfo.balinese})</span>
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono text-[9px]">
                              {violating ? (
                                <span className="inline-block whitespace-nowrap px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] font-bold">
                                  ! Revisi
                                </span>
                              ) : (
                                <span className="inline-block whitespace-nowrap px-1.5 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-bold">
                                  ✓ Sesuai
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 5 Cols: 3x3 Sanga Mandala Matrix */}
              <div className="col-span-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-mono uppercase tracking-wider text-[#3F3F46] font-bold">
                    2. Peta 9 Zona Sanga Mandala (3×3)
                  </h2>
                  <span className="text-[9px] font-mono text-[#71717A]">
                    Kaja: {kaja_vector.bearing_degrees.toFixed(0)}°
                  </span>
                </div>

                {grid_layout?.grid_matrix && grid_layout.grid_matrix.length === 3 && (
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-md border border-[#D4D4D8] bg-[#F8FAFC]">
                    {grid_layout.grid_matrix.map((row, rIdx) =>
                      row.map((zoneId, cIdx) => {
                        const cellRooms = getRoomsInCell(zoneId);
                        const hasViolation = cellRooms.some((r) => isRoomViolating(r));
                        const isUtama = zoneId === "UTAMANING_UTAMA";
                        const zInfo = formatZoneInfo(zoneId);

                        return (
                          <div
                            key={`pdf-cell-${rIdx}-${cIdx}`}
                            className={`p-1.5 rounded border flex flex-col justify-between min-h-[66px] ${
                              hasViolation
                                ? "bg-[#FEF2F2] border-[#FCA5A5]"
                                : isUtama
                                ? "bg-[#FFFFFF] border-[#18181B]"
                                : "bg-[#FFFFFF] border-[#E4E4E7]"
                            }`}
                          >
                            <div className="border-b border-[#E4E4E7] pb-0.5 mb-1">
                              <div className="text-[9px] font-bold text-[#18181B] leading-tight">
                                {zInfo.balinese}
                              </div>
                              <div className="text-[8px] font-mono text-[#71717A] leading-tight">
                                {zInfo.title}
                              </div>
                            </div>
                            <div className="text-[8.5px] text-[#27272A] leading-tight space-y-0.5">
                              {cellRooms.length === 0 ? (
                                <span className="text-[8px] italic text-[#A1A1AA] block">
                                  Kosong
                                </span>
                              ) : (
                                cellRooms.map((rm, i) => (
                                  <div key={i} className="leading-tight">
                                    • {rm.name}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. RECOMMENDATIONS / NOTES (Compact & Structured) */}
            <div className="space-y-1.5 print-avoid-break">
              <h2 className="text-[10px] font-mono uppercase tracking-wider text-[#3F3F46] font-bold">
                3. Catatan Evaluasi &amp; Rekomendasi Teknis ({audit_report.violations.length} Temuan)
              </h2>

              {audit_report.violations.length === 0 ? (
                <div className="p-2.5 rounded-md border border-[#BBF7D0] bg-[#F0FDF4] text-[10px] text-[#166534] leading-snug">
                  <strong>Nir-Pelanggaran Tata Ruang:</strong> Seluruh ruangan telah ditempatkan selaras dengan hierarki kesucian <em>Sanga Mandala</em> (Utama, Madya, Nista) dan memenuhi ketentuan Koefisien Dasar Bangunan (KDB ≤ 60%). Dokumen ini layak dilampirkan sebagai prasyarat teknis pengajuan PBG.
                </div>
              ) : (
                <div className="border border-[#FECACA] rounded-md overflow-hidden divide-y divide-[#FECACA] bg-[#FEF2F2]/60">
                  {audit_report.violations.map((v, i) => (
                    <div key={v.id || i} className="px-3 py-1.5 text-[9.5px] leading-snug">
                      <div className="font-bold text-[#991B1B]">
                        {i + 1}. {v.room_name} (Zona {v.zone_name.replace(/_/g, " ")})
                      </div>
                      <div className="text-[#3F3F46]">{v.issue}</div>
                      <div className="text-[#18181B] font-semibold">
                        Rekomendasi: {v.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. LEGAL FOOTER & SIGNATURES */}
            <div className="pt-3 border-t border-[#D4D4D8] grid grid-cols-12 gap-4 items-end text-[9px] text-[#52525B] print-avoid-break">
              <div className="col-span-7 space-y-0.5 leading-snug">
                <div className="font-bold text-[#18181B]">Dasar Hukum &amp; Rujukan Normatif:</div>
                <div>1. Perda Provinsi Bali No. 5 Tahun 2005 tentang Persyaratan Arsitektur Bangunan Gedung.</div>
                <div>2. UU No. 28 Tahun 2002 jo. PP No. 16 Tahun 2021 tentang Persetujuan Bangunan Gedung (PBG).</div>
                <div>3. Lontar Asta Kosala-Kosali &amp; Asta Bumi (Kaidah Kosmologi Sanga Mandala).</div>
              </div>

              <div className="col-span-5 grid grid-cols-2 gap-4 font-mono text-[9px] text-center">
                <div>
                  <div className="text-[#71717A] mb-7">Pemohon / Arsitek</div>
                  <div className="border-t border-[#71717A] pt-1 font-semibold text-[#18181B]">
                    Tanda Tangan &amp; Nama
                  </div>
                </div>
                <div>
                  <div className="text-[#71717A] mb-7">Pemeriksa Teknis PBG</div>
                  <div className="border-t border-[#71717A] pt-1 font-semibold text-[#18181B]">
                    Verifikasi TABG
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
