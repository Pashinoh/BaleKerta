"use client";

import React from "react";
import { AuditResponse } from "@/types/audit";
import { Printer, X, ShieldCheck, Compass, CheckCircle2, AlertCircle } from "lucide-react";
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
  const rthPercentage = Math.max(0, +(100 - audit_report.kdb_percentage).toFixed(1));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="printable-report-wrapper"
      className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/80 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Modal Card */}
      <div
        id="printable-report-card"
        className="relative w-full max-w-4xl bg-ink-900 border border-ink-700 rounded-lg shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 border-b border-ink-700 flex items-center justify-between no-print">
          <div>
            <h3 className="text-[16px] font-semibold text-bone-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-bone-100" />
              <span>Pratinjau Lembar Pra-Pemeriksaan PBG</span>
            </h3>
            <p className="text-[12px] text-bone-400">
              Format dokumen resmi pra-pemeriksaan arsitektur tradisional BaleKerta
            </p>
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
              aria-label="Tutup pratinjau"
              className="p-1.5 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div
          id="printable-report-body"
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-bone-100 print:text-black print:bg-white print:p-0 print:border-none"
        >
          {/* Header Lembar Resmi */}
          <div className="border-b-2 border-bone-100 print:border-black pb-4 text-center space-y-1 print-avoid-break">
            <div className="text-[11px] font-mono tracking-widest text-bone-400 print:text-gray-600 uppercase">
              Pemerintah Provinsi Bali &bull; Pra-Pemeriksaan Arsitektur Bangunan Gedung
            </div>
            <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-bone-100 print:text-black uppercase">
              BaleKerta &mdash; Sistem Pra-Inspeksi Tata Ruang Adat Bali
            </h1>
            <h2 className="text-[13px] font-semibold tracking-wider text-bone-400 print:text-gray-800 uppercase">
              Lembar Verifikasi Kepatuhan Asta Kosala-Kosali, Asta Bumi &amp; Perda No. 5/2005
            </h2>
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-bone-400 print:text-gray-600 pt-1">
              <span>Tanggal: {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span>&bull;</span>
              <span>Metode: Geodesic Sanga Mandala Matrix Engine</span>
            </div>
          </div>

          {/* Catatan Legalitas PBG */}
          <div className="p-3 bg-ink-950 border border-ink-700 rounded text-[11px] text-bone-400 print:border-gray-400 print:bg-gray-50 print:text-gray-800 leading-relaxed print-avoid-break">
            <strong>Catatan Resmi:</strong> Lembar ini diterbitkan sebagai hasil pra-pemeriksaan otomatis tata letak denah independen untuk membantu perancangan dan telaah mandiri sebelum sidang Tim Ahli Bangunan Gedung (TABG). Dokumen ini <u>bukan pengganti resmi sertifikat Persetujuan Bangunan Gedung (PBG)</u> yang diterbitkan oleh Dinas PUPR / Penanaman Modal.
          </div>

          {/* 1. Ringkasan Eksekutif & Status Kepatuhan */}
          <div className="p-4 rounded-lg border border-ink-700 bg-ink-950 print:bg-white print:border-gray-400 print-avoid-break space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-ink-800 print:border-gray-300">
              <span className="text-[13px] font-bold uppercase tracking-wider text-bone-100 print:text-black">
                1. Status Kelayakan Tata Ruang Adat
              </span>
              <span
                className={`text-[12px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
                  isPass
                    ? "bg-bone-100/10 text-bone-100 border-bone-100/30 print:border-black print:text-black print:bg-gray-100"
                    : "bg-clay/10 text-clay border-clay print:border-black print:text-black"
                }`}
              >
                {isPass ? "Memenuhi Kepatuhan Adat (Layak PBG)" : "Perlu Penyesuaian Ruang"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] font-mono">
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px]">Skor Kepatuhan:</span>
                <span className="text-[16px] font-bold text-bone-100 print:text-black">
                  {audit_report.compliance_score} / 100
                </span>
              </div>
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px]">Luas Terbangun (KDB):</span>
                <span className="text-[16px] font-bold text-bone-100 print:text-black">
                  {audit_report.kdb_percentage}%
                </span>
                <span className="text-[10px] text-bone-400 print:text-gray-500 block">Maks. 60.0%</span>
              </div>
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px]">Ruang Terbuka Hijau:</span>
                <span className="text-[16px] font-bold text-bone-100 print:text-black">
                  {rthPercentage}%
                </span>
                <span className="text-[10px] text-bone-400 print:text-gray-500 block">Natah &amp; Taman</span>
              </div>
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px]">Jumlah Ruangan:</span>
                <span className="text-[16px] font-bold text-bone-100 print:text-black">
                  {rooms.length} Ruang
                </span>
                <span className="text-[10px] text-bone-400 print:text-gray-500 block">
                  {audit_report.violations.length === 0 ? "Nir-Pelanggaran" : `${audit_report.violations.length} Catatan`}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Ringkasan Perhitungan Sistem (Format Mudah Dibaca Juri & Dinas PUPR) */}
          <div className="space-y-2 print-avoid-break">
            <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black flex items-center justify-between">
              <span>2. Ringkasan Perhitungan Sistem (Untuk Dewan Juri &amp; Tim Ahli TABG)</span>
              <span className="text-[11px] font-mono text-bone-400 print:text-gray-600 font-normal">
                Verifikasi Formula
              </span>
            </h3>

            {/* 3-Column Scorecard Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono">
              {/* Kolom A: Hitungan Geodesik */}
              <div className="p-3 bg-ink-950 border border-ink-700 rounded print:border-gray-400 print:bg-white space-y-1.5">
                <div className="font-bold text-bone-100 print:text-black border-b border-ink-800 print:border-gray-300 pb-1 flex items-center gap-1.5">
                  <Compass size={14} />
                  <span>A. Sumbu Geodesik Kaja</span>
                </div>
                <div className="space-y-1 text-bone-300 print:text-gray-800">
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Tapak:</span>
                    <span className="font-semibold truncate max-w-[140px]">{kaja_vector.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Koordinat:</span>
                    <span>{kaja_vector.latitude.toFixed(4)}&deg;, {kaja_vector.longitude.toFixed(4)}&deg;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Target Kaja:</span>
                    <span>Gn. Agung (-8.3433&deg;)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-ink-850 print:border-gray-200 font-bold text-bone-100 print:text-black">
                    <span>Sudut Geodesik:</span>
                    <span>{kaja_vector.bearing_degrees.toFixed(1)}&deg; ({kaja_vector.cardinal_direction})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Jarak Tapak:</span>
                    <span>{kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "Terpetakan"}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-bone-400 print:text-gray-500">Kuadran Suci:</span>
                    <span>{kaja_vector.kaja_quadrant}</span>
                  </div>
                </div>
              </div>

              {/* Kolom B: Hitungan KDB */}
              <div className="p-3 bg-ink-950 border border-ink-700 rounded print:border-gray-400 print:bg-white space-y-1.5">
                <div className="font-bold text-bone-100 print:text-black border-b border-ink-800 print:border-gray-300 pb-1">
                  B. Rasio KDB Pekarangan
                </div>
                <div className="space-y-1 text-bone-300 print:text-gray-800">
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Formula KDB:</span>
                    <span>(Luas_Atap / Tapak) &times; 100%</span>
                  </div>
                  <div className="flex justify-between font-bold text-bone-100 print:text-black">
                    <span>Luas Bangunan:</span>
                    <span>{audit_report.kdb_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">RTH (Resapan):</span>
                    <span>{rthPercentage}% (Natah &amp; Taman)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-ink-850 print:border-gray-200">
                    <span className="text-bone-400 print:text-gray-500">Batas Perda Ps. 12:</span>
                    <span>Maksimal 60.0%</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold">
                    <span className="text-bone-400 print:text-gray-500">Status KDB:</span>
                    <span className={audit_report.kdb_percentage <= 60 ? "text-bone-100 print:text-black" : "text-clay"}>
                      {audit_report.kdb_percentage <= 60 ? "MEMENUHI" : "MELEBIHI BATAS"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom C: Matriks Skor Kepatuhan */}
              <div className="p-3 bg-ink-950 border border-ink-700 rounded print:border-gray-400 print:bg-white space-y-1.5">
                <div className="font-bold text-bone-100 print:text-black border-b border-ink-800 print:border-gray-300 pb-1">
                  C. Formulasi Skor Kepatuhan
                </div>
                <div className="space-y-1 text-bone-300 print:text-gray-800">
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Formula Skor:</span>
                    <span>max(0, 100 - &Sigma; Penalti)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Skor Dasar:</span>
                    <span>100 Poin</span>
                  </div>
                  <div className="flex justify-between text-clay print:text-black">
                    <span className="text-bone-400 print:text-gray-500">Total Penalti:</span>
                    <span>-{100 - audit_report.compliance_score} Poin</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-ink-850 print:border-gray-200 font-bold text-bone-100 print:text-black">
                    <span>Skor Akhir:</span>
                    <span>{audit_report.compliance_score} / 100</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold">
                    <span className="text-bone-400 print:text-gray-500">Kelayakan PBG:</span>
                    <span>{isPass ? "LAYAK (MEMENUHI)" : "BELUM LAYAK"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Catatan Penyesuaian Ruang */}
          <div className="space-y-2 print-avoid-break">
            <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black">
              3. Catatan Penyesuaian Ruang ({audit_report.violations.length})
            </h3>
            {audit_report.violations.length === 0 ? (
              <div className="p-3 border border-ink-700 rounded bg-ink-950 print:border-gray-300 print:bg-gray-50 text-[12px] text-bone-300 print:text-gray-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-bone-100 print:text-black shrink-0" />
                <span>
                  <strong>Nir-Pelanggaran Spasial:</strong> Seluruh peruntukan ruangan mematuhi hierarki kesucian Sanga Mandala dan Koefisien Dasar Bangunan (KDB).
                </span>
              </div>
            ) : (
              <div className="space-y-2 text-[12px]">
                {audit_report.violations.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="p-3 border border-ink-700 rounded bg-ink-950/60 print:border-gray-400 print:bg-white space-y-1 print-avoid-break"
                  >
                    <div className="font-semibold text-bone-100 print:text-black flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-clay print:text-black shrink-0" />
                      <span>{i + 1}. {v.issue}</span>
                    </div>
                    <div className="text-bone-400 print:text-gray-700 pl-5">
                      <strong>Rekomendasi Perbaikan:</strong> {v.recommendation}
                    </div>
                    {v.legal_reference && (
                      <div className="text-[11px] text-bone-400 print:text-gray-600 font-mono italic pl-5">
                        Dasar Pedoman: {v.legal_reference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Inventarisasi Ruangan ({rooms.length}) */}
          <div className="space-y-2 print-avoid-break">
            <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black">
              4. Inventarisasi Ruangan Terdeteksi ({rooms.length} Ruang)
            </h3>
            <table className="w-full text-left text-[11px]">
              <thead className="bg-ink-950 border-b border-ink-700 print:bg-gray-100 text-bone-400 print:text-black font-mono">
                <tr>
                  <th className="p-2 w-12 text-center">No</th>
                  <th className="p-2">Nama Ruangan pada Denah</th>
                  <th className="p-2">Klasifikasi Arsitektur Adat</th>
                  <th className="p-2">Zona Sanga Mandala Terpetakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800 print:divide-gray-300">
                {rooms.map((r, i) => (
                  <tr key={`${r.name}-${i}`} className="print-avoid-break">
                    <td className="p-2 text-center font-mono text-bone-400 print:text-gray-600">{i + 1}</td>
                    <td className="p-2 font-medium text-bone-100 print:text-black">{r.name}</td>
                    <td className="p-2 font-mono text-bone-300 print:text-gray-700 uppercase text-[10px]">
                      {r.type}
                    </td>
                    <td className="p-2 font-mono text-bone-400 print:text-black text-[10px]">
                      {r.zone?.zone_name || r.zone?.zone_id?.replace(/_/g, " ") || "Terpetakan"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Dasar Hukum & Regulasi PBG */}
          <div className="space-y-2 print-avoid-break">
            <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black">
              5. Landasan Hukum &amp; Ketentuan Perda PBG
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white space-y-1">
                <span className="font-bold text-bone-100 print:text-black block font-mono">
                  Perda Prov. Bali No. 5 Tahun 2005
                </span>
                <ul className="text-bone-400 print:text-gray-700 space-y-0.5 list-disc pl-4 text-[10.5px]">
                  <li><strong>Pasal 5 &amp; 8:</strong> Kewajiban filosofi Tri Hita Karana &amp; konsepsi hierarki Tri Angga.</li>
                  <li><strong>Pasal 9:</strong> Orientasi sumbu suci Kaja-Kelod &amp; 9 zona Sanga Mandala.</li>
                  <li><strong>Pasal 12:</strong> Koefisien Dasar Bangunan (KDB) hunian maksimal 60.0%.</li>
                  <li><strong>Pasal 14:</strong> Fasilitas tempat ibadah keluarga (Pemerajan) di sudut Kaja-Kangin.</li>
                </ul>
              </div>

              <div className="p-2.5 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white space-y-1">
                <span className="font-bold text-bone-100 print:text-black block font-mono">
                  UU No. 28/2002 &amp; Lontar Adat
                </span>
                <ul className="text-bone-400 print:text-gray-700 space-y-0.5 list-disc pl-4 text-[10.5px]">
                  <li><strong>UU 28/2002 jo. PP 16/2021:</strong> Kewajiban keselarasan arsitektur gedung terhadap kearifan lokal dalam PBG.</li>
                  <li><strong>Lontar Asta Kosala-Kosali:</strong> Larangan kamar tidur utama di zona Teba (limbah/kandang).</li>
                  <li><strong>Lontar Asta Bumi:</strong> Pemeliharaan Natah di pusat pekarangan sebagai sumbu Akasa-Pertiwi.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 6. Pengesahan & Validasi Pra-Inspeksi */}
          <div className="pt-4 border-t-2 border-bone-100 print:border-black flex justify-between items-end text-[11px] text-bone-400 print:text-black print-avoid-break">
            <div className="space-y-1">
              <p>Dihasilkan secara otomatis oleh:</p>
              <p className="font-bold text-bone-100 print:text-black text-[13px]">
                BaleKerta Cultural Spatial Engine
              </p>
              <p className="font-mono text-[10px]">
                Versi 1.2 &bull; Bali DigiFest 2026 Submission
              </p>
            </div>
            <div className="text-right space-y-1">
              <p>Telah Diperiksa &amp; Divalidasi:</p>
              <div className="h-10"></div>
              <p className="font-mono text-bone-100 print:text-black font-semibold">
                ( Tim Teknis / Arsitek Pemohon )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
