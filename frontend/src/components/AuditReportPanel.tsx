"use client";

import React, { useState } from "react";
import { AuditResponse, Room } from "@/types/audit";
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Info,
  BookOpen,
  PieChart,
  Hammer
} from "lucide-react";

interface AuditReportPanelProps {
  auditData: AuditResponse | null;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room | null) => void;
  onOpenPrintModal: () => void;
}

export default function AuditReportPanel({
  auditData,
  selectedRoom,
  onSelectRoom,
  onOpenPrintModal
}: AuditReportPanelProps) {
  const [activeTab, setActiveTab] = useState<"violations" | "compliances" | "kdb" | "guide">("violations");

  const report = auditData?.audit_report;
  const violations = report?.violations || [];
  const compliances = report?.compliances || [];
  const score = report?.compliance_score ?? 100;
  const kdb = report?.kdb_percentage ?? 45;

  const isPass = score >= 80;
  const isWarning = score >= 50 && score < 80;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Header with Score Gauge & Print Trigger */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400/90 block">
              Hasil Verifikasi Tata Ruang
            </span>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Status Kepatuhan PBG</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isPass
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : isWarning
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {report?.status_label || (isPass ? "LAYAK PBG" : "MELANGGAR REGULASI")}
              </span>
            </h3>
          </div>

          <button
            onClick={onOpenPrintModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Buka Lembar Sertifikat Audit Siap Cetak/PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Ekspor / Cetak PBG</span>
          </button>
        </div>

        {/* Score Radial / Bar Meter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
          <div className="sm:col-span-4 flex items-center gap-3">
            <div
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-2xl border shadow-inner ${
                isPass
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : isWarning
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              <span>{score}</span>
              <span className="text-[9px] font-normal text-slate-400 -mt-1">/ 100</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                {isPass ? "Rekomendasi Disetujui" : isWarning ? "Perlu Penyesuaian" : "Wajib Diredesain"}
              </p>
              <p className="text-[11px] text-slate-400">
                {violations.length === 0
                  ? "Nol pelanggaran zonasi adat"
                  : `${violations.length} catatan perlu diperbaiki`}
              </p>
            </div>
          </div>

          {/* Quick Metrics (KDB & Rooms) */}
          <div className="sm:col-span-8 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">Estimasi KDB:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-slate-200">{kdb}%</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    kdb <= 60 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {kdb <= 60 ? "Maks. 60% (Lolos)" : "Melebihi Batas"}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">Total Ruang Tapak:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-slate-200">{auditData?.rooms?.length || 0} Area</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  9 Zona Sanga Mandala
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab("violations")}
          className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === "violations"
              ? "bg-slate-800 text-white font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Peringatan ({violations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("compliances")}
          className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === "compliances"
              ? "bg-slate-800 text-white font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kepatuhan ({compliances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("kdb")}
          className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === "kdb"
              ? "bg-slate-800 text-white font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-blue-400" />
          <span>KDB & Natah</span>
        </button>

        <button
          onClick={() => setActiveTab("guide")}
          className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === "guide"
              ? "bg-slate-800 text-white font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Dasar Hukum</span>
        </button>
      </div>

      {/* Tab Contents Viewport */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[420px] space-y-3">
        {/* TAB 1: VIOLATIONS */}
        {activeTab === "violations" && (
          <div className="space-y-3 animate-fade-in">
            {violations.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-200">Tata Ruang Sempurna Sesuai Adat</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Semua zonasi ruangan mematuhi ketentuan Perda No. 5/2005. Sanggah Pemerajan dialokasikan di sudut suci dan fungsi buangan berada di zona Teba.
                </p>
              </div>
            ) : (
              violations.map((viol) => {
                const isSelected = selectedRoom?.name.toLowerCase() === viol.room_name.toLowerCase();
                return (
                  <div
                    key={viol.id}
                    onClick={() => {
                      // Match and highlight room in canvas
                      const matched = auditData?.rooms.find((r) => r.name === viol.room_name);
                      if (matched) onSelectRoom(matched);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-red-500/20 border-red-400 shadow-md shadow-red-500/10"
                        : "bg-red-500/10 border-red-500/25 hover:border-red-400/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-red-200 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        {viol.room_name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-950 text-red-300 border border-red-800">
                        {viol.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{viol.issue}</p>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-red-500/20 text-[11px] text-red-200 space-y-1">
                      <div className="flex items-start gap-1">
                        <span className="font-bold shrink-0">⚖️ Regulasi:</span>
                        <span className="italic">{viol.legal_reference}</span>
                      </div>
                      <div className="flex items-start gap-1 text-amber-300/90 pt-1 border-t border-slate-800">
                        <Hammer className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span><strong>Solusi Arsitek:</strong> {viol.recommendation}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: COMPLIANCES */}
        {activeTab === "compliances" && (
          <div className="space-y-2.5 animate-fade-in">
            {compliances.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada poin kepatuhan tercatat.</p>
            ) : (
              compliances.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-200 block">{comp.room_name}</span>
                    <span className="text-slate-300 text-[11px]">{comp.detail}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: KDB & NATAH */}
        {activeTab === "kdb" && (
          <div className="space-y-3.5 text-xs text-slate-300 animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-amber-400" />
                Aturan Koefisien Dasar Bangunan (KDB)
              </span>
              <p className="text-[11px] text-slate-400">
                Berdasarkan <strong>Pasal 21 Perda No. 5/2005</strong>, intensitas pemanfaatan ruang pekarangan di kawasan permukiman Bali diatur maksimal <strong>60%</strong> untuk area terbangun, dan minimal <strong>40%</strong> dialokasikan untuk ruang terbuka hijau (RTH) dan resapan air alami.
              </p>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  className={`h-full ${kdb <= 60 ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, kdb)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Luas Terbangun: {kdb}%</span>
                <span>Ruang Hijau/Terbuka: {(100 - kdb).toFixed(1)}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" />
                Filosofi Sakral Natah (Halaman Tengah)
              </span>
              <p className="text-[11px] text-slate-400">
                Natah adalah titik sumbu mikrokosmos (*Akasa-Pertiwi*) yang mengalirkan udara, cahaya, dan energi ke seluruh bale di sekelilingnya. Penutupan area natah dengan atap atau dinding masif bertentangan dengan prinsip arsitektur tradisional Bali.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: LEGAL GUIDE */}
        {activeTab === "guide" && (
          <div className="space-y-3 text-xs text-slate-300 animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300 block">Perda Provinsi Bali No. 5 Tahun 2005</span>
              <p className="text-[11px] text-slate-400">
                Regulasi resmi pemerintah daerah yang mengatur persyaratan arsitektur bangunan gedung, fasad bernuansa arsitektur tradisional, sistem struktur, dan keselarasan lingkungan adat.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-300 block">Naskah Lontar Asta Kosala-Kosali & Asta Bumi</span>
              <p className="text-[11px] text-slate-400">
                Kitab klasik arsitektur Bali yang mendasari sistem antropometri (ukuran tubuh manusia) dan penataan 9 zona Sanga Mandala berdasarkan sumbu suci Gunung Agung dan arah matahari.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
