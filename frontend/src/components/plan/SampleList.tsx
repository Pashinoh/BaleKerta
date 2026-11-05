"use client";

import React from "react";
import { Check } from "lucide-react";

export interface PresetOption {
  id: string;
  title: string;
  subtitle: string;
  highlight: string;
  isViolation?: boolean;
}

export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: "preset_4_kompleks_ageng",
    title: "Pekarangan Ageng (10 Ruang)",
    subtitle: "Pola Puri/Griya lengkap: Sanggah, Bale Daja, Dangin, Natah, Paon, Teba.",
    highlight: "Skala Besar",
  },
  {
    id: "preset_1_pass",
    title: "Hunian Tradisional Ideal",
    subtitle: "Sanggah di sudut Kaja-Kangin dan Natah terbuka di pusat tapak.",
    highlight: "Layak PBG",
  },
  {
    id: "preset_2_toilet_violation",
    title: "Rumah Modern (Uji Toilet)",
    subtitle: "Studi kasus kamar mandi/sanitasi berada di sudut suci Utamaning Utama.",
    highlight: "1 Pelanggaran",
    isViolation: true,
  },
  {
    id: "preset_3_villa_overbuild",
    title: "Villa Komersial (Uji KDB & Natah)",
    subtitle: "Studi kasus bangunan menutupi Natah tengah dan KDB melampaui 60%.",
    highlight: "2 Pelanggaran",
    isViolation: true,
  },
];

export interface SampleListProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

export const SampleList: React.FC<SampleListProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-2 max-h-[220px] sm:max-h-none overflow-y-auto pr-0.5" role="radiogroup" aria-label="Pilih denah contoh">
      {PRESET_OPTIONS.map((opt) => {
        const isSelected = selectedPresetId === opt.id;
        return (
          <div
            key={opt.id}
            onClick={() => onSelectPreset(opt.id)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectPreset(opt.id);
              }
            }}
            className={`p-3 sm:p-3.5 rounded-lg border transition-colors duration-150 cursor-pointer select-none ${
              isSelected
                ? "bg-ink-800 border-bone-100 shadow-sm"
                : "bg-ink-950/60 border-ink-800 hover:border-ink-600 hover:bg-ink-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-[13.5px] font-semibold text-bone-100">
                    {opt.title}
                  </h4>
                  <span
                    className={`text-[10.5px] font-mono px-2 py-0.5 rounded ${
                      opt.isViolation
                        ? "bg-clay/10 text-clay border border-clay/40"
                        : "bg-ink-900 text-bone-300 border border-ink-700"
                    }`}
                  >
                    {opt.highlight}
                  </span>
                </div>
                <p className="text-[12px] text-bone-400 leading-snug">
                  {opt.subtitle}
                </p>
              </div>

              <div
                className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-colors mt-1 ${
                  isSelected
                    ? "bg-bone-100 border-bone-100"
                    : "border-ink-600 bg-ink-950"
                }`}
              >
                {isSelected && <Check size={10} strokeWidth={3} className="text-ink-950" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
