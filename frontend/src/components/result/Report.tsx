"use client";

import React, { useEffect } from "react";
import { AuditResponse, Room } from "@/types/audit";
import { Printer, X, CheckCircle2, AlertCircle } from "lucide-react";

export interface ReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditResponse | null;
  planNorthDeg?: number;
}

const ZONE_DISPLAY_MAP: Record<string, { title: string; balinese: string; tier: string }> = {
  UTAMANING_UTAMA: { title: "Utamaning Utama", balinese: "Kaja Kangin (Suci)", tier: "Utama" },
  MADYANING_UTAMA: { title: "Madyaning Utama", balinese: "Kaja (Bale Daja)", tier: "Utama" },
  NISTANING_UTAMA: { title: "Nistaning Utama", balinese: "Kaja Kauh", tier: "Utama" },
  UTAMANING_MADYA: { title: "Utamaning Madya", balinese: "Kangin (Bale Dangin)", tier: "Madya" },
  MADYANING_MADYA: { title: "Madyaning Madya", balinese: "Tengah (Natah)", tier: "Madya" },
  NISTANING_MADYA: { title: "Nistaning Madya", balinese: "Kauh (Bale Dauh)", tier: "Madya" },
  UTAMANING_NISTA: { title: "Utamaning Nista", balinese: "Kelod Kangin", tier: "Nista" },
  MADYANING_NISTA: { title: "Madyaning Nista", balinese: "Kelod (Lebuh)", tier: "Nista" },
  NISTANING_NISTA: { title: "Nistaning Nista", balinese: "Kelod Kauh (Teba)", tier: "Nista" },
};

