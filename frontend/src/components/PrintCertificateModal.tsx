"use client";

import React from "react";
import { AuditResponse } from "@/types/audit";
import { Printer, X, Award, CheckCircle2 } from "lucide-react";

interface PrintCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditData: AuditResponse | null;
  hastaCm: number;
}

export default function PrintCertificateModal({
  isOpen,
  onClose,
  auditData,
  hastaCm
}: PrintCertificateModalProps) {
  if (!isOpen || !auditData) return null;

  const report = auditData.audit_report;
  const kaja = auditData.kaja_vector;
  const score = report?.compliance_score ?? 100;
  const isPass = score >= 80;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Dialog Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Pratinjau Lembar Bukti Audit Arsitektur Bali (Lampiran PBG)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0 print:m-0 font-serif">
          
          {/* Certificate Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h1 className="text-lg font-black tracking-wider uppercase text-slate-950 font-sans">
              BALEKERTA — SISTEM ANALISIS TATA RUANG BALI
            </h1>
            <h2 className="text-sm font-bold text-slate-800 font-sans">
              LEMBAR PRA-PEMERIKSAAN KEPATUHAN ARSITEKTUR TRADISIONAL BALI
            </h2>
            <p className="text-[11px] text-slate-600 font-sans">
              Pra-pemeriksaan independen berdasarkan pedoman Asta Bumi & Asta Kosala-Kosali
            </p>
            <p className="text-[10px] text-amber-800 bg-amber-50 py-1 px-2 rounded border border-amber-200 inline-block font-sans mt-1">
              *Pemberitahuan: Lembar ini adalah hasil pra-pemeriksaan digital dan BUKAN merupakan dokumen resmi pemerintah ataupun pengganti keputusan dinas perizinan PBG.
            </p>
          </div>

          {/* Certificate Meta Details */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs font-sans">
            <div>
              <p className="text-slate-500">Nomor Dokumen Audit:</p>
              <p className="font-mono font-bold text-slate-900">
                BAL/{new Date().getFullYear()}/ASTA-{auditData.image_hash?.slice(0, 8).toUpperCase() || "7F9B1E2A"}
              </p>
              <p className="text-slate-500 mt-2">Wilayah / Lokasi Tapak:</p>
              <p className="font-bold text-slate-900">{kaja?.location || "Denpasar, Bali"}</p>
            </div>

            <div>
              <p className="text-slate-500">Tanggal Pemeriksaan:</p>
              <p className="font-bold text-slate-900">{todayStr}</p>
              <p className="text-slate-500 mt-2">Parameter Antropometri Pemilik:</p>
              <p className="font-bold text-slate-900">
                1 Hasta = {hastaCm} cm (Depa: {hastaCm * 4} cm)
              </p>
            </div>
          </div>

          {/* Azimuth & Sacred Direction */}
          <div className="py-3 border-b border-slate-200 text-xs font-sans flex items-center justify-between">
            <div>
              <span className="text-slate-500">Arah Suci Kaja (Puncak Gunung Agung):</span>
              <p className="font-bold text-slate-900">
                Azimuth {kaja?.bearing_degrees.toFixed(2)}° N ({kaja?.cardinal_direction})
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Intensitas KDB Tapak:</span>
              <p className="font-bold text-slate-900">{report?.kdb_percentage}% (Batas Maks: 60%)</p>
            </div>
          </div>

          {/* Score Box */}
          <div className="my-5 p-4 rounded-xl border-2 border-slate-900 flex items-center justify-between font-sans">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl border ${
                  isPass ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-red-50 text-red-700 border-red-300"
                }`}
              >
                {score}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Keputusan Verifikasi Arsitektur:
                </span>
                <span className="text-sm font-black text-slate-900">
                  {report?.status_label}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  isPass ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-red-100 text-red-800 border-red-300"
                }`}
              >
                {isPass ? "✓ REKOMENDASI TERBIT PBG" : "✕ PERLU PENYESUAIAN DESAIN"}
              </span>
            </div>
          </div>

          {/* Violations / Findings Table */}
          <div className="space-y-2 text-xs font-sans my-4">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Rincian Catatan Audit Tata Ruang Sanga Mandala
            </h4>
            {report?.violations && report.violations.length > 0 ? (
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 p-2 text-left">Nama Ruangan</th>
                    <th className="border border-slate-300 p-2 text-left">Tingkat</th>
                    <th className="border border-slate-300 p-2 text-left">Uraian Pelanggaran Zonasi</th>
                    <th className="border border-slate-300 p-2 text-left">Dasar Hukum Perda</th>
                  </tr>
                </thead>
                <tbody>
                  {report.violations.map((v, i) => (
                    <tr key={i} className="border border-slate-300">
                      <td className="border border-slate-300 p-2 font-bold">{v.room_name}</td>
                      <td className="border border-slate-300 p-2 text-red-700 font-bold">{v.severity}</td>
                      <td className="border border-slate-300 p-2">{v.issue}</td>
                      <td className="border border-slate-300 p-2 italic text-slate-600">{v.legal_reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Seluruh tata letak ruangan mematuhi ketentuan Perda No. 5/2005 dan Asta Kosala-Kosali.</span>
              </div>
            )}
          </div>

          {/* Certificate Footer */}
          <div className="pt-6 mt-6 border-t border-slate-300 grid grid-cols-2 items-end font-sans text-xs">
            <div>
              <p className="text-[10px] text-slate-500">
                Pra-pemeriksaan dihitung otomatis oleh Mesin Spasial Sanga Mandala BaleKerta.
              </p>
              <p className="text-[10px] text-slate-500">
                Inovasi untuk Bali DigiFest 2026 (Solver for Bali).
              </p>
            </div>

            <div className="text-right ml-auto">
              <p className="font-bold text-slate-900">BaleKerta Spatial Engine</p>
              <p className="text-[10px] text-slate-500">Alat Bantu Pra-Pemeriksaan Mandiri</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
