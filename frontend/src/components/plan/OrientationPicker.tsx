"use client";

import React from "react";
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Compass } from "lucide-react";

export interface OrientationPickerProps {
  planNorthDeg: number;
  onChange: (deg: number) => void;
  className?: string;
}

const ORIENTATION_OPTIONS = [
  { deg: 0, label: "Utara", icon: ArrowUp, desc: "Sisi atas menghadap Utara" },
  { deg: 90, label: "Timur", icon: ArrowRight, desc: "Sisi kanan menghadap Utara" },
  { deg: 180, label: "Selatan", icon: ArrowDown, desc: "Sisi bawah menghadap Utara" },
  { deg: 270, label: "Barat", icon: ArrowLeft, desc: "Sisi kiri menghadap Utara" },
];

export const OrientationPicker: React.FC<OrientationPickerProps> = ({
  planNorthDeg,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-bone-100 flex items-center gap-1.5">
          <Compass size={15} className="text-bone-400" />
          <span>Arah Utara pada Lembar Denah:</span>
        </label>
        <span className="font-mono text-[12px] font-medium text-bone-100 px-2 py-0.5 rounded bg-ink-950 border border-ink-700">
          {planNorthDeg}° dari atas
        </span>
      </div>

      {/* 4 Quadrant Selector */}
      <div className="grid grid-cols-4 gap-2">
        {ORIENTATION_OPTIONS.map((opt) => {
          const isSelected = planNorthDeg === opt.deg;
          const Icon = opt.icon;

          return (
            <button
              key={opt.deg}
              type="button"
              onClick={() => onChange(opt.deg)}
              className={`p-2.5 rounded-md border flex flex-col items-center justify-center gap-1 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-bone-100 ${
                isSelected
                  ? "bg-bone-100 text-ink-950 font-semibold border-bone-100 shadow-sm"
                  : "bg-ink-900 text-bone-400 border-ink-700 hover:text-bone-100 hover:bg-ink-800"
              }`}
            >
              <Icon size={16} />
              <span className="text-[12px] font-medium">{opt.label}</span>
              <span className="text-[10px] font-mono opacity-80">{opt.deg}°</span>
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-bone-400 leading-relaxed">
        Periksa simbol arah mata angin pada gambar denah Anda. Sanga Mandala
        akan diproyeksikan dan dirotasi mengikuti sudut tersebut.
      </p>
    </div>
  );
};
