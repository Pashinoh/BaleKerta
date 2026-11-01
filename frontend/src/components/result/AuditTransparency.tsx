"use client";

import React, { useState } from "react";
import { KajaVector, AuditReport, Room } from "@/types/audit";
import { LEGAL_REGULATIONS } from "@/data/legal-basis";
import {
  Calculator,
  Scale,
  ShieldCheck,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface AuditTransparencyProps {
  kajaVector: KajaVector;
  report: AuditReport;
  rooms: Room[];
  planNorthDeg: number;
  className?: string;
}

export const AuditTransparency: React.FC<AuditTransparencyProps> = ({
  kajaVector,
  report,
  rooms,
  planNorthDeg,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"calc" | "law">("calc");
  const [expandedReg, setExpandedReg] = useState<string>("perda-bali-5-2005");

  // Penalty weights reference table
  const PENALTY_RULES = [
    {
      ruleId: "TOILET_IN_SACRED",
      title: "Toilet/Sanitasi di Zona Utamaning Utama",
      severity: "CRITICAL",
      points: -35,
      legalRef: "Perda Bali No. 5/2005 & Asta Bumi",
    },
    {
      ruleId: "PEMERAJAN_IN_PROFANE",
      title: "Tempat Suci (Pemerajan) di Zona Hilir / Nista",
      severity: "CRITICAL",
      points: -30,
      legalRef: "Asta Bumi & Perda Bali No. 5/2005",
    },
    {
      ruleId: "BEDROOM_IN_TEBA",
      title: "Kamar Tidur Utama di Zona Teba (Nistaning Nista)",
      severity: "WARNING",
      points: -20,
      legalRef: "Asta Kosala-Kosali",
    },
    {
      ruleId: "KITCHEN_IN_SACRED",
      title: "Dapur (Paon) di Zona Utamaning Utama",
      severity: "WARNING",
      points: -20,
      legalRef: "Asta Kosala-Kosali (Dewa Brahma)",
    },
    {
      ruleId: "NATAH_BLOCKED",
      title: "Halaman Tengah (Natah) Tertutup Struktur Masif",
      severity: "WARNING",
      points: -15,
      legalRef: "Asta Bumi (Keseimbangan Akasa-Pertiwi)",
    },
    {
      ruleId: "KDB_EXCEEDED",
      title: "Luas Bangunan Melebihi Batas KDB Maksimal 60%",
      severity: "WARNING",
      points: -15,
      legalRef: "Perda Bali No. 5/2005 Pasal 12",
    },
  ];

  return (
    <section
      id="transparansi-sistem"
      className={`bg-ink-900 border border-ink-700 rounded-xl p-5 sm:p-7 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-ink-950 border border-ink-700 text-bone-300">
              Dokumentasi Teknis & Yuridis
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-bone-100/10 text-bone-100 border border-bone-100/30">
              Verifikasi Teknis &amp; Tim Ahli TABG
            </span>
          </div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-bone-100 tracking-tight">
            Transparansi Perhitungan Sistem & Rujukan Hukum PBG
          </h2>
          <p className="text-[13px] text-bone-400 max-w-3xl leading-relaxed">
            Perincian formula matematis geodesik, algoritma penilaian kepatuhan adat,
            serta pasal-pasal Perda Provinsi Bali No. 5/2005 dan UU Bangunan Gedung yang menjadi landasan audit sistem.
          </p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex items-center bg-ink-950 p-1 rounded-lg border border-ink-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("calc")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-[13px] font-medium transition-all ${
              activeTab === "calc"
                ? "bg-bone-100 text-ink-950 shadow-sm font-semibold"
                : "text-bone-400 hover:text-bone-100"
            }`}
          >
            <Calculator size={15} />
            <span>Hitungan Sistem</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("law")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-[13px] font-medium transition-all ${
              activeTab === "law"
                ? "bg-bone-100 text-ink-950 shadow-sm font-semibold"
                : "text-bone-400 hover:text-bone-100"
            }`}
          >
            <Scale size={15} />
            <span>Dasar Hukum & Perda</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: HITUNGAN SISTEM (MATEMATIKA GEODESIK & ALGORITMA PENILAIAN)  */}
      {/* ==================================================================== */}
      {activeTab === "calc" && (
        <div className="space-y-6">
          {/* Top Row: Formula 1 (Geodesik) & Formula 2 (Rotasi Sanga Mandala) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Forward Azimuth & Haversine Distance */}
            <div className="bg-ink-950 border border-ink-800 rounded-lg p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-ink-800">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-bone-100" />
                  <h3 className="text-[14px] font-semibold text-bone-100">
                    1. Hitungan Geodesik Sudut Kaja & Jarak
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-bone-400">Spherical Trigonometry</span>
              </div>

              {/* Intuitive Geodesic Calculation Card */}
              <div className="bg-ink-900 border border-ink-800 p-3 rounded font-mono text-[12px] text-bone-300 space-y-2 leading-relaxed">
                <div className="text-bone-100 font-semibold flex items-center justify-between">
                  <span>Metode Penentuan Arah Suci Kaja:</span>
                  <span className="text-[11px] text-bone-400 font-normal">Sumbu Geodesik</span>
                </div>
                <p className="text-bone-300 text-[11.5px] font-sans">
                  Sistem menarik garis lurus lengkung bumi dari titik GPS tanah Anda langsung menuju puncak Gunung Agung (3.142 mdpl). Arah kompas hasil tarikan garis ini menjadi poros suci pekarangan.
                </p>
                <div className="pt-1.5 border-t border-ink-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-bone-400 block text-[10px]">Arah Kompas Kaja:</span>
                    <strong className="text-bone-100">{kajaVector.bearing_degrees.toFixed(1)}&deg; ({kajaVector.cardinal_direction})</strong>
                  </div>
                  <div>
                    <span className="text-bone-400 block text-[10px]">Jarak Tapak ke Puncak:</span>
                    <strong className="text-bone-100">{kajaVector.distance_km != null ? `${kajaVector.distance_km.toFixed(1)} km` : "Terpetakan"}</strong>
                  </div>
                </div>
              </div>

              {/* Real Parameters Input & Substitution */}
              <div className="space-y-1.5 text-[12px]">
                <div className="text-bone-400 font-mono">Parameter Masukan Tapak Nyata:</div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-ink-900 rounded border border-ink-800/80">
                    <span className="text-bone-400 block">Tapak Tanah:</span>
                    <span className="text-bone-100 font-semibold">{kajaVector.latitude.toFixed(4)}°, {kajaVector.longitude.toFixed(4)}°</span>
                    <span className="text-bone-400 block text-[10px]">({kajaVector.location})</span>
                  </div>
                  <div className="p-2 bg-ink-900 rounded border border-ink-800/80">
                    <span className="text-bone-400 block">Puncak Gn. Agung:</span>
                    <span className="text-bone-100 font-semibold">-8.3433°, 115.5071°</span>
                    <span className="text-bone-400 block text-[10px]">(Elevasi 3.142 mdpl)</span>
                  </div>
                </div>
              </div>

              {/* Live Calculation Output */}
              <div className="p-2.5 bg-bone-100/5 border border-bone-100/20 rounded flex items-center justify-between text-[12px] font-mono">
                <div>
                  <span className="text-bone-400 block text-[11px]">Hasil Kalkulasi Geodesik:</span>
                  <span className="text-bone-100 font-bold text-[13px]">
                    Sudut θ = {kajaVector.bearing_degrees.toFixed(1)}° ({kajaVector.cardinal_direction})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-bone-400 block text-[11px]">Jarak Tapak ke Puncak:</span>
                  <span className="text-bone-100 font-bold text-[13px]">
                    {kajaVector.distance_km != null ? `${kajaVector.distance_km.toFixed(1)} km` : "Terhitung"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Dynamic Sanga Mandala Grid Matrix Transformation */}
            <div className="bg-ink-950 border border-ink-800 rounded-lg p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-ink-800">
                <div className="flex items-center gap-2">
                  <Calculator size={16} className="text-bone-100" />
                  <h3 className="text-[14px] font-semibold text-bone-100">
                    2. Transformasi Matriks 9 Zona (Sanga Mandala)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-bone-400">Dynamic 3x3 Grid</span>
              </div>

              {/* Intuitive Sanga Mandala Mapping */}
              <div className="bg-ink-900 border border-ink-800 p-3 rounded font-mono text-[12px] text-bone-300 space-y-2 leading-relaxed">
                <div className="text-bone-100 font-semibold flex items-center justify-between">
                  <span>Prinsip Pembagian 9 Zona Adat:</span>
                  <span className="text-[11px] text-bone-400 font-normal">3 Baris &times; 3 Kolom</span>
                </div>
                <p className="text-bone-300 text-[11.5px] font-sans">
                  Pekarangan dibagi menjadi 9 zona secara proporsional. Sudut paling suci (Utamaning Utama) otomatis diputar menghadap arah Gunung Agung, sedangkan Natah dikunci di pusat pekarangan.
                </p>
                <div className="pt-1.5 border-t border-ink-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-bone-400">Posisi Tempat Suci (Sanggah):</span>
                  <strong className="text-bone-100 bg-ink-950 px-2 py-0.5 rounded border border-ink-700">
                    Pojok {kajaVector.kaja_quadrant.replace(/_/g, " ")}
                  </strong>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10.5px] font-mono text-bone-400">
                  <span>Arah Hadap Gambar Denah:</span>
                  <span>Sisi Atas Menghadap {planNorthDeg}&deg; (Utara)</span>
                </div>
              </div>

              {/* Dynamic Sanga Mandala Matrix Preview */}
              <div className="space-y-1.5 text-[12px]">
                <div className="text-bone-400 font-mono">Orientasi Matriks Zona Berdasarkan Tapak:</div>
                <div className="p-3 bg-ink-900 rounded border border-ink-800/80 space-y-1.5 text-[11px] font-mono text-bone-300">
                  <div className="flex items-center justify-between">
                    <span>Sumbu Suci Tertinggi (Utamaning Utama):</span>
                    <strong className="text-bone-100 bg-ink-950 px-2 py-0.5 rounded border border-ink-700">
                      Kuadran {kajaVector.kaja_quadrant}
                    </strong>
                  </div>
                  <p className="text-[11px] text-bone-400 leading-normal">
                    Di wilayah {kajaVector.location}, poros suci Gunung Agung berada pada sudut{" "}
                    <strong>{kajaVector.bearing_degrees.toFixed(1)}°</strong>. Sistem secara otomatis
                    menempatkan zona sakral (Pemerajan) pada sudut tersebut dan mengunci Natah tepat di titik centroid (0.5, 0.5).
                  </p>
                </div>
              </div>

              {/* Room Centroid Mapping Explanation */}
              <div className="p-2.5 bg-ink-900 border border-ink-800 rounded text-[11px] font-mono text-bone-400">
                <strong className="text-bone-100 block mb-0.5">Metode Klasifikasi Spasial AI:</strong>
                Centroid ruangan dihitung dari bounding box [ymin, xmin, ymax, xmax] dan dipetakan ke koordinat sel [row, col] kisi 3x3 yang telah terotasi.
              </div>
            </div>
          </div>

          {/* Bottom Row: Formula 3 (KDB) & Formula 4 (Scoring Matrix Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 3: Koefisien Dasar Bangunan (KDB) */}
            <div className="bg-ink-950 border border-ink-800 rounded-lg p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-ink-800">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-bone-100" />
                  <h3 className="text-[14px] font-semibold text-bone-100">
                    3. Perhitungan Koefisien Dasar Bangunan (KDB)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-bone-400">Perda No. 5/2005 Ps. 12</span>
              </div>

              {/* Intuitive KDB Formula */}
              <div className="bg-ink-900 border border-ink-800 p-3 rounded font-mono text-[12px] text-bone-300 space-y-2 leading-relaxed">
                <div className="text-bone-100 font-semibold flex items-center justify-between">
                  <span>Rumus Kepadatan Bangunan (KDB):</span>
                  <span className="text-[11px] text-bone-400 font-normal">Maks. 60.0%</span>
                </div>
                <div className="p-2 bg-ink-950 rounded border border-ink-800 text-[12px] text-bone-100 font-bold text-center">
                  (Luas Bangunan Beratap &divide; Luas Total Tanah) &times; 100%
                </div>
                <p className="text-bone-400 text-[11px] font-sans">
                  Halaman terbuka seperti Natah dan Taman dihitung sebagai Ruang Terbuka Hijau (daerah resapan), bukan bangunan beratap.
                </p>
              </div>

              {/* Real Calculation Breakdown */}
              <div className="space-y-2 text-[12px] font-mono">
                <div className="p-3 bg-ink-900 rounded border border-ink-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-bone-400">Jumlah Ruangan Terdeteksi:</span>
                    <span className="text-bone-100 font-semibold">{rooms.length} Ruangan</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-bone-400">Rasio Luas Terbangun:</span>
                    <span className="text-bone-100 font-semibold">{report.kdb_percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-ink-800">
                    <span className="text-bone-400">Ambang Batas Regulasi:</span>
                    <span className="text-bone-100">Maks. 60.0%</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-ink-800">
                    <span className="text-bone-400">Status Kepatuhan:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        report.kdb_percentage <= 60
                          ? "bg-bone-100/10 text-bone-100 border border-bone-100/30"
                          : "bg-clay/10 text-clay border border-clay"
                      }`}
                    >
                      {report.kdb_percentage <= 60
                        ? "MEMENUHI PERSYARATAN (≤ 60%)"
                        : "MELAMPAUI BATAS MAKSIMAL (> 60%)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Algoritma Penilaian Skor Kepatuhan (Scoring Engine Breakdown) */}
            <div className="bg-ink-950 border border-ink-800 rounded-lg p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-ink-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-bone-100" />
                  <h3 className="text-[14px] font-semibold text-bone-100">
                    4. Matriks Bobot Penalti & Formulasi Skor Kepatuhan
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-bone-400">Auditing Matrix</span>
              </div>

              {/* Intuitive Scoring Formula */}
              <div className="bg-ink-900 border border-ink-800 p-3 rounded font-mono text-[12px] text-bone-300 space-y-2 leading-relaxed">
                <div className="text-bone-100 font-semibold flex items-center justify-between">
                  <span>Rumus Nilai Kepatuhan Adat:</span>
                  <span className="text-[11px] text-bone-400 font-normal">Skala 0 &ndash; 100</span>
                </div>
                <div className="p-2 bg-ink-950 rounded border border-ink-800 text-[12px] text-bone-100 font-bold text-center">
                  Nilai Akhir = 100 Poin &minus; Total Potongan Penalti
                </div>
                <p className="text-bone-400 text-[11px] font-sans">
                  Sistem berawal dari nilai dasar 100. Poin hanya berkurang jika terdapat ruangan yang menyimpang dari hierarki kesucian atau melanggar KDB.
                </p>
              </div>

              {/* Summary Calculation of Current Plan */}
              <div className="p-3 bg-ink-900 rounded border border-ink-800/80 space-y-2 text-[12px] font-mono">
                <div className="flex items-center justify-between text-bone-400">
                  <span>Skor Sempurna (Baseline):</span>
                  <span className="text-bone-100">100 Poin</span>
                </div>

                {report.violations.length === 0 ? (
                  <div className="flex items-center justify-between text-bone-400">
                    <span>Total Pengurangan Penalti:</span>
                    <span className="text-bone-100 font-bold">0 Poin (Nir-Pelanggaran)</span>
                  </div>
                ) : (
                  <div className="space-y-1 pt-1 border-t border-ink-800">
                    <span className="text-bone-400 block text-[11px]">Rincian Penalti yang Dikenakan:</span>
                    {report.violations.map((v, i) => {
                      const matchedRule = PENALTY_RULES.find((r) => r.ruleId === v.rule_id);
                      const pts = matchedRule ? matchedRule.points : -20;
                      return (
                        <div key={v.id || i} className="flex items-center justify-between text-clay text-[11px]">
                          <span>• {v.room_name} ({v.rule_id}):</span>
                          <span className="font-bold">{pts} Poin</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-ink-700">
                  <span className="text-bone-100 font-bold">Skor Akhir Kepatuhan:</span>
                  <span className="text-[14px] font-bold text-bone-100 px-2.5 py-0.5 rounded bg-ink-950 border border-ink-700">
                    {report.compliance_score} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Table: Standard System Penalty Weights */}
          <div className="p-4 bg-ink-950 border border-ink-800 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800 pb-2.5">
              <div>
                <h4 className="text-[13px] font-semibold text-bone-100">
                  Katalog Acuan Regulasi &amp; Kamus Bobot Penalti Sistem
                </h4>
                <p className="text-[11px] text-bone-400">
                  Kamus standar pengujian: rincian bobot pengurangan skor yang dikenakan <em>hanya jika</em> denah terdeteksi melanggar aturan di bawah ini.
                </p>
              </div>
              <span className="text-[11px] font-mono text-bone-400 font-normal shrink-0">
                Standar Regulasi TABG
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] font-mono border border-ink-800">
                <thead className="bg-ink-900 text-bone-400 border-b border-ink-800 text-[11px]">
                  <tr>
                    <th className="p-2.5">Aturan Sistem</th>
                    <th className="p-2.5">Kondisi Pelanggaran</th>
                    <th className="p-2.5">Tingkat</th>
                    <th className="p-2.5">Bobot</th>
                    <th className="p-2.5">Status pada Denah Anda</th>
                    <th className="p-2.5">Rujukan Regulasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800 text-bone-300 text-[11px]">
                  {PENALTY_RULES.map((rule) => {
                    const isFired = report.violations.some((v) => v.rule_id === rule.ruleId);
                    return (
                      <tr
                        key={rule.ruleId}
                        className={isFired ? "bg-clay/10 text-clay font-semibold" : "hover:bg-ink-900/60"}
                      >
                        <td className="p-2.5 font-bold">{rule.ruleId}</td>
                        <td className="p-2.5">{rule.title}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              rule.severity === "CRITICAL"
                                ? "bg-clay/20 text-clay border border-clay/40"
                                : "bg-ink-900 text-bone-400 border border-ink-700"
                            }`}
                          >
                            {rule.severity}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold">{rule.points} Poin</td>
                        <td className="p-2.5">
                          {isFired ? (
                            <span className="text-clay font-bold">
                              Terlanggar ({rule.points} Poin)
                            </span>
                          ) : (
                            <span className="text-bone-400 text-[10.5px]">
                              Sesuai Adat (0 Poin)
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-bone-400">{rule.legalRef}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: DASAR HUKUM & REGULASI PBG (PERDA & UU NASIONAL)             */}
      {/* ==================================================================== */}
      {activeTab === "law" && (
        <div className="space-y-4">
          <div className="p-3.5 bg-ink-950 border border-ink-800 rounded-lg text-[13px] text-bone-400 leading-relaxed">
            <strong className="text-bone-100 block mb-1">
              Kedudukan Yuridis Pra-Pemeriksaan Arsitektur Tradisional Bali:
            </strong>
            Pemeriksaan tata ruang pekarangan berbasis <em>Asta Kosala-Kosali</em> dan <em>Asta Bumi</em> bukan
            sekadar konvensi budaya informal, melainkan mandat normatif resmi yang diatur dalam hierarki peraturan
            perundang-undangan Republik Indonesia dan Peraturan Daerah Provinsi Bali sebagai prasyarat pertimbangan
            teknis penerbitan <strong>Persetujuan Bangunan Gedung (PBG)</strong>.
          </div>

          {/* Accordion / List of Legal Regulations */}
          <div className="space-y-3">
            {LEGAL_REGULATIONS.map((reg) => {
              const isExpanded = expandedReg === reg.id;
              return (
                <div
                  key={reg.id}
                  className="border border-ink-800 bg-ink-950 rounded-lg overflow-hidden transition-all"
                >
                  {/* Header bar */}
                  <button
                    type="button"
                    onClick={() => setExpandedReg(isExpanded ? "" : reg.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-ink-900 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ink-900 border border-ink-700 text-bone-300">
                          {reg.badge}
                        </span>
                        <h3 className="text-[15px] font-semibold text-bone-100 truncate">
                          {reg.title}
                        </h3>
                      </div>
                      <p className="text-[12px] text-bone-400">{reg.subtitle}</p>
                    </div>

                    <div className="shrink-0 text-bone-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Expanded Articles Content */}
                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-ink-850 space-y-3">
                      {reg.articles.map((art, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-ink-900 rounded border border-ink-800 space-y-2 text-[13px]"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-ink-800 pb-1.5">
                            <span className="font-bold text-bone-100 font-mono text-[13px]">
                              {art.article}
                            </span>
                            <span className="text-[11px] font-mono text-bone-400 bg-ink-950 px-2 py-0.5 rounded border border-ink-800">
                              {art.topic}
                            </span>
                          </div>

                          {/* Official Text Quote */}
                          <blockquote className="text-bone-300 italic pl-3 border-l-2 border-bone-100/60 leading-relaxed text-[12px]">
                            &ldquo;{art.text}&rdquo;
                          </blockquote>

                          {/* Technical Implication for Engine */}
                          <div className="p-2.5 bg-ink-950 rounded border border-ink-800/80 text-[12px] text-bone-400 leading-relaxed">
                            <strong className="text-bone-100 block mb-0.5 font-mono text-[11px]">
                              Implementasi Algoritma BaleKerta:
                            </strong>
                            {art.implication}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