function formatZoneInfo(zoneId?: string, rawZoneName?: string) {
  if (zoneId && ZONE_DISPLAY_MAP[zoneId]) {
    return ZONE_DISPLAY_MAP[zoneId];
  }
  const clean = (rawZoneName || zoneId || "-").replace(/_/g, " ");
  return { title: clean, balinese: "", tier: "Madya" };
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
        <div className="no-print px-5 py-3.5 border-b border-ink-800 bg-ink-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-semibold text-bone-100">
              Pratinjau Lembar Evaluasi PBG (Standar A4)
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-ink-900 text-bone-400 border border-ink-800">
              1 Halaman A4 Bersih
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[38px] px-4 py-1.5 rounded-lg bg-bone-100 text-ink-950 hover:bg-bone-200 font-semibold text-[13px] inline-flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer size={15} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau"
              className="min-w-[38px] min-h-[38px] rounded-lg border border-ink-800 bg-ink-900 text-bone-400 hover:text-bone-100 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CLEAN A4 ARCHITECTURAL SHEET                                     */}
        {/* ================================================================ */}
        <div
          id="printable-report-scroll"
          className="flex-1 overflow-y-auto p-4 sm:p-7 bg-ink-950 print:p-0 print:bg-white print:overflow-visible"
        >
          <div
            id="printable-report-sheet"
            className="mx-auto max-w-[210mm] bg-[#FFFFFF] text-[#18181B] rounded-lg shadow-lg p-7 sm:p-9 space-y-5 print:shadow-none print:rounded-none print:p-0 print:max-w-none font-sans"
          >
            {/* 1. DOCUMENT HEADER (Uses div so @media print never hides it) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b-2 border-[#18181B]">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#52525B] font-semibold">
                  BALEKERTA · PRA-PEMERIKSAAN TATA RUANG ADAT BALI
                </div>
                <h1 className="text-[19px] sm:text-[21px] font-bold tracking-tight text-[#18181B]">
                  Berita Acara Evaluasi Kepatuhan Sanga Mandala (PBG)
                </h1>
                <p className="text-[11.5px] text-[#52525B]">
                  Lampiran Verifikasi Teknis Berdasarkan Perda Provinsi Bali No. 5 Tahun 2005 &amp; Pakem Asta Bumi
                </p>
              </div>

              <div className="sm:text-right font-mono text-[10.5px] text-[#52525B] space-y-0.5 shrink-0">
                <div className="font-bold text-[#18181B] text-[11px]">{docNumber}</div>
                <div>Tanggal: {currentDate}</div>
                <div>Wilayah: {kaja_vector.location || "Provinsi Bali"}</div>
              </div>
            </div>

            {/* 2. EXECUTIVE SUMMARY STRIP (4 Clean Columns) */}
            <div className="grid grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] print-avoid-break">
              <div>
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#64748B] block">
                  Status Kelayakan
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {isPass ? (
                    <CheckCircle2 size={14} className="text-[#15803D] shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="text-[#B91C1C] shrink-0" />
                  )}
                  <span
                    className={`text-[12.5px] font-bold ${
                      isPass ? "text-[#15803D]" : "text-[#B91C1C]"
                    }`}
                  >
                    {isPass ? "LAYAK AJU PBG" : "PERLU REVISI"}
                  </span>
                </div>
              </div>

              <div className="border-l border-[#E2E8F0] pl-3">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#64748B] block">
                  Skor Kepatuhan
                </span>
                <span className="mt-0.5 text-[16px] font-bold font-mono text-[#0F172A] block tabular-nums">
                  {audit_report.compliance_score}
                  <span className="text-[11px] font-normal text-[#64748B]"> / 100</span>
                </span>
              </div>

              <div className="border-l border-[#E2E8F0] pl-3">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#64748B] block">
                  KDB &amp; RTH Natah
                </span>
                <span className="mt-0.5 text-[13px] font-bold font-mono text-[#0F172A] block tabular-nums">
                  {audit_report.kdb_percentage}%{" "}
                  <span className="text-[10.5px] font-normal text-[#64748B]">
                    (RTH {rthPercentage}%)
                  </span>
                </span>
              </div>

              <div className="border-l border-[#E2E8F0] pl-3">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#64748B] block">
                  Poros Suci Kaja
                </span>
                <span className="mt-0.5 text-[12.5px] font-bold font-mono text-[#0F172A] block">
                  {kaja_vector.bearing_degrees.toFixed(1)}° ({kaja_vector.cardinal_direction.replace(/\s*\([A-Z]+\)/, "")})
                </span>
              </div>
            </div>

            {/* 3. SITE METADATA BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 rounded bg-[#FAFAFA] border border-[#E4E4E7] text-[10.5px] font-mono text-[#52525B] print-avoid-break">
              <div>
                <span className="text-[#71717A] block text-[9.5px]">Koordinat WGS84</span>
                <strong className="text-[#18181B]">
                  {kaja_vector.latitude.toFixed(4)}° LS, {kaja_vector.longitude.toFixed(4)}° BT
                </strong>
              </div>
              <div>
                <span className="text-[#71717A] block text-[9.5px]">Jarak ke Gn. Agung</span>
                <strong className="text-[#18181B]">
                  {kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "-"} (3.142 mdpl)
                </strong>
              </div>
              <div>
                <span className="text-[#71717A] block text-[9.5px]">Sudut Sanggah (Suci)</span>
                <strong className="text-[#18181B]">{sacredQuadDisplay}</strong>
              </div>
              <div>
                <span className="text-[#71717A] block text-[9.5px]">Orientasi Utara Gambar</span>
                <strong className="text-[#18181B]">{planNorthDeg}° dari Sisi Atas</strong>
              </div>
            </div>

            {/* 4. FULL-WIDTH ROOM EVALUATION TABLE */}
            <div className="space-y-1.5 print-avoid-break">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#52525B] font-bold">
                  1. Tabel Evaluasi Tata Ruang ({rooms.length} Ruangan Terdeteksi)
                </h2>
                <span className="text-[10px] font-mono text-[#71717A]">
                  Ambang KDB Maksimal: 60%
                </span>
              </div>

              <div className="border border-[#D4D4D8] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#F4F4F5] border-b border-[#D4D4D8] text-[#3F3F46] font-mono text-[9.5px] uppercase">
                      <th className="py-2 px-3 w-9 text-center">No</th>
                      <th className="py-2 px-3">Nama Ruangan / Paviliun</th>
                      <th className="py-2 px-3">Zona Sanga Mandala</th>
                      <th className="py-2 px-3">Arah &amp; Kedudukan</th>
                      <th className="py-2 px-3 w-24 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7]">
                    {rooms.map((room, idx) => {
                      const violating = isRoomViolating(room);
                      const zInfo = formatZoneInfo(room.zone?.zone_id, room.zone?.zone_name);

                      return (
                        <tr key={`${room.name}-${idx}`} className="bg-white">
                          <td className="py-1.5 px-3 text-center font-mono text-[10px] text-[#71717A]">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 font-semibold text-[#18181B]">
                            {room.name}
                          </td>
                          <td className="py-1.5 px-3 font-medium text-[#27272A]">
                            {zInfo.title}
                          </td>
                          <td className="py-1.5 px-3 text-[#52525B] text-[10.5px]">
                            {zInfo.balinese || `Derajat ${zInfo.tier}`}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-[9.5px]">
                            {violating ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] font-bold">
                                Perlu Revisi
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-bold">
                                Sesuai Adat
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

            {/* 5. FULL-WIDTH 3x3 SANGA MANDALA SPATIAL MATRIX */}
            {grid_layout?.grid_matrix && grid_layout.grid_matrix.length === 3 && (
              <div className="space-y-1.5 print-avoid-break">
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#52525B] font-bold">
                  2. Pemetaan Matriks 9 Zona Sanga Mandala (3×3)
                </h2>

                <div className="grid grid-cols-3 gap-2">
                  {grid_layout.grid_matrix.map((row, rIdx) =>
                    row.map((zoneId, cIdx) => {
                      const cellRooms = getRoomsInCell(zoneId);
                      const hasViolation = cellRooms.some((r) => isRoomViolating(r));
                      const isUtama = zoneId === "UTAMANING_UTAMA";
                      const zInfo = formatZoneInfo(zoneId);

                      return (
                        <div
                          key={`pdf-cell-${rIdx}-${cIdx}`}
                          className={`p-2.5 rounded-md border flex flex-col justify-between min-h-[54px] ${
                            hasViolation
                              ? "bg-[#FEF2F2] border-[#FCA5A5]"
                              : isUtama
                              ? "bg-[#F8FAFC] border-[#18181B]"
                              : "bg-[#FAFAFA] border-[#E4E4E7]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 border-b border-[#E4E4E7] pb-1 mb-1">
                            <span className="text-[10px] font-bold text-[#18181B]">
                              {zInfo.title}
                            </span>
                            <span className="text-[9px] font-mono text-[#71717A]">
                              {zInfo.balinese.split(" ")[0]}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#3F3F46] leading-snug">
                            {cellRooms.length === 0 ? (
                              <span className="text-[9.5px] italic text-[#A1A1AA]">
                                Area Terbuka / Kosong
                              </span>
                            ) : (
                              cellRooms.map((rm) => rm.name).join(", ")
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 6. RECOMMENDATIONS / NOTES */}
            <div className="space-y-1.5 print-avoid-break">
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#52525B] font-bold">
                3. Catatan Evaluasi &amp; Rekomendasi Teknis
              </h2>

              {audit_report.violations.length === 0 ? (
                <div className="p-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] text-[11px] text-[#166534] leading-relaxed">
                  <strong>Nir-Pelanggaran Tata Ruang:</strong> Seluruh ruangan telah ditempatkan selaras dengan hierarki kesucian <em>Sanga Mandala</em> (Utama, Madya, Nista) dan memenuhi ketentuan Koefisien Dasar Bangunan (KDB ≤ 60%). Dokumen ini layak dilampirkan sebagai prasyarat teknis pengajuan PBG.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {audit_report.violations.map((v, i) => (
                    <div
                      key={v.id || i}
                      className="p-2.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[10.5px] space-y-0.5"
                    >
                      <div className="font-bold text-[#991B1B]">
                        {i + 1}. {v.room_name} · Zona {v.zone_name}
                      </div>
                      <p className="text-[#3F3F46]">{v.issue}</p>
                      <p className="text-[#18181B] font-semibold">
                        Saran Perbaikan: {v.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. LEGAL FOOTER & SIGNATURES (Uses div so @media print never hides it) */}
            <div className="pt-4 border-t border-[#D4D4D8] flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-[10px] text-[#52525B] print-avoid-break">
              <div className="space-y-0.5 max-w-md leading-relaxed">
                <div className="font-bold text-[#18181B]">Dasar Hukum &amp; Rujukan Normatif:</div>
                <p>
                  1. Perda Provinsi Bali No. 5 Tahun 2005 tentang Persyaratan Arsitektur Bangunan Gedung.
                  <br />
                  2. UU No. 28 Tahun 2002 jo. PP No. 16 Tahun 2021 tentang Persetujuan Bangunan Gedung (PBG).
                  <br />
                  3. Lontar Asta Kosala-Kosali &amp; Asta Bumi (Kaidah Kosmologi Sanga Mandala).
                </p>
              </div>

              <div className="flex items-end gap-8 shrink-0 font-mono text-[9.5px] text-center">
                <div className="w-36">
                  <div className="text-[#71717A] mb-9">Pemohon / Arsitek</div>
                  <div className="border-t border-[#71717A] pt-1 font-semibold text-[#18181B]">
                    Tanda Tangan &amp; Nama
                  </div>
                </div>
                <div className="w-36">
                  <div className="text-[#71717A] mb-9">Pemeriksa Teknis PBG</div>
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
