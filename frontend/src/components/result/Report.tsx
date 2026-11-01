"use client";

import React, { useEffect } from "react";
import { AuditResponse } from "@/types/audit";
import { Printer, X, ShieldCheck, Compass, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";

export interface ReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditResponse | null;
}

export const Report: React.FC<ReportProps> = ({ isOpen, onClose, data }) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const docFilename = `BaleKerta_Laporan_Inspeksi_${dateStr}`;
  const docNumber = `BK-PBG/${yyyy}${mm}${dd}/001`;

  // Set document title so browser uses it as default PDF save name
  useEffect(() => {
    if (isOpen) {
      const originalTitle = document.title;
      document.title = docFilename;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [isOpen, docFilename]);

  if (!isOpen || !data) return null;

  const { audit_report, kaja_vector, rooms } = data;
  const isPass = audit_report.compliance_score >= 80;
  const rthPercentage = Math.max(0, +(100 - audit_report.kdb_percentage).toFixed(1));

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
      className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/80 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Modal Card */}
      <div
        id="printable-report-card"
        className="relative w-full max-w-4xl bg-ink-900 border border-ink-700 rounded-lg shadow-2xl flex flex-col max-h-[94vh]"
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 border-b border-ink-700 flex items-center justify-between no-print">
          <div>
            <h3 className="text-[16px] font-semibold text-bone-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-bone-100" />
              <span>Pratinjau Lembar Pra-Pemeriksaan PBG</span>
            </h3>
            <p className="text-[12px] text-bone-400">
              Format dokumen resmi pra-pemeriksaan arsitektur tradisional BaleKerta &bull; {docFilename}.pdf
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
          className="p-6 sm:p-8 overflow-y-auto space-y-4 print:space-y-1.5 text-bone-100 print:text-black print:bg-white print:p-0 print:border-none"
        >
          {/* Header Lembar Resmi */}
          <div className="border-b-2 border-bone-100 print:border-black pb-3 print:pb-2 text-center space-y-1 print-avoid-break">
            <div className="flex items-center justify-between text-[11px] print:text-[10px] font-mono text-bone-400 print:text-gray-600">
              <span>PEMERINTAH PROVINSI BALI &bull; DINAS PUPR</span>
              <span>NOMOR: {docNumber}</span>
            </div>
            <h1 className="text-[19px] sm:text-[21px] print:text-[17px] font-bold tracking-tight text-bone-100 print:text-black uppercase">
              BaleKerta &mdash; Sistem Pra-Inspeksi Tata Ruang Adat Bali
            </h1>
            <h2 className="text-[12px] print:text-[11px] font-semibold tracking-wider text-bone-400 print:text-gray-800 uppercase">
              Lembar Verifikasi Kepatuhan Asta Kosala-Kosali, Asta Bumi &amp; Perda No. 5/2005
            </h2>
            <div className="flex items-center justify-center gap-4 text-[11px] print:text-[10px] font-mono text-bone-400 print:text-gray-600 pt-0.5">
              <span>Tanggal Penerbitan: {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span>&bull;</span>
              <span>Metode: Geodesic Sanga Mandala Matrix Engine</span>
            </div>
          </div>

          {/* Catatan Legalitas PBG */}
          <div className="p-2.5 print:p-2 bg-ink-950 border border-ink-700 rounded text-[11px] print:text-[9.5px] text-bone-400 print:border-gray-400 print:bg-gray-50 print:text-gray-800 leading-relaxed print-avoid-break">
            <strong>Catatan Resmi:</strong> Lembar ini diterbitkan sebagai hasil pra-pemeriksaan otomatis tata letak denah independen untuk membantu perancangan dan telaah mandiri sebelum sidang Tim Ahli Bangunan Gedung (TABG). Dokumen ini <u>bukan pengganti resmi sertifikat Persetujuan Bangunan Gedung (PBG)</u> yang diterbitkan oleh Dinas PUPR / Penanaman Modal.
          </div>

          {/* 1. Ringkasan Eksekutif & Status Kepatuhan */}
          <div className="p-3.5 print:p-2 rounded-lg border border-ink-700 bg-ink-950 print:bg-white print:border-gray-400 print-avoid-break space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-ink-800 print:border-gray-300">
              <span className="text-[12px] print:text-[11px] font-bold uppercase tracking-wider text-bone-100 print:text-black">
                1. Status Kelayakan Tata Ruang Adat
              </span>
              <span
                className={`text-[11px] print:text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase ${
                  isPass
                    ? "bg-bone-100/10 text-bone-100 border-bone-100/30 print:border-black print:text-black print:bg-gray-100"
                    : "bg-clay/10 text-clay border-clay print:border-black print:text-black"
                }`}
              >
                {isPass ? "Memenuhi Kepatuhan Adat (Layak PBG)" : "Perlu Penyesuaian Ruang"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] print:text-[10px] font-mono">
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px] print:text-[9.5px]">Skor Kepatuhan:</span>
                <span className="text-[16px] print:text-[15px] font-bold text-bone-100 print:text-black">
                  {audit_report.compliance_score} / 100
                </span>
              </div>
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px] print:text-[9.5px]">Luas Terbangun (KDB):</span>
                <span className="text-[16px] print:text-[15px] font-bold text-bone-100 print:text-black">
                  {audit_report.kdb_percentage}%
                </span>
                <span className="text-[10px] print:text-[9px] text-bone-400 print:text-gray-500 block">Maks. 60.0%</span>
              </div>
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px] print:text-[9.5px]">Ruang Terbuka Hijau:</span>
                <span className="text-[16px] print:text-[15px] font-bold text-bone-100 print:text-black">
                  {rthPercentage}%
                </span>
                <span className="text-[10px] print:text-[9px] text-bone-400 print:text-gray-500 block">Natah &amp; Taman</span>
              </div>
              <div className="p-2 bg-ink-900 border border-ink-800 rounded print:border-gray-300 print:bg-gray-50">
                <span className="text-bone-400 print:text-gray-600 block text-[10px] print:text-[9.5px]">Jumlah Ruangan:</span>
                <span className="text-[16px] print:text-[15px] font-bold text-bone-100 print:text-black">
                  {rooms.length} Ruang
                </span>
                <span className="text-[10px] print:text-[9px] text-bone-400 print:text-gray-500 block">
                  {audit_report.violations.length === 0 ? "Nir-Pelanggaran" : `${audit_report.violations.length} Catatan`}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Ringkasan Perhitungan Teknis Sistem */}
          <div className="space-y-1.5 print-avoid-break">
            <h3 className="text-[12px] print:text-[11px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black flex items-center justify-between">
              <span>2. Ringkasan Perhitungan Sistem (Metode &amp; Evaluasi Spasial)</span>
              <span className="text-[11px] print:text-[9.5px] font-mono text-bone-400 print:text-gray-600 font-normal">
                Verifikasi Teknis
              </span>
            </h3>

            {/* 3-Column Scorecard Table (Disederhanakan Tanpa Simbol Rumit) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] print:text-[10px] font-mono">
              {/* Kolom A: Arah Suci Kaja */}
              <div className="p-2.5 print:p-2 bg-ink-950 border border-ink-700 rounded print:border-gray-400 print:bg-white space-y-1">
                <div className="font-bold text-bone-100 print:text-black border-b border-ink-800 print:border-gray-300 pb-1 flex items-center gap-1.5 text-[11.5px] print:text-[10.5px]">
                  <Compass size={14} />
                  <span>A. Arah Suci Kaja (Geodesik)</span>
                </div>
                <div className="space-y-1 text-bone-300 print:text-gray-800 leading-snug">
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Lokasi Tapak:</span>
                    <span className="font-semibold truncate max-w-[130px]">{kaja_vector.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Titik Acuan:</span>
                    <span>Puncak Gn. Agung</span>
                  </div>
                  <div className="flex justify-between pt-0.5 border-t border-ink-850 print:border-gray-200 font-bold text-bone-100 print:text-black">
                    <span>Arah Kompas Kaja:</span>
                    <span>{kaja_vector.bearing_degrees.toFixed(1)}&deg; ({kaja_vector.cardinal_direction})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Jarak ke Puncak:</span>
                    <span>{kaja_vector.distance_km ? `${kaja_vector.distance_km.toFixed(1)} km` : "Terpetakan"}</span>
                  </div>
                  <div className="flex justify-between text-[10px] print:text-[9px]">
                    <span className="text-bone-400 print:text-gray-500">Posisi Tempat Suci:</span>
                    <span>Sudut {kaja_vector.kaja_quadrant.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>

              {/* Kolom B: KDB & Kepadatan Bangunan */}
              <div className="p-2.5 print:p-2 bg-ink-950 border border-ink-700 rounded print:border-gray-400 print:bg-white space-y-1">
                <div className="font-bold text-bone-100 print:text-black border-b border-ink-800 print:border-gray-300 pb-1 text-[11.5px] print:text-[10.5px]">
                  B. Rasio KDB (Kepadatan)
                </div>
                <div className="space-y-1 text-bone-300 print:text-gray-800 leading-snug">
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Cara Hitung:</span>
                    <span>Luas Bangunan &divide; Luas Tanah</span>
                  </div>
                  <div className="flex justify-between font-bold text-bone-100 print:text-black">
                    <span>Bangunan Beratap:</span>
                    <span>{audit_report.kdb_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Area Terbuka Hijau:</span>
                    <span>{rthPercentage}% (Natah &amp; Taman)</span>
                  </div>
                  <div className="flex justify-between pt-0.5 border-t border-ink-850 print:border-gray-200">
                    <span className="text-bone-400 print:text-gray-500">Batas Maksimal:</span>
                    <span>Maks. 60.0% (Perda 5/2005)</span>
                  </div>
                  <div className="flex justify-between pt-0.5 font-bold">
                    <span className="text-bone-400 print:text-gray-500">Status KDB:</span>
                    <span className={audit_report.kdb_percentage <= 60 ? "text-bone-100 print:text-black" : "text-clay"}>
                      {audit_report.kdb_percentage <= 60 ? "MEMENUHI ATURAN" : "MELEBIHI BATAS"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom C: Nilai Kepatuhan Tata Ruang */}
              <div className="p-2.5 print:p-2 bg-ink-950 border border-ink-700 rounded print:border-gray-400 print:bg-white space-y-1">
                <div className="font-bold text-bone-100 print:text-black border-b border-ink-800 print:border-gray-300 pb-1 text-[11.5px] print:text-[10.5px]">
                  C. Nilai Kepatuhan Tata Ruang
                </div>
                <div className="space-y-1 text-bone-300 print:text-gray-800 leading-snug">
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Cara Hitung:</span>
                    <span>Nilai Awal 100 &minus; Penalti</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bone-400 print:text-gray-500">Nilai Awal:</span>
                    <span>100 Poin</span>
                  </div>
                  <div className="flex justify-between text-clay print:text-black">
                    <span className="text-bone-400 print:text-gray-500">Total Potongan:</span>
                    <span>
                      {100 - audit_report.compliance_score > 0
                        ? `-${100 - audit_report.compliance_score} Poin`
                        : "0 Poin (Nir-Penalti)"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-0.5 border-t border-ink-850 print:border-gray-200 font-bold text-bone-100 print:text-black">
                    <span>Nilai Akhir:</span>
                    <span>{audit_report.compliance_score} / 100</span>
                  </div>
                  <div className="flex justify-between pt-0.5 font-bold">
                    <span className="text-bone-400 print:text-gray-500">Rekomendasi PBG:</span>
                    <span>{isPass ? "LAYAK (MEMENUHI)" : "BELUM LAYAK"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Catatan Penyesuaian Ruang */}
          <div className="space-y-1.5 print-avoid-break">
            <h3 className="text-[12px] print:text-[11px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black">
              3. Catatan Penyesuaian Ruang ({audit_report.violations.length})
            </h3>
            {audit_report.violations.length === 0 ? (
              <div className="p-2.5 print:p-2 border border-ink-700 rounded bg-ink-950 print:border-gray-300 print:bg-gray-50 text-[11px] print:text-[10px] text-bone-300 print:text-gray-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-bone-100 print:text-black shrink-0" />
                <span>
                  <strong>Nir-Pelanggaran Spasial:</strong> Seluruh peruntukan ruangan mematuhi hierarki kesucian Sanga Mandala dan Koefisien Dasar Bangunan (KDB).
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 text-[11px] print:text-[10px]">
                {audit_report.violations.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="p-2.5 print:p-2 border border-ink-700 rounded bg-ink-950/60 print:border-gray-400 print:bg-white space-y-0.5 print-avoid-break"
                  >
                    <div className="font-semibold text-bone-100 print:text-black flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-clay print:text-black shrink-0" />
                      <span>{i + 1}. {v.issue}</span>
                    </div>
                    <div className="text-bone-400 print:text-gray-700 pl-5 leading-snug">
                      <strong>Rekomendasi Perbaikan:</strong> {v.recommendation}
                    </div>
                    {v.legal_reference && (
                      <div className="text-[10.5px] print:text-[9px] text-bone-400 print:text-gray-600 font-mono italic pl-5">
                        Dasar Pedoman: {v.legal_reference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Inventarisasi Ruangan ({rooms.length}) */}
          <div className="space-y-1.5 print-avoid-break">
            <h3 className="text-[12px] print:text-[11px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black">
              4. Inventarisasi Ruangan Terdeteksi ({rooms.length} Ruang)
            </h3>
            <table className="w-full text-left text-[11px] print:text-[8.5px]">
              <thead className="bg-ink-950 border-b border-ink-700 print:bg-gray-100 text-bone-400 print:text-black font-mono">
                <tr>
                  <th className="p-2 print:py-0.5 print:px-1.5 w-10 text-center">No</th>
                  <th className="p-2 print:py-0.5 print:px-1.5">Nama Ruangan pada Denah</th>
                  <th className="p-2 print:py-0.5 print:px-1.5">Klasifikasi Arsitektur Adat</th>
                  <th className="p-2 print:py-0.5 print:px-1.5">Zona Sanga Mandala Terpetakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800 print:divide-gray-300">
                {rooms.map((r, i) => (
                  <tr key={`${r.name}-${i}`} className="print-avoid-break">
                    <td className="p-2 print:py-0.5 print:px-1.5 text-center font-mono text-bone-400 print:text-gray-600">{i + 1}</td>
                    <td className="p-2 print:py-0.5 print:px-1.5 font-medium text-bone-100 print:text-black">{r.name}</td>
                    <td className="p-2 print:py-0.5 print:px-1.5 font-mono text-bone-300 print:text-gray-700 uppercase text-[10px] print:text-[8px]">
                      {r.type}
                    </td>
                    <td className="p-2 print:py-0.5 print:px-1.5 font-mono text-bone-400 print:text-black text-[10px] print:text-[8px]">
                      {r.zone?.zone_name || r.zone?.zone_id?.replace(/_/g, " ") || "Terpetakan"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Dasar Hukum & Regulasi PBG */}
          <div className="space-y-1.5 print-avoid-break">
            <h3 className="text-[12px] print:text-[11px] font-bold uppercase tracking-wider border-b border-ink-700 print:border-gray-400 pb-1 text-bone-100 print:text-black">
              5. Landasan Hukum &amp; Ketentuan Perda PBG
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] print:text-[9.5px]">
              <div className="p-2.5 print:p-2 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white space-y-1">
                <span className="font-bold text-bone-100 print:text-black block font-mono text-[11px] print:text-[10px]">
                  Perda Prov. Bali No. 5 Tahun 2005
                </span>
                <ul className="text-bone-400 print:text-gray-700 space-y-0.5 list-disc pl-3 text-[10px] print:text-[9px] leading-snug">
                  <li><strong>Pasal 5 &amp; 8:</strong> Kewajiban filosofi Tri Hita Karana &amp; hierarki Tri Angga.</li>
                  <li><strong>Pasal 9:</strong> Orientasi sumbu suci Kaja-Kelod &amp; 9 zona Sanga Mandala.</li>
                  <li><strong>Pasal 12:</strong> Koefisien Dasar Bangunan (KDB) hunian maksimal 60.0%.</li>
                  <li><strong>Pasal 14:</strong> Fasilitas ibadah keluarga (Pemerajan) di sudut Kaja-Kangin.</li>
                </ul>
              </div>

              <div className="p-2.5 print:p-2 bg-ink-950 border border-ink-700 rounded print:border-gray-300 print:bg-white space-y-1">
                <span className="font-bold text-bone-100 print:text-black block font-mono text-[11px] print:text-[10px]">
                  UU No. 28/2002 &amp; Lontar Adat
                </span>
                <ul className="text-bone-400 print:text-gray-700 space-y-0.5 list-disc pl-3 text-[10px] print:text-[9px] leading-snug">
                  <li><strong>UU 28/2002 jo. PP 16/2021:</strong> Keselarasan arsitektur gedung terhadap kearifan lokal dalam PBG.</li>
                  <li><strong>Lontar Asta Kosala-Kosali:</strong> Larangan kamar tidur utama di zona Teba (limbah/kandang).</li>
                  <li><strong>Lontar Asta Bumi:</strong> Pemeliharaan Natah di pusat pekarangan sebagai sumbu Akasa-Pertiwi.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 6. Pengesahan & Validasi Pra-Inspeksi */}
          <div className="pt-2 print:pt-1 border-t-2 border-bone-100 print:border-black flex justify-between items-end text-[11px] print:text-[9px] text-bone-400 print:text-black print-avoid-break">
            <div className="space-y-0.5">
              <p>Dihasilkan secara otomatis oleh:</p>
              <p className="font-bold text-bone-100 print:text-black text-[13px] print:text-[11px]">
                BaleKerta Cultural Spatial Engine
              </p>
              <p className="font-mono text-[10px] print:text-[8.5px] text-bone-400 print:text-gray-600">
                Sistem Pra-Inspeksi Mandiri Tata Ruang Adat &bull; Dokumen Teknis PBG
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p>Telah Diperiksa &amp; Divalidasi:</p>
              <div className="h-7 print:h-5"></div>
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
