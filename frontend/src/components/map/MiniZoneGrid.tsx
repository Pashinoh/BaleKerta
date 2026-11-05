"use client";

import React from "react";
import { Compass, Landmark } from "lucide-react";

export interface SangaMandalaCell {
  row: number;
  col: number;
  zone_id: string;
  balinese_name: string;
  sacred_level: string;
  label_short: string;
  allowed_summary: string;
  color_tier: "utama" | "madya" | "nista";
  compass_dir: string;
}

export interface SangaMandalaGrid {
  kaja_quadrant: string;
  plan_north_deg: number;
  cells: SangaMandalaCell[];
}

export interface MiniZoneGridProps {
  gridConfig?: SangaMandalaGrid | null;
  cardinalDirection?: string;
  kajaQuadrant?: string;
  planNorthDeg?: number;
  className?: string;
}

const SHORT_ROLE_MAP: Record<string, string> = {
  UTAMANING_UTAMA: "Sanggah / Suci",
  MADYANING_UTAMA: "Bale Daja",
  NISTANING_UTAMA: "Dapur / Sumur",
  UTAMANING_MADYA: "Bale Dangin",
  MADYANING_MADYA: "Natah (Pusat)",
  NISTANING_MADYA: "Bale Dauh",
  UTAMANING_NISTA: "Bale Delod",
  MADYANING_NISTA: "Lebuh / Pintu",
  NISTANING_NISTA: "Teba / Sanitasi",
};

const FALLBACK_CELLS: SangaMandalaCell[] = [
  { row: 0, col: 0, zone_id: "NISTANING_UTAMA", balinese_name: "Kaja Kauh", sacred_level: "Nistaning Utama", label_short: "Utama III", allowed_summary: "Dapur / Sumur", color_tier: "utama", compass_dir: "NW" },
  { row: 0, col: 1, zone_id: "MADYANING_UTAMA", balinese_name: "Kaja", sacred_level: "Madyaning Utama", label_short: "Utama II", allowed_summary: "Bale Daja", color_tier: "utama", compass_dir: "N" },
  { row: 0, col: 2, zone_id: "UTAMANING_UTAMA", balinese_name: "Kaja Kangin", sacred_level: "Utamaning Utama", label_short: "Paling Suci", allowed_summary: "Pemerajan / Sanggah", color_tier: "utama", compass_dir: "NE" },
  { row: 1, col: 0, zone_id: "NISTANING_MADYA", balinese_name: "Kauh", sacred_level: "Nistaning Madya", label_short: "Madya III", allowed_summary: "Bale Dauh", color_tier: "madya", compass_dir: "W" },
  { row: 1, col: 1, zone_id: "MADYANING_MADYA", balinese_name: "Tengah", sacred_level: "Madyaning Madya", label_short: "Pusat", allowed_summary: "Natah Terbuka", color_tier: "madya", compass_dir: "C" },
  { row: 1, col: 2, zone_id: "UTAMANING_MADYA", balinese_name: "Kangin", sacred_level: "Utamaning Madya", label_short: "Madya I", allowed_summary: "Bale Dangin", color_tier: "madya", compass_dir: "E" },
  { row: 2, col: 0, zone_id: "NISTANING_NISTA", balinese_name: "Kelod Kauh", sacred_level: "Nistaning Nista", label_short: "Teba / Hilir", allowed_summary: "Toilet / Utilitas", color_tier: "nista", compass_dir: "SW" },
  { row: 2, col: 1, zone_id: "MADYANING_NISTA", balinese_name: "Kelod", sacred_level: "Madyaning Nista", label_short: "Nista II", allowed_summary: "Angkul-Angkul", color_tier: "nista", compass_dir: "S" },
  { row: 2, col: 2, zone_id: "UTAMANING_NISTA", balinese_name: "Kelod Kangin", sacred_level: "Utamaning Nista", label_short: "Nista I", allowed_summary: "Paon / Jineng", color_tier: "nista", compass_dir: "SE" },
];

export function sacredCornerLabel(kajaQuadrant?: string): string {
  switch (kajaQuadrant) {
    case "TOP_RIGHT":
      return "kanan-atas";
    case "BOTTOM_RIGHT":
      return "kanan-bawah";
    case "BOTTOM_LEFT":
      return "kiri-bawah";
    case "TOP_LEFT":
      return "kiri-atas";
    default:
      return "kanan-atas";
  }
}

export const MiniZoneGrid: React.FC<MiniZoneGridProps> = ({
  gridConfig,
  cardinalDirection = "Timur Laut (NE)",
  className = "",
}) => {
  const cells =
    gridConfig?.cells && gridConfig.cells.length === 9
      ? gridConfig.cells
      : FALLBACK_CELLS;

  const sortedCells = [...cells].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-bone-400">
          Matriks 9 Zona Sanga Mandala
        </span>
        <span className="text-[11px] font-mono text-bone-300 flex items-center gap-1">
          <Compass size={12} className="text-bone-400" />
          <span>Kaja: {cardinalDirection}</span>
        </span>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {sortedCells.map((cell) => {
          const isMostSacred = cell.zone_id === "UTAMANING_UTAMA";
          const isMostProfane = cell.zone_id === "NISTANING_NISTA";
          const isCenter = cell.zone_id === "MADYANING_MADYA";
          const roleText = SHORT_ROLE_MAP[cell.zone_id] || cell.allowed_summary;

          return (
            <div
              key={`${cell.row}-${cell.col}`}
              className={`p-2.5 rounded-lg border flex flex-col justify-between min-h-[60px] transition-colors ${
                isMostSacred
                  ? "bg-bone-100 text-ink-950 border-bone-100 shadow-sm"
                  : isMostProfane
                  ? "bg-clay/10 border-clay/50 text-bone-100"
                  : isCenter
                  ? "bg-ink-800 border-ink-600 text-bone-100"
                  : "bg-ink-950 border-ink-800 text-bone-200"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-[11.5px] font-bold leading-tight ${
                    isMostSacred ? "text-ink-950" : "text-bone-100"
                  }`}
                >
                  {cell.balinese_name}
                </span>
                {isMostSacred && <Landmark size={12} className="text-ink-950 shrink-0" />}
              </div>

              <span
                className={`text-[10.5px] leading-tight mt-1 ${
                  isMostSacred
                    ? "text-ink-900 font-medium"
                    : isMostProfane
                    ? "text-clay font-medium"
                    : "text-bone-400"
                }`}
              >
                {roleText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniZoneGrid;
