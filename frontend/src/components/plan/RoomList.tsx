"use client";

import React from "react";
import { Room, Violation } from "@/types/audit";
import { Term } from "../glossary/Term";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface RoomListProps {
  rooms: Room[];
  violations: Violation[];
  hoveredIndex: number | null;
  selectedIndex: number | null;
  onHoverRoom: (index: number | null) => void;
  onSelectRoom: (index: number | null) => void;
  onOpenGlossaryDrawer?: (termId: string) => void;
  className?: string;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  violations,
  hoveredIndex,
  selectedIndex,
  onHoverRoom,
  onSelectRoom,
  onOpenGlossaryDrawer,
  className = "",
}) => {
  // Check if a room has violations
  const getRoomViolation = (room: Room): Violation | undefined => {
    return violations.find((v) => {
      if (v.box && room.box) {
        const [vy1, vx1, vy2, vx2] = v.box;
        const [ry1, rx1, ry2, rx2] = room.box;
        if (vy1 === ry1 && vx1 === rx1 && vy2 === ry2 && vx2 === rx2) return true;
      }
      return v.room_name.toLowerCase() === room.name.toLowerCase();
    });
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div className={`p-6 text-center text-bone-400 border border-dashed border-ink-700 rounded-lg text-[13px] ${className}`}>
        Belum ada ruangan yang dianalisis.
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-[13px] text-bone-400 pb-1.5 border-b border-ink-700">
        <span className="font-medium text-bone-100">Ruangan Terdeteksi ({rooms.length})</span>
        <span className="text-[11px] font-mono text-bone-400">Klik untuk menyorot</span>
      </div>

      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
        {rooms.map((room, idx) => {
          const violation = getRoomViolation(room);
          const isViolating = !!violation;
          const isHovered = hoveredIndex === idx;
          const isSelected = selectedIndex === idx;

          const zoneIdRaw = room.zone?.zone_id || "";
          const termId = zoneIdRaw.toLowerCase().replace(/_/g, "-");

          return (
            <div
              key={`${room.name}-${idx}`}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              onMouseEnter={() => onHoverRoom(idx)}
              onMouseLeave={() => onHoverRoom(null)}
              onClick={() => onSelectRoom(isSelected ? null : idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectRoom(isSelected ? null : idx);
                }
              }}
              className={`p-2.5 rounded-md border text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-bone-100 ${
                isViolating
                  ? isSelected || isHovered
                    ? "bg-clay/15 border-clay shadow-sm"
                    : "bg-ink-900 border-clay/60 hover:border-clay"
                  : isSelected || isHovered
                  ? "bg-ink-800 border-bone-100 shadow-sm"
                  : "bg-ink-900 border-ink-700 hover:border-ink-600 hover:bg-ink-850"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-medium text-bone-100 truncate">
                      {room.name}
                    </span>
                    {isViolating ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-clay text-ink-950 font-bold rounded">
                        PELANGGARAN
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-ink-950 text-bone-400 rounded border border-ink-700">
                        SESUAI
                      </span>
                    )}
                  </div>

                  {room.zone && (
                    <div className="text-[11px] text-bone-400 mt-0.5 flex items-center gap-1">
                      <span>Zona:</span>
                      <Term
                        id={termId}
                        label={room.zone.zone_name}
                        onOpenGlossary={() => onOpenGlossaryDrawer?.(termId)}
                      />
                    </div>
                  )}
                </div>

                <div className="shrink-0 mt-0.5">
                  {isViolating ? (
                    <AlertCircle size={15} className="text-clay" />
                  ) : (
                    <CheckCircle2 size={15} className="text-bone-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
