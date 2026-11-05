"use client";

import React, { useState } from "react";
import { GridLayout, Room, Violation } from "@/types/audit";
import { Compass, Eye, EyeOff, Grid } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

export interface PlanCanvasProps {
  imageSrc?: string | null;
  gridLayout?: GridLayout | null;
  rooms: Room[];
  violations: Violation[];
  hoveredIndex: number | null;
  selectedIndex: number | null;
  onHoverIndex: (index: number | null) => void;
  onSelectIndex: (index: number | null) => void;
  kajaBearing?: number;
  kajaDirection?: string;
  className?: string;
}

export const PlanCanvas: React.FC<PlanCanvasProps> = ({
  imageSrc,
  gridLayout,
  rooms,
  violations,
  hoveredIndex,
  selectedIndex,
  onHoverIndex,
  onSelectIndex,
  kajaBearing = 41.7,
  kajaDirection = "Timur Laut (NE)",
  className = "",
}) => {
  const { theme } = useTheme();
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const isPaper = theme === "light";

  const isRoomViolating = (room: Room): boolean => {
    return violations.some((v) => {
      if (v.box && room.box) {
        const [vy1, vx1, vy2, vx2] = v.box;
        const [ry1, rx1, ry2, rx2] = room.box;
        if (vy1 === ry1 && vx1 === rx1 && vy2 === ry2 && vx2 === rx2) {
          return true;
        }
      }
      return v.room_name.toLowerCase() === room.name.toLowerCase();
    });
  };

  const getWallFillColor = (
    room: Room,
    isViolating: boolean,
    isActive: boolean
  ): string => {
    if (isViolating) {
      if (isPaper) {
        return isActive ? "rgba(184, 67, 34, 0.25)" : "rgba(184, 67, 34, 0.14)";
      }
      return isActive ? "rgba(224, 109, 75, 0.35)" : "rgba(224, 109, 75, 0.20)";
    }
    const val = (room.zone?.zone_id || "").toLowerCase();
    if (isPaper) {
      if (val.includes("utama")) {
        return isActive ? "rgba(28, 25, 22, 0.18)" : "rgba(28, 25, 22, 0.08)";
      }
      if (val.includes("madya")) {
        return isActive ? "rgba(87, 80, 71, 0.16)" : "rgba(87, 80, 71, 0.06)";
      }
      return isActive ? "rgba(122, 114, 103, 0.18)" : "rgba(122, 114, 103, 0.08)";
    }
    if (val.includes("utama")) {
      return isActive ? "rgba(240, 234, 225, 0.24)" : "rgba(240, 234, 225, 0.12)";
    }
    if (val.includes("madya")) {
      return isActive ? "rgba(216, 208, 197, 0.20)" : "rgba(216, 208, 197, 0.09)";
    }
    return isActive ? "rgba(166, 157, 144, 0.20)" : "rgba(166, 157, 144, 0.09)";
  };

  return (
    <div
      className={`rounded-xl border border-ink-800 bg-ink-900 overflow-hidden flex flex-col ${className}`}
    >
      {/* Minimalist Canvas Header */}
      <div className="px-4 py-2.5 border-b border-ink-800 flex items-center justify-between gap-2 bg-ink-900">
        <div className="flex items-center gap-2 text-[12px] font-mono text-bone-300">
          <Compass size={14} className="text-bone-400" />
          <span>Kaja: {kajaBearing.toFixed(1)}° ({kajaDirection})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            aria-pressed={showGrid}
            className={`min-h-[30px] px-2.5 py-1 rounded-md text-[11.5px] font-mono flex items-center gap-1.5 border transition-colors ${
              showGrid
                ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                : "bg-ink-950 text-bone-400 border-ink-800 hover:text-bone-100"
            }`}
          >
            <Grid size={12} />
            <span>Kisi 9 Zona</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            aria-pressed={showLabels}
            className={`min-h-[30px] px-2.5 py-1 rounded-md text-[11.5px] font-mono flex items-center gap-1.5 border transition-colors ${
              showLabels
                ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                : "bg-ink-950 text-bone-400 border-ink-800 hover:text-bone-100"
            }`}
          >
            {showLabels ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>Label</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className={`relative w-full h-[420px] sm:h-[460px] flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden transition-colors duration-200 ${
          isPaper ? "bg-[#E6DEC8]" : "bg-[#0E0D0C]"
        }`}
      >
        <div
          className={`relative w-full h-full max-w-[680px] max-h-[440px] rounded-lg overflow-hidden transition-colors duration-200 ${
            isPaper
              ? "bg-[#FAF6EE] border border-[#C4B9A5] shadow-sm"
              : "bg-[#161412] border border-[#2C2825]"
          }`}
        >
          {/* Optional Uploaded Image */}
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageSrc}
              alt="Denah bangunan"
              className={`absolute inset-0 w-full h-full object-fill pointer-events-none ${
                isPaper ? "opacity-55" : "opacity-35"
              }`}
            />
          ) : (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: isPaper
                  ? "radial-gradient(circle, rgba(28, 25, 22, 0.10) 1px, transparent 1px)"
                  : "radial-gradient(circle, rgba(240, 234, 225, 0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          )}

          {/* SVG Architectural Layer */}
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <pattern
                id="hatch-violation"
                width="16"
                height="16"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="16"
                  stroke={isPaper ? "#B84322" : "#E06D4B"}
                  strokeWidth="3"
                  strokeOpacity="0.22"
                />
              </pattern>
            </defs>

            {/* 1. Sanga Mandala 3x3 Grid */}
            {showGrid && (
              <g className="sanga-mandala-grid">
                <line
                  x1="333.3"
                  y1="0"
                  x2="333.3"
                  y2="1000"
                  stroke={isPaper ? "rgba(28,25,22,0.16)" : "rgba(240,234,225,0.14)"}
                  strokeWidth="2"
                  strokeDasharray="8,8"
                />
                <line
                  x1="666.6"
                  y1="0"
                  x2="666.6"
                  y2="1000"
                  stroke={isPaper ? "rgba(28,25,22,0.16)" : "rgba(240,234,225,0.14)"}
                  strokeWidth="2"
                  strokeDasharray="8,8"
                />
                <line
                  x1="0"
                  y1="333.3"
                  x2="1000"
                  y2="333.3"
                  stroke={isPaper ? "rgba(28,25,22,0.16)" : "rgba(240,234,225,0.14)"}
                  strokeWidth="2"
                  strokeDasharray="8,8"
                />
                <line
                  x1="0"
                  y1="666.6"
                  x2="1000"
                  y2="666.6"
                  stroke={isPaper ? "rgba(28,25,22,0.16)" : "rgba(240,234,225,0.14)"}
                  strokeWidth="2"
                  strokeDasharray="8,8"
                />
              </g>
            )}

            {/* 2. Architectural Room Boxes */}
            {rooms.map((room, idx) => {
              if (!room.box || room.box.length !== 4) return null;
              const [ymin, xmin, ymax, xmax] = room.box;
              const w = Math.max(20, xmax - xmin);
              const h = Math.max(20, ymax - ymin);

              const violating = isRoomViolating(room);
              const isHovered = hoveredIndex === idx;
              const isSelected = selectedIndex === idx;
              const isActive = isHovered || isSelected;

              const fill = getWallFillColor(room, violating, isActive);
              const outerStroke = violating
                ? isPaper
                  ? "#B84322"
                  : "#E06D4B"
                : isActive
                ? isPaper
                  ? "#1C1916"
                  : "#F0EAE1"
                : isPaper
                ? "#4A433B"
                : "rgba(240, 234, 225, 0.55)";

              const outerStrokeWidth = isActive ? 5 : violating ? 4 : 3;

              return (
                <g
                  key={`room-${idx}`}
                  onClick={() => onSelectIndex(isSelected ? null : idx)}
                  onMouseEnter={() => onHoverIndex(idx)}
                  onMouseLeave={() => onHoverIndex(null)}
                  className="cursor-pointer transition-opacity"
                >
                  {violating && (
                    <rect
                      x={xmin}
                      y={ymin}
                      width={w}
                      height={h}
                      fill="url(#hatch-violation)"
                      rx={6}
                    />
                  )}

                  <rect
                    x={xmin}
                    y={ymin}
                    width={w}
                    height={h}
                    fill={fill}
                    stroke={outerStroke}
                    strokeWidth={outerStrokeWidth}
                    rx={6}
                  />
                </g>
              );
            })}
          </svg>

          {/* 3. Zone Background Labels */}
          {showGrid && gridLayout?.grid_matrix && gridLayout.grid_matrix.length === 3 && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {gridLayout.grid_matrix.map((row, rIdx) =>
                row.map((zoneId, cIdx) => {
                  const shortZone = zoneId.replace(/_/g, " ");
                  return (
                    <div
                      key={`zone-lbl-${rIdx}-${cIdx}`}
                      className="p-2 flex flex-col justify-between"
                    >
                      <span
                        className={`text-[9.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded self-start ${
                          isPaper
                            ? "text-[#575047] bg-[#EAE2D3]/85"
                            : "text-[#A69D90] bg-[#0E0D0C]/80"
                        }`}
                      >
                        {shortZone}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. Interactive HTML Room Name Badges */}
          {showLabels &&
            rooms.map((room, idx) => {
              if (!room.box || room.box.length !== 4) return null;
              const [ymin, xmin, ymax, xmax] = room.box;
              const cx = ((xmin + xmax) / 2 / 1000) * 100;
              const cy = ((ymin + ymax) / 2 / 1000) * 100;

              const violating = isRoomViolating(room);
              const isHovered = hoveredIndex === idx;
              const isSelected = selectedIndex === idx;
              const isActive = isHovered || isSelected;

              return (
                <button
                  key={`lbl-${idx}`}
                  type="button"
                  onClick={() => onSelectIndex(isSelected ? null : idx)}
                  onMouseEnter={() => onHoverIndex(idx)}
                  onMouseLeave={() => onHoverIndex(null)}
                  style={{
                    left: `${cx}%`,
                    top: `${cy}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute z-10 px-2 py-0.5 rounded text-[11px] font-medium transition-all shadow-sm max-w-[140px] truncate border ${
                    violating
                      ? isPaper
                        ? "bg-[#B84322] text-[#FAF6EE] border-[#8F3014] font-semibold"
                        : "bg-[#E06D4B] text-[#0E0D0C] border-[#F0EAE1] font-semibold"
                      : isActive
                      ? isPaper
                        ? "bg-[#1C1916] text-[#FAF6EE] border-[#1C1916] font-semibold"
                        : "bg-[#F0EAE1] text-[#0E0D0C] border-[#F0EAE1] font-semibold"
                      : isPaper
                      ? "bg-[#FAF6EE]/95 text-[#1C1916] border-[#B5AA99] hover:border-[#1C1916]"
                      : "bg-[#161412]/95 text-[#F0EAE1] border-[#38332E] hover:border-[#A69D90]"
                  }`}
                >
                  {room.name}
                </button>
              );
            })}
        </div>
      </div>

      {/* Minimalist Legend Footer */}
      <div className="px-4 py-2 border-t border-ink-800 bg-ink-900 flex items-center justify-between text-[11px] font-mono text-bone-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-bone-100/30 border border-bone-100 inline-block" />
            <span>Sesuai Pakem</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-clay/40 border border-clay inline-block" />
            <span className="text-clay font-semibold">Perlu Penyesuaian</span>
          </span>
        </div>
        <span>{rooms.length} Ruangan</span>
      </div>
    </div>
  );
};
