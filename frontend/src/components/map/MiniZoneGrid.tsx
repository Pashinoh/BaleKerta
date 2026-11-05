"use client";

import React, { useMemo } from "react";
import { Compass, Landmark } from "lucide-react";

export interface SangaMandalaCell {
  row: number;
  col: number;
  zone_id: string;
  box: [number, number, number, number];
  center: [number, number];
}

export interface SangaMandalaGrid {
  kaja_quadrant: string;
  plan_north_deg: number;
  sacred_row_col: [number, number] | null;
  lot_bounds: [number, number, number, number];
  grid_matrix: string[][];
  cells: SangaMandalaCell[];
}

export interface MiniZoneGridProps {
  gridConfig?: SangaMandalaGrid | null;
  cardinalDirection?: string;
  kajaQuadrant?: string;
  planNorthDeg?: number;
  locationLabel?: string;
}

function cardinalSingular(cardinal?: string): string {
  if (!cardinal) return "Timur";
  const map: Record<string, string> = {
    "Timur Laut (NE)": "Timur Laut",
    "Timur (E)": "Timur",
    "Timur Daya (SE)": "Timur Daya",
    "Selatan (S)": "Selatan",
    "Barat Daya (SW)": "Barat Daya",
    "Barat (W)": "Barat",
    "Barat Laut (NW)": "Barat Laut",
    "Utara (N)": "Utara",
  };
  return map[cardinal] || cardinal.replace(/\s*\([A-Z]{1,2}\)/, "");
}

function cornerCapitalized(corner: string): string {
  const map: Record<string, string> = {
    "kanan-atas": "Sudut Kanan Atas",
    "kanan-bawah": "Sudut Kanan Bawah",
    "kiri-bawah": "Sudut Kiri Bawah",
    "kiri-atas": "Sudut Kiri Atas",
  };
  return map[corner] || corner;
}

export function sacredCornerLabel(
  kajaQuadrant: string = "TOP_RIGHT",
  planNorthDeg: number = 0
): "kanan-atas" | "kanan-bawah" | "kiri-bawah" | "kiri-atas" {
  let baseRow = 0;
  let baseCol = 2;

  if (kajaQuadrant === "BOTTOM_RIGHT") {
    baseRow = 2;
    baseCol = 2;
  } else if (kajaQuadrant === "TOP_LEFT") {
    baseRow = 0;
    baseCol = 0;
  } else if (kajaQuadrant === "BOTTOM_LEFT") {
    baseRow = 2;
    baseCol = 0;
  }

  const steps = (Math.floor(planNorthDeg) / 90) % 4;
  let r = baseRow;
  let c = baseCol;
  for (let i = 0; i < steps; i++) {
    const nextR = c;
    const nextC = 2 - r;
    r = nextR;
    c = nextC;
  }

  if (r === 0 && c === 2) return "kanan-atas";
  if (r === 2 && c === 2) return "kanan-bawah";
  if (r === 2 && c === 0) return "kiri-bawah";
  return "kiri-atas";
}

export const MiniZoneGrid: React.FC<MiniZoneGridProps> = ({
  gridConfig,
  cardinalDirection,
  kajaQuadrant = "TOP_RIGHT",
  planNorthDeg = 0,
}) => {
  const cornerLabel = gridConfig?.sacred_row_col
    ? (() => {
        const [r, c] = gridConfig.sacred_row_col;
        if (r === 0 && c === 2) return "kanan-atas";
        if (r === 2 && c === 2) return "kanan-bawah";
        if (r === 2 && c === 0) return "kiri-bawah";
        return "kiri-atas";
      })()
    : sacredCornerLabel(kajaQuadrant, planNorthDeg);

  const sacredPos = useMemo(() => {
    if (gridConfig?.sacred_row_col) {
      return { row: gridConfig.sacred_row_col[0], col: gridConfig.sacred_row_col[1] };
    }
    const c = sacredCornerLabel(kajaQuadrant, planNorthDeg);
    if (c === "kanan-atas") return { row: 0, col: 2 };
    if (c === "kanan-bawah") return { row: 2, col: 2 };
    if (c === "kiri-bawah") return { row: 2, col: 0 };
    return { row: 0, col: 0 };
  }, [gridConfig?.sacred_row_col, kajaQuadrant, planNorthDeg]);

  const cells = gridConfig?.cells || [];
  const cornerCap = cornerCapitalized(cornerLabel);
  const cardSingular = cardinalSingular(cardinalDirection);

  return (
    <div className="space-y-3">
      {/* 3x3 Sanga Mandala Matrix */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-ink-950 border border-ink-700 rounded-xl aspect-square max-w-[290px] mx-auto">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const isSacred = r === sacredPos.row && c === sacredPos.col;
            const isCenter = r === 1 && c === 1;
            const isTeba = r === 2 - sacredPos.row && c === 2 - sacredPos.col;

            const cellData = cells.find((cell) => cell.row === r && cell.col === c);
            const zoneId = cellData?.zone_id;

            let cellClass =
              "flex flex-col items-center justify-center p-1.5 rounded-lg text-center transition-colors border ";
            if (isSacred) {
              cellClass +=
                "bg-bone-100 text-ink-950 border-bone-100 font-semibold shadow-sm";
            } else if (isCenter) {
              cellClass +=
                "bg-ink-900 border-ink-600 text-bone-100";
            } else if (isTeba) {
              cellClass +=
                "bg-clay/10 border-clay/50 text-clay";
            } else {
              cellClass +=
                "bg-ink-900/60 border-ink-700 text-bone-300";
            }

            return (
              <div key={`${r}-${c}`} className={cellClass}>
                {isSacred ? (
                  <>
                    <Landmark size={14} className="text-ink-950 mb-0.5" aria-hidden="true" />
                    <span className="text-[11px] font-bold text-ink-950 leading-tight">
                      Utamaning Utama
                    </span>
                    <span className="text-[9.5px] text-ink-950/80 font-mono mt-0.5">
                      Sanggah / Suci
                    </span>
                  </>
                ) : isCenter ? (
                  <>
                    <span className="text-[11.5px] font-bold text-bone-100 leading-tight">
                      Natah
                    </span>
                    <span className="text-[9.5px] text-bone-400 font-mono mt-0.5">
                      Halaman Tengah
                    </span>
                  </>
                ) : isTeba ? (
                  <>
                    <span className="text-[10.5px] font-semibold leading-tight">
                      Nistaning Nista
                    </span>
                    <span className="text-[9.5px] font-mono opacity-85 mt-0.5">
                      Teba / Sanitasi
                    </span>
                  </>
                ) : zoneId ? (
                  <span className="text-[10.5px] font-medium leading-tight px-1">
                    {zoneId
                      .split("_")
                      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                      .join(" ")}
                  </span>
                ) : (
                  <span className="text-[10.5px] font-medium leading-tight">
                    {r === 0 ? "Kaja" : r === 2 ? "Kelod" : ""}{" "}
                    {c === 0 ? "Kauh" : c === 2 ? "Kangin" : ""}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cultural Orientation Legend */}
      <div className="text-[12px] text-bone-300 bg-ink-950 p-3 rounded-lg border border-ink-700 leading-relaxed space-y-1">
        <div className="flex items-start gap-2">
          <Compass size={14} className="text-bone-100 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong className="text-bone-100">Poros Kaja:</strong> Menghadap ke Gunung Agung ({cardSingular}).
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Landmark size={14} className="text-bone-100 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong className="text-bone-100">Kuadran Sanggah:</strong> Berada di{" "}
            <span className="text-bone-100 font-semibold">{cornerCap}</span> denah Anda.
          </span>
        </div>
      </div>
    </div>
  );
};
