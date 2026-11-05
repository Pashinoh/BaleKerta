"use client";

import React from "react";
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Compass } from "lucide-react";

export interface OrientationPickerProps {
  planNorthDeg: number;
  onChange: (deg: number) => void;
  className?: string;
}

const ORIENTATION_OPTIONS = [
  { deg: 0, label: "Utara", icon: ArrowUp },
  { deg: 90, label: "Timur", icon: ArrowRight },
  { deg: 180, label: "Selatan", icon: ArrowDown },
  { deg: 270, label: "Barat", icon: ArrowLeft },
];

export const OrientationPicker: React.FC<OrientationPickerProps> = ({
  planNorthDeg,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-bone-200 flex items-center gap-1.5">
          <Compass size={14} className="text-bone-400" />
          <span>Arah Utara Gambar Denah</span>
        </span>
        <span className="font-mono text-[11px] text-bone-400">
          {planNorthDeg}°
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ORIENTATION_OPTIONS.map((opt) => {
          const isSelected = planNorthDeg === opt.deg;
          const Icon = opt.icon;

          return (
            <button
              key={opt.deg}
              type="button"
              onClick={() => onChange(opt.deg)}
              className={`min-h-[44px] py-2 px-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                isSelected
                  ? "bg-bone-100 text-ink-950 font-semibold border-bone-100 shadow-sm"
                  : "bg-ink-950/60 text-bone-400 border-ink-800 hover:text-bone-100 hover:bg-ink-900"
              }`}
            >
              <Icon size={15} />
              <span className="text-[11.5px] leading-none">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
