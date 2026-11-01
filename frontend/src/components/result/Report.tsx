"use client";

import React from "react";
import { AuditResponse } from "@/types/audit";
import { Printer, X } from "lucide-react";
import { Button } from "../ui/Button";

export interface ReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditResponse | null;
}

export const Report: React.FC<ReportProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const { audit_report, kaja_vector, rooms } = data;
  const isPass = audit_report.compliance_score >= 80;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/80 flex items-center justify-center p-3 sm:p-6">
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-ink-900 border border-ink-700 rounded-lg shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Controls (No Print) */}
        <div className="p-4 border-b border-ink-700 flex items-center justify-between no-print">
          <div>
            <h3 className="text-[16px] font-semibold text-bone-100">
              Pratinjau Lembar Pra-Pemeriksaan
            </h3>
            <p className="text-[12px] text-bone-400">
              Format standar pra-pemeriksaan arsitektur tradisional BaleKerta
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={15} />}
            >
              Cetak / Unduh PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-bone-100 print:text-black print:bg-white print:p-0 print:border-none">
          {/* Header */}
          <div className="border-b-2 border-bone-100 pb-4 text-center space-y-1">
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight uppercase">
              BaleKerta — Sistem Analisis Tata Ruang Bali
            </h1>
            <h2 className="text-[14px] font-semibold tracking-wide text-bone-400 uppercase print:text-black">
              Lembar Pra-Pemeriksaan Kepatuhan Arsitektur Tradisional Bali
            </h2>
            <p className="text-[11px] text-bone-400 italic print:text-gray-600">
              Berdasarkan Pedoman Asta Kosala-Kosali, Asta Bumi, dan Perda Prov. Bali No. 5/2005
            </p>
          </div>

          {/* Legal Disclaimer Box */}
          <div className="p-3 bg-ink-950 border border-ink-700 rounded text-[12px] text-bone-400 print:border-gray-400 print:bg-gray-50 print:text-gray-800 leading-relaxed">
            <strong>Catatan Resmi:</strong> Lembar ini diterbitkan sebagai hasil pra-pemeriksaan
            otomatis tata letak denah independen untuk membantu perancangan sebelum pengajuan perizinan.
            Lembar ini <u>bukan dokumen keputusan resmi dinas</u> dan <u>bukan pengganti dokumen Persetujuan Bangunan Gedung (PBG)</u>.
          </div>

          {/* Project & Plot Information Table */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-bold uppercase tracking-wider border-b border-ink-700 pb-1 text-bone-100 print:text-black">
              1. Parameter Tapak & Orientasi Kosmologis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px] font-mono">
              <div className="p-2.5 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white">
                <span className="block text-[11px] text-bone-400 print:text-gray-500">Lokasi / Wilayah</span>
                <span className="font-semibold text-bone-100 print:text-black truncate block">
                  {kaja_vector.location}
                </span>
              </div>
              <div className="p-2.5 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white">
                <span className="block text-[11px] text-bone-400 print:text-gray-500">Arah Suci (Kaja)</span>
                <span className="font-semibold text-bone-100 print:text-black">
                  {kaja_vector.cardinal_direction} ({kaja_vector.bearing_degrees.toFixed(1)}°)
                </span>
              </div>
              <div className="p-2.5 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white">
                <span className="block text-[11px] text-bone-400 print:text-gray-500">Jarak ke Gn. Agung</span>
                <span className="font-semibold text-bone-100 print:text-black">
                  {kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "Terpetakan"}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance Verdict Section */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-bold uppercase tracking-wider border-b border-ink-700 pb-1 text-bone-100 print:text-black">
              2. Ringkasan Hasil Kepatuhan
            </h3>
            <div className="p-4 rounded border border-ink-700 bg-ink-950 space-y-2 print:border-gray-400 print:bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-bone-100 print:text-black">
                  Status Kelayakan Tata Ruang:
                </span>
                <span className="text-[13px] font-mono font-bold uppercase">
                  {isPass ? "Memenuhi Kepatuhan Adat (Layak)" : "Perlu Penyesuaian Tata Ruang"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px] text-bone-400 print:text-black font-mono">
                <span>Skor Kepatuhan Spasial:</span>
                <span className="font-bold text-bone-100 print:text-black">
                  {audit_report.compliance_score} / 100
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px] text-bone-400 print:text-black font-mono">
                <span>Perkiraan Luas Bangunan (KDB):</span>
                <span className="font-bold text-bone-100 print:text-black">
                  {audit_report.kdb_percentage}% (Maksimal 60%)
                </span>
              </div>
            </div>
          </div>

          {/* Violations / Issues Details */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-bold uppercase tracking-wider border-b border-ink-700 pb-1 text-bone-100 print:text-black">
              3. Catatan Penyesuaian Ruang ({audit_report.violations.length})
            </h3>
            {audit_report.violations.length === 0 ? (
              <p className="text-[13px] text-bone-400 print:text-gray-700 italic">
                Tidak ditemukan pelanggaran tata letak pada pemeriksaan denah ini.
              </p>
            ) : (
              <div className="space-y-3">
                {audit_report.violations.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="p-3 border border-ink-700 rounded bg-ink-950/60 print:border-gray-400 print:bg-white space-y-1 text-[13px]"
                  >
                    <div className="font-semibold text-bone-100 print:text-black">
                      {i + 1}. {v.issue}
                    </div>
                    <div className="text-bone-400 print:text-gray-700">
                      <strong>Rekomendasi:</strong> {v.recommendation}
                    </div>
                    {v.legal_reference && (
                      <div className="text-[11px] text-bone-400 print:text-gray-600 font-mono italic">
                        Dasar pedoman: {v.legal_reference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rooms Inventory */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-bold uppercase tracking-wider border-b border-ink-700 pb-1 text-bone-100 print:text-black">
              4. Inventaris Ruangan ({rooms.length})
            </h3>
            <table className="w-full text-left text-[12px] border border-ink-700 print:border-gray-400">
              <thead className="bg-ink-950 border-b border-ink-700 print:bg-gray-100 print:border-gray-400 text-bone-400 print:text-black">
                <tr>
                  <th className="p-2">No</th>
                  <th className="p-2">Nama Ruangan</th>
                  <th className="p-2">Zona Sanga Mandala</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700 print:divide-gray-300">
                {rooms.map((r, i) => (
                  <tr key={`${r.name}-${i}`}>
                    <td className="p-2 font-mono">{i + 1}</td>
                    <td className="p-2 font-medium">{r.name}</td>
                    <td className="p-2 font-mono text-bone-400 print:text-black">
                      {r.zone?.zone_id || "Terpetakan"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Dasar Hukum & Regulasi PBG */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-bold uppercase tracking-wider border-b border-ink-700 pb-1 text-bone-100 print:text-black">
              5. Dasar Hukum Regulasi PBG & Rujukan Naskah Adat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
              <div className="p-3 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white space-y-1">
                <span className="font-bold text-bone-100 print:text-black block font-mono">
                  Perda Prov. Bali No. 5 Tahun 2005
                </span>
                <ul className="text-bone-400 print:text-gray-700 space-y-1 list-disc pl-4 text-[11px]">
                  <li><strong>Pasal 5 & 8:</strong> Kewajiban prinsip Tri Hita Karana & konsepsi hierarki Tri Angga.</li>
                  <li><strong>Pasal 9:</strong> Orientasi sumbu suci Kaja-Kelod & Sanga Mandala 9 zona.</li>
                  <li><strong>Pasal 12:</strong> Batas Koefisien Dasar Bangunan (KDB) hunian maksimal 60%.</li>
                  <li><strong>Pasal 14:</strong> Fasilitas tempat suci keluarga (Pemerajan) di sudut Kaja-Kangin.</li>
                </ul>
              </div>

              <div className="p-3 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white space-y-1">
                <span className="font-bold text-bone-100 print:text-black block font-mono">
                  UU No. 28/2002 & Naskah Lontar
                </span>
                <ul className="text-bone-400 print:text-gray-700 space-y-1 list-disc pl-4 text-[11px]">
                  <li><strong>UU No. 28/2002 jo. PP 16/2021:</strong> Kewajiban keselarasan arsitektur gedung terhadap kearifan lokal dalam PBG.</li>
                  <li><strong>Lontar Asta Kosala-Kosali:</strong> Larangan kamar tidur utama di zona Teba (limbah/kandang) & penataan bale pekarangan.</li>
                  <li><strong>Lontar Asta Bumi:</strong> Pemeliharaan Natah di pusat pekarangan sebagai sumbu Akasa-Pertiwi.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 6. Transparansi Formula Perhitungan Sistem (Untuk Juri & TABG) */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-bold uppercase tracking-wider border-b border-ink-700 pb-1 text-bone-100 print:text-black">
              6. Transparansi Formula Perhitungan Sistem (Dewan Juri & TABG)
            </h3>
            <div className="p-3 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white space-y-2 font-mono text-[11px] text-bone-300 print:text-black">
              <div>
                <strong className="text-bone-100 print:text-black">Formula Azimuth Geodesik:</strong> θ = atan2(sin(Δλ)·cos(φ_2), cos(φ_1)sin(φ_2) - sin(φ_1)cos(φ_2)cos(Δλ)) → Sudut Kaja: <strong>{kaja_vector.bearing_degrees.toFixed(1)}° ({kaja_vector.cardinal_direction})</strong>
              </div>
              <div>
                <strong className="text-bone-100 print:text-black">Formula Haversine Jarak:</strong> d = 2R · arcsin(√(sin²(Δφ/2) + cos(φ_1)cos(φ_2)sin²(Δλ/2))) → Jarak ke Puncak: <strong>{kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "Terpetakan"}</strong>
              </div>
              <div>
                <strong className="text-bone-100 print:text-black">Formula Koefisien Dasar Bangunan:</strong> KDB = (Σ Luas_Ruang / Luas_Pekarangan) × 100% → <strong>{audit_report.kdb_percentage}% (Maks. 60.0%)</strong>
              </div>
              <div>
                <strong className="text-bone-100 print:text-black">Formula Algoritma Skor:</strong> Skor = max(0, 100 - Σ Penalti) → Skor Akhir: <strong>{audit_report.compliance_score} / 100 ({isPass ? "Layak PBG" : "Perlu Penyesuaian"})</strong>
              </div>
            </div>
          </div>

          {/* Signatures / Closing */}
          <div className="pt-6 border-t border-ink-700 flex justify-between text-[12px] text-bone-400 print:text-black">
            <div>
              <p>Dihasilkan secara otomatis oleh:</p>
              <p className="font-semibold text-bone-100 print:text-black">
                BaleKerta Cultural Spatial Engine
              </p>
              <p className="font-mono text-[11px]">Bali DigiFest 2026 Submission</p>
            </div>
            <div className="text-right">
              <p>Tanggal Pemeriksaan:</p>
              <p className="font-mono text-bone-100 print:text-black font-semibold">
                {new Date().toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
