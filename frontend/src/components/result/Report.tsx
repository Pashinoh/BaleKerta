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

  return (
    <div
      id="printable-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 overflow-y-auto print:static print:p-0 print:bg-white print:block"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pratinjau Dokumen Pra-Pemeriksaan PBG"
        className="relative w-full max-w-4xl bg-ink-900 border border-ink-800 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none print:bg-white print:block"
      >
        {/* Top Action Bar (Screen Only) */}
        <div className="p-4 border-b border-ink-800 bg-ink-950 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-semibold text-bone-100">
              Pratinjau Lembar Evaluasi PBG (A4)
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-ink-900 text-bone-400 border border-ink-800">
              Siap Cetak / Simpan PDF
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-ink-950 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-report-sheet"
            className="mx-auto max-w-[210mm] bg-[#FFFFFF] text-[#18181B] rounded-lg shadow-lg p-7 sm:p-10 space-y-6 print:shadow-none print:rounded-none print:p-0 print:max-w-none font-sans"
          >
            {/* 1. DOCUMENT HEADER */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E4E4E7]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] font-semibold">
                    BALEKERTA · SISTEM EVALUASI TATA RUANG ADAT BALI
                  </span>
                </div>
                <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#18181B]">
                  Lembar Pra-Pemeriksaan Kepatuhan Sanga Mandala
                </h1>
                <p className="text-[12px] text-[#52525B]">
                  Lampiran Teknis Persetujuan Bangunan Gedung (PBG) Berdasarkan Perda Prov. Bali No. 5 Tahun 2005
                </p>
              </div>

              <div className="sm:text-right font-mono text-[11px] text-[#52525B] space-y-0.5 shrink-0">
                <div className="font-semibold text-[#18181B]">{docNumber}</div>
                <div>Tanggal: {currentDate}</div>
                <div>{kaja_vector.location || "Wilayah Provinsi Bali"}</div>
              </div>
            </header>

            {/* 2. EXECUTIVE SUMMARY STRIP (4 Clean Columns) */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                  Status Kelayakan
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {isPass ? (
                    <CheckCircle2 size={15} className="text-[#15803D] shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="text-[#B91C1C] shrink-0" />
                  )}
                  <span
                    className={`text-[13px] font-bold ${
                      isPass ? "text-[#15803D]" : "text-[#B91C1C]"
                    }`}
                  >
                    {isPass ? "LAYAK AJU PBG" : "PERLU REVISI"}
                  </span>
                </div>
              </div>

              <div className="sm:border-l sm:border-[#E4E4E7] sm:pl-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                  Skor Kepatuhan
                </span>
                <span className="mt-0.5 text-[18px] font-bold font-mono text-[#18181B] block tabular-nums">
                  {audit_report.compliance_score}
                  <span className="text-[12px] font-normal text-[#71717A]"> / 100</span>
                </span>
              </div>

              <div className="sm:border-l sm:border-[#E4E4E7] sm:pl-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                  KDB &amp; Ruang Terbuka
                </span>
                <span className="mt-0.5 text-[14px] font-bold font-mono text-[#18181B] block tabular-nums">
                  {audit_report.kdb_percentage}%{" "}
                  <span className="text-[11px] font-normal text-[#71717A]">
                    (RTH {rthPercentage}%)
                  </span>
                </span>
              </div>

              <div className="sm:border-l sm:border-[#E4E4E7] sm:pl-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                  Poros Suci Kaja
                </span>
                <span className="mt-0.5 text-[13px] font-bold font-mono text-[#18181B] block">
                  {kaja_vector.bearing_degrees.toFixed(1)}° ({kaja_vector.cardinal_direction.replace(/\s*\([A-Z]+\)/, "")})
                </span>
              </div>
            </section>

            {/* 3. SITE METADATA LINE */}
            <section className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#52525B] px-1">
              <span>
                <strong className="text-[#18181B]">Koordinat Tapak:</strong>{" "}
                {kaja_vector.latitude.toFixed(4)}° LS, {kaja_vector.longitude.toFixed(4)}° BT
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#18181B]">Jarak ke Gn. Agung:</strong>{" "}
                {kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "-"}
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#18181B]">Kuadran Sanggah:</strong>{" "}
                {kaja_vector.kaja_quadrant.replace(/_/g, " ")}
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#18181B]">Utara Denah:</strong> {planNorthDeg}°
              </span>
            </section>

            {/* 4. ROOM EVALUATION TABLE & COMPACT 3x3 MATRIX */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6 print:grid-cols-12 items-start">
              {/* Left 8 Cols: Clean Room Evaluation Table */}
              <div className="md:col-span-8 print:col-span-8 space-y-2">
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] font-semibold">
                  1. Daftar Evaluasi Tata Ruang ({rooms.length} Ruangan)
                </h2>

                <div className="border border-[#E4E4E7] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11.5px]">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#52525B] font-mono text-[10px] uppercase">
                        <th className="py-2 px-3 w-8 text-center">No</th>
                        <th className="py-2 px-3">Ruangan</th>
                        <th className="py-2 px-3">Zona Sanga Mandala</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E7]">
                      {rooms.map((room, idx) => {
                        const violating = isRoomViolating(room);
                        const zoneName = room.zone?.zone_name?.split(" (")[0] || room.zone?.zone_id?.replace(/_/g, " ") || "-";
                        const zoneLevel = (room.zone?.zone_id || "").includes("UTAMA")
                          ? "Utama"
                          : (room.zone?.zone_id || "").includes("MADYA")
                          ? "Madya"
                          : "Nista";

                        return (
                          <tr key={`${room.name}-${idx}`} className="bg-white">
                            <td className="py-2 px-3 text-center font-mono text-[10.5px] text-[#71717A]">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 font-medium text-[#18181B]">
                              {room.name}
                            </td>
                            <td className="py-2 px-3 text-[#52525B]">
                              <span className="font-medium text-[#18181B]">{zoneName}</span>
                              <span className="text-[10.5px] text-[#71717A] ml-1.5">
                                ({zoneLevel})
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[10px]">
                              {violating ? (
                                <span className="inline-block px-2 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] font-semibold">
                                  Revisi
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-semibold">
                                  Sesuai
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

              {/* Right 4 Cols: Clean 3x3 Sanga Mandala Diagram */}
              <div className="md:col-span-4 print:col-span-4 space-y-2">
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] font-semibold">
                  2. Peta 9 Zona Sanga Mandala
                </h2>

                {grid_layout?.grid_matrix && grid_layout.grid_matrix.length === 3 && (
                  <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA]">
                    {grid_layout.grid_matrix.map((row, rIdx) =>
                      row.map((zoneId, cIdx) => {
                        const cellRooms = getRoomsInCell(zoneId);
                        const hasViolation = cellRooms.some((r) => isRoomViolating(r));
                        const isUtama = zoneId === "UTAMANING_UTAMA";
                        const shortTitle = zoneId
                          .replace("UTAMANING_", "U. ")
                          .replace("MADYANING_", "M. ")
                          .replace("NISTANING_", "N. ");

                        return (
                          <div
                            key={`pdf-cell-${rIdx}-${cIdx}`}
                            className={`p-2 rounded border min-h-[64px] flex flex-col justify-between ${
                              hasViolation
                                ? "bg-[#FEF2F2] border-[#FCA5A5]"
                                : isUtama
                                ? "bg-[#F4F4F5] border-[#18181B]"
                                : "bg-white border-[#E4E4E7]"
                            }`}
                          >
                            <div className="text-[9.5px] font-bold text-[#18181B] leading-tight">
                              {shortTitle}
                            </div>
                            <div className="space-y-0.5 mt-1">
                              {cellRooms.length === 0 ? (
                                <span className="text-[8.5px] font-mono text-[#A1A1AA] block">
                                  Kosong
                                </span>
                              ) : (
                                cellRooms.slice(0, 2).map((rm, i) => (
                                  <span
                                    key={i}
                                    className="text-[8.5px] text-[#3F3F46] truncate block leading-tight"
                                  >
                                    • {rm.name}
                                  </span>
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
            </section>

            {/* 5. RECOMMENDATIONS / NOTES */}
            <section className="space-y-2">
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] font-semibold">
                3. Catatan &amp; Rekomendasi Teknis
              </h2>

              {audit_report.violations.length === 0 ? (
                <div className="p-3.5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] text-[12px] text-[#166534] leading-relaxed">
                  <strong>Nir-Pelanggaran Tata Ruang:</strong> Seluruh ruangan telah ditempatkan selaras dengan hierarki kesucian <em>Sanga Mandala</em> (Utama, Madya, Nista) dan memenuhi ketentuan Koefisien Dasar Bangunan (KDB ≤ 60%).
                </div>
              ) : (
                <div className="space-y-2">
                  {audit_report.violations.map((v, i) => (
                    <div
                      key={v.id || i}
                      className="p-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2]/60 text-[11.5px] space-y-1"
                    >
                      <div className="font-semibold text-[#991B1B]">
                        {i + 1}. {v.room_name} di Zona {v.zone_name}
                      </div>
                      <p className="text-[#3F3F46] leading-snug">{v.issue}</p>
                      <p className="text-[#18181B] font-medium leading-snug">
                        Rekomendasi: {v.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 6. CLEAN FOOTER & SIGNATURES */}
            <footer className="pt-5 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-[10.5px] text-[#52525B]">
              <div className="space-y-1 max-w-md leading-relaxed">
                <div className="font-semibold text-[#18181B]">Rujukan Regulasi:</div>
                <p>
                  Perda Provinsi Bali No. 5 Tahun 2005 tentang Persyaratan Arsitektur Bangunan Gedung, UU No. 28 Tahun 2002 jo. PP No. 16 Tahun 2021 (PBG), serta Pakem Tradisional Asta Kosala-Kosali &amp; Asta Bumi.
                </p>
              </div>

              <div className="flex items-end gap-8 shrink-0 font-mono text-[10px] text-center">
                <div className="w-36">
                  <div className="text-[#71717A] mb-10">Arsitek / Pemohon</div>
                  <div className="border-t border-[#A1A1AA] pt-1 text-[#18181B]">
                    Tanda Tangan
                  </div>
                </div>
                <div className="w-36">
                  <div className="text-[#71717A] mb-10">Pemeriksa Teknis</div>
                  <div className="border-t border-[#A1A1AA] pt-1 text-[#18181B]">
                    Verifikasi PBG
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
