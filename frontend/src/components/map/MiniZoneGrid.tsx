"use client";

import React, { useMemo } from "react";
import { Compass, Sparkles } from "lucide-react";

export interface MiniZoneGridProps {
  bearing: number;
  cardinalDirection: string;
  kajaQuadrant: string;
  planNorthDeg?: number;
  locationLabel?: string;
}

export const MiniZoneGrid: React.FC<MiniZoneGridProps> = ({
  bearing,
  cardinalDirection,
  kajaQuadrant,
  planNorthDeg = 0,
  locationLabel,
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

  // Corner explanation in plain Indonesian
  const cornerLabel = useMemo(() => {
    const { row, col } = sacredPos;
    if (row === 0 && col === 2) return "kanan-atas";
    if (row === 2 && col === 2) return "kanan-bawah";
    if (row === 2 && col === 0) return "kiri-bawah";
    return "kiri-atas";
  }, [sacredPos]);

  return (
    <div className="border border-ink-700 bg-ink-900 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ink-700">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-bone-400" />
          <span className="text-[14px] font-semibold text-bone-100">
            Orientasi 9 Zona (Sanga Mandala)
          </span>
        </div>
        <span className="font-mono text-[12px] text-bone-100 px-2 py-0.5 bg-ink-800 border border-ink-700 rounded">
          {bearing.toFixed(1)}° · {cardinalDirection}
        </span>
      </div>

      {locationLabel && (
        <div className="text-[12px] text-bone-400 font-mono truncate">
          {locationLabel}
        </div>
      )}

      {/* 3x3 Mini Grid */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-ink-950 border border-ink-700 rounded-md aspect-square max-w-[280px] mx-auto">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const isSacred = r === sacredPos.row && c === sacredPos.col;
            const isCenter = r === 1 && c === 1;

            return (
              <div
                key={`${r}-${c}`}
                className={`flex flex-col items-center justify-center p-1 rounded text-center transition-all ${
                  isSacred
                    ? "border-2 border-dashed border-bone-100 bg-bone-100/10 text-bone-100"
                    : isCenter
                    ? "border border-ink-700 bg-ink-900/80 text-bone-400"
                    : "border border-ink-700/60 bg-ink-900/40 text-bone-400/80"
                }`}
              >
                {isSacred ? (
                  <>
                    <Sparkles size={13} className="text-bone-100 mb-0.5" />
                    <span className="text-[11px] font-semibold text-bone-100 leading-tight">
                      Utamaning Utama
                    </span>
                    <span className="text-[9px] text-bone-100/90 font-mono">
                      (Paling Suci)
                    </span>
                  </>
                ) : isCenter ? (
                  <>
                    <span className="text-[11px] font-medium text-bone-100 leading-tight">
                      Natah
                    </span>
                    <span className="text-[9px] text-bone-400 font-mono">
                      (Halaman)
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-bone-400/90 leading-tight">
                    {r === 0 ? "Kaja" : r === 2 ? "Kelod" : ""}{" "}
                    {c === 0 ? "Kauh" : c === 2 ? "Kangin" : ""}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cultural Meaning Explanation */}
      <div className="text-[13px] text-bone-400 bg-ink-950 p-3 rounded border border-ink-700/60 leading-relaxed">
        <span className="text-bone-100 font-medium">Pengaruh pada tanah Anda:</span>{" "}
        <em>Kaja</em> adalah arah menuju Gunung Agung ({cardinalDirection} ·{" "}
        {bearing.toFixed(1)}°). Maka zona paling suci (
        <strong className="text-bone-100">Utamaning Utama</strong>, tempat{" "}
        <em>Pemerajan/Sanggah</em>) berada di{" "}
        <strong className="text-bone-100">sudut {cornerLabel}</strong> denah
        Anda.
      </div>
    </div>
  );
};
