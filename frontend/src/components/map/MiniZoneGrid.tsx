"use client";

import React, { useMemo } from "react";
import { Sparkles, Compass, Landmark } from "lucide-react";

export interface MiniZoneGridProps {
  bearing?: number;
  cardinalDirection?: string;
  kajaQuadrant: string;
  planNorthDeg?: number;
  locationLabel?: string;
}

export function sacredCornerLabel(
  kajaQuadrant: string,
  planNorthDeg: number = 0
): "kanan-atas" | "kanan-bawah" | "kiri-bawah" | "kiri-atas" {
  let baseRow = 0;
  let baseCol = 2; // TOP_RIGHT default

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

// Helper: cardinal direction to singular Indonesian
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

// Helper: corner label to capitalized Indonesian
function cornerCapitalized(corner: string): string {
  const map: Record<string, string> = {
    "kanan-atas": "Sudut Kanan Atas",
    "kanan-bawah": "Sudut Kanan Bawah",
    "kiri-bawah": "Sudut Kiri Bawah",
    "kiri-atas": "Sudut Kiri Atas",
  };
  return map[corner] || corner;
}

export const MiniZoneGrid: React.FC<MiniZoneGridProps> = ({
  kajaQuadrant,
  planNorthDeg = 0,
  cardinalDirection,
}) => {
  // Determine sacred cell (row, col) based on quadrant and plan rotation
  const sacredPos = useMemo(() => {
    let baseRow = 0;
    let baseCol = 2; // TOP_RIGHT default

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

    // Rotate matrix (steps of 90 deg clockwise)
    const steps = (Math.floor(planNorthDeg) / 90) % 4;
    let r = baseRow;
    let c = baseCol;
    for (let i = 0; i < steps; i++) {
      const nextR = c;
      const nextC = 2 - r;
      r = nextR;
      c = nextC;
    }
    return { row: r, col: c };
  }, [kajaQuadrant, planNorthDeg]);

  const cornerLabel = sacredCornerLabel(kajaQuadrant, planNorthDeg);
  const cardSingular = cardinalSingular(cardinalDirection);
  const cornerCap = cornerCapitalized(cornerLabel);

  return (
    <div>
      {/* 3x3 Mini Grid */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-ink-950 border border-ink-700 rounded-md aspect-square max-w-[280px] mx-auto">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const isSacred = r === sacredPos.row && c === sacredPos.col;
            const isCenter = r === 1 && c === 1;
            const isMadya = isCenter || (r === 1 && c !== 1) || (c === 1 && r !== 1); // center + 4 cardinal sides

            let cellClass = "flex flex-col items-center justify-center p-1 rounded text-center transition-all border border-ink-700 ";
            if (isSacred) {
              cellClass += "bg-bone-100 text-ink-950 border-bone-100";
            } else if (isMadya) {
              cellClass += "bg-bone-100/15 text-bone-100";
            } else {
              cellClass += "bg-ink-950/50 text-bone-400";
            }

            return (
              <div
                key={`${r}-${c}`}
                className={cellClass}
              >
                {isSacred ? (
                  <>
                    <Sparkles size={15} className="text-ink-950 mb-0.5" />
                    <span className="text-[15px] font-semibold text-ink-950 leading-tight">
                      Utamaning Utama
                    </span>
                    <span className="text-[13px] text-ink-950 font-mono">
                      (Paling Suci)
                    </span>
                  </>
                ) : isCenter ? (
                  <>
                    <span className="text-[15px] font-medium text-bone-100 leading-tight">
                      Natah
                    </span>
                    <span className="text-[13px] text-bone-100 font-mono">
                      (Halaman)
                    </span>
                  </>
                ) : (
                  <span className="text-[15px] leading-tight">
                    {r === 0 ? "Kaja" : r === 2 ? "Kelod" : ""}{" "}
                    {c === 0 ? "Kauh" : c === 2 ? "Kangin" : ""}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cultural Meaning Explanation - simplified human-friendly */}
      <div className="mt-3 text-[13px] text-bone-300 bg-ink-950 p-3 rounded border border-ink-700/60 leading-relaxed">
        <Compass size={14} className="inline-block mr-1 text-bone-100" />
        Kaja = arah ke Gunung Agung ({cardSingular}).{" "}
        <Landmark size={14} className="inline-block mr-1 text-bone-100" />
        Area suci (Utamaning Utama, tempat Sanggah/Pemerajan) = {cornerCap} denah Anda.
      </div>
    </div>
  );
};