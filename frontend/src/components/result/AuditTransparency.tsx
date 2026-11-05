"use client";

import React from "react";
import { KajaVector, AuditReport, Room } from "@/types/audit";
import { LEGAL_REGULATIONS } from "@/data/legal-basis";
import { Compass, Scale, Calculator } from "lucide-react";

export interface AuditTransparencyProps {
  kajaVector: KajaVector;
  report: AuditReport;
  rooms: Room[];
  planNorthDeg: number;
  className?: string;
}

const PENALTY_RULES = [
  { ruleId: "TOILET_IN_SACRED", title: "Sanitasi/Toilet di Zona Utamaning Utama", points: -35 },
  { ruleId: "PEMERAJAN_IN_PROFANE", title: "Pemerajan di Zona Hilir / Nista", points: -30 },
  { ruleId: "BEDROOM_IN_TEBA", title: "Kamar Tidur Utama di Zona Teba", points: -20 },
  { ruleId: "KITCHEN_IN_SACRED", title: "Dapur (Paon) di Zona Utamaning Utama", points: -20 },
  { ruleId: "NATAH_BLOCKED", title: "Halaman Tengah (Natah) Tertutup Masif", points: -15 },
  { ruleId: "KDB_EXCEEDED", title: "Kepadatan Bangunan (KDB) > 60%", points: -15 },
];

export const AuditTransparency: React.FC<AuditTransparencyProps> = ({
  kajaVector,
  report,
  rooms,
  planNorthDeg,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Geodesic & Formula Summary */}
      <div className="p-4 rounded-xl border border-ink-800 bg-ink-950/60 space-y-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-bone-100">
          <Compass size={15} className="text-bone-400" />
          <span>Parameter Geodesik &amp; Matriks Sanga Mandala</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-[12px] font-mono">
          <div className="p-2.5 rounded-lg bg-ink-900 border border-ink-800">
            <span className="text-[10.5px] text-bone-400 block">Koordinat Tapak</span>
            <span className="text-bone-100 font-semibold">
              {kajaVector.latitude.toFixed(4)}°, {kajaVector.longitude.toFixed(4)}°
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-ink-900 border border-ink-800">
            <span className="text-[10.5px] text-bone-400 block">Sudut Suci Kaja</span>
            <span className="text-bone-100 font-semibold">
              {kajaVector.bearing_degrees.toFixed(1)}° ({kajaVector.cardinal_direction})
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-ink-900 border border-ink-800">
            <span className="text-[10.5px] text-bone-400 block">Kuadran Sanggah</span>
            <span className="text-bone-100 font-semibold">
              {kajaVector.kaja_quadrant.replace(/_/g, " ")}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-ink-900 border border-ink-800">
            <span className="text-[10.5px] text-bone-400 block">Utara Denah / Ruang</span>
            <span className="text-bone-100 font-semibold">
              {planNorthDeg}° · {rooms.length} Ruang
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scoring Breakdown */}
      <div className="p-4 rounded-xl border border-ink-800 bg-ink-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-bone-100">
            <Calculator size={15} className="text-bone-400" />
            <span>Bobot Penilaian Kepatuhan</span>
          </span>
          <span className="text-[11px] font-mono text-bone-400">
            Skor = 100 − Penalti
          </span>
        </div>

        <div className="divide-y divide-ink-800 text-[12px]">
          {PENALTY_RULES.map((rule) => {
            const isFired = report.violations.some((v) => v.rule_id === rule.ruleId);
            return (
              <div
                key={rule.ruleId}
                className="py-2 flex items-center justify-between gap-2"
              >
                <span className={isFired ? "text-clay font-medium" : "text-bone-300"}>
                  {rule.title}
                </span>
                <span
                  className={`font-mono text-[11px] shrink-0 ${
                    isFired ? "text-clay font-bold" : "text-bone-400"
                  }`}
                >
                  {isFired ? `${rule.points} Poin` : "Sesuai (0)"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Legal Basis References */}
      <div className="p-4 rounded-xl border border-ink-800 bg-ink-950/60 space-y-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-bone-100">
          <Scale size={15} className="text-bone-400" />
          <span>Landasan Hukum &amp; Regulasi PBG</span>
        </div>

        <div className="space-y-2.5">
          {LEGAL_REGULATIONS.map((reg) => (
            <div
              key={reg.id}
              className="p-3 rounded-lg bg-ink-900 border border-ink-800 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-bone-100">
                  {reg.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-950 text-bone-400 border border-ink-800 shrink-0">
                  {reg.badge}
                </span>
              </div>
              <p className="text-[11.5px] text-bone-400 leading-relaxed">
                {reg.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
