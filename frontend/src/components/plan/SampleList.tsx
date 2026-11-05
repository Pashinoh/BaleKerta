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
    title: "Pekarangan Ageng Bali (Kompleks 10 Ruangan)",
    subtitle:
      "Denah skala besar pola Puri/Griya dengan 10 zona lengkap: Sanggah, Bale Daja, Bale Dangin, Natah, Bale Dauh, Paon, Jineng, dan Teba.",
    highlight: "Denah Skala Besar (10 Ruang)",
  },
  {
    id: "preset_1_pass",
    title: "Denah Hunian Tradisional",
    subtitle:
      "Pola Sanga Mandala ideal dengan tempat suci di sudut Kaja-Kangin dan Natah terbuka.",
    highlight: "Sesuai Adat & Layak PBG",
  },
  {
    id: "preset_2_toilet_violation",
    title: "Rumah Modern (Pelanggaran Toilet)",
    subtitle:
      "Kamar mandi/toilet diletakkan di sudut paling suci pekarangan (Utamaning Utama).",
    highlight: "Toilet di Sudut Suci",
    isViolation: true,
  },
  {
    id: "preset_3_villa_overbuild",
    title: "Villa Komersial (Pelanggaran KDB & Natah)",
    subtitle:
      "Bangunan masif menutupi zona tengah (Natah) dan luas terbangun melebihi 60%.",
    highlight: "Natah Tertutup & KDB Berlebih",
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
    <div className="space-y-2.5" role="radiogroup" aria-label="Pilih denah contoh">
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
            className={`p-3.5 rounded-lg border transition-colors duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-bone-100 ${
              isSelected
                ? "bg-ink-800 border-bone-100 shadow-sm"
                : "bg-ink-900 border-ink-700 hover:border-ink-600 hover:bg-ink-850"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-[14px] font-semibold text-bone-100">
                    {opt.title}
                  </h4>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.2 rounded border ${
                      opt.isViolation
                        ? "bg-clay/10 border-clay text-clay"
                        : "bg-ink-950 border-ink-700 text-bone-400"
                    }`}
                  >
                    {opt.highlight}
                  </span>
                </div>
                <p className="text-[13px] text-bone-400 leading-relaxed">
                  {opt.subtitle}
                </p>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                  isSelected
                    ? "bg-bone-100 border-bone-100"
                    : "border-ink-600 bg-ink-950"
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} className="text-ink-950" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
