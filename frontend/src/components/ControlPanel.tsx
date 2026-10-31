"use client";

import React from "react";
import { MapPin, Ruler, Sparkles, Loader2, Compass } from "lucide-react";

interface ControlPanelProps {
  selectedRegency: string;
  onRegencyChange: (regency: string) => void;
  hastaCm: number;
  onHastaChange: (val: number) => void;
  isLoading: boolean;
  onRunAudit: () => void;
  canAudit: boolean;
}

const BALI_REGENCIES = [
  { id: "denpasar", name: "Kota Denpasar", direction: "Timur Laut (NE)" },
  { id: "badung", name: "Kab. Badung (Kuta, Canggu, Seminyak)", direction: "Timur Laut (NE)" },
  { id: "gianyar", name: "Kab. Gianyar (Ubud, Sukawati)", direction: "Timur Laut (NE)" },
  { id: "tabanan", name: "Kab. Tabanan", direction: "Timur / NE" },
  { id: "buleleng", name: "Kab. Buleleng (Singaraja)", direction: "Tenggara / S" },
  { id: "bangli", name: "Kab. Bangli (Kintamani)", direction: "Timur (E)" },
  { id: "klungkung", name: "Kab. Klungkung & Nusa Penida", direction: "Utara-Timur Laut" },
  { id: "karangasem", name: "Kab. Karangasem", direction: "Barat Laut / NW" },
  { id: "jembrana", name: "Kab. Jembrana (Negara)", direction: "Timur (E)" },
];

export default function ControlPanel({
  selectedRegency,
  onRegencyChange,
  hastaCm,
  onHastaChange,
  isLoading,
  onRunAudit,
  canAudit
}: ControlPanelProps) {
  // Hitung konversi antropometri adat
  const depaCm = (hastaCm * 4).toFixed(0);
  const mustiCm = (hastaCm / 4).toFixed(1);

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-amber-400" />
          Parameter Tapak & Adat
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
          Asta Bumi Engine
        </span>
      </div>

      {/* 1. Regency Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          Wilayah Kabupaten / Lokasi Tanah:
        </label>
        <select
          value={selectedRegency}
          onChange={(e) => onRegencyChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 transition"
        >
          {BALI_REGENCIES.map((reg) => (
            <option key={reg.id} value={reg.id}>
              {reg.name} — Arah Kaja: {reg.direction}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500">
          *Arah suci Kaja (Gunung Agung) dihitung otomatis berdasarkan azimuth wilayah.
        </p>
      </div>

      {/* 2. Anthropometric Slider (Hasta) */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-emerald-400" />
            Antropometri Pemilik (1 Hasta):
          </label>
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {hastaCm} cm
          </span>
        </div>

        <input
          type="range"
          min="40"
          max="55"
          step="0.5"
          value={hastaCm}
          onChange={(e) => onHastaChange(parseFloat(e.target.value))}
          disabled={isLoading}
          className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        {/* Antropometric conversion breakdown */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">1 Depa (4 Hasta):</span>
            <strong className="text-slate-200 text-xs">{depaCm} cm</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block">1 Musti (Kepalan):</span>
            <strong className="text-slate-200 text-xs">{mustiCm} cm</strong>
          </div>
        </div>
      </div>

      {/* 3. Action Audit Button */}
      <button
        onClick={onRunAudit}
        disabled={!canAudit || isLoading}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
          canAudit && !isLoading
            ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 cursor-pointer"
            : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span>Menganalisis Denah & Aturan Perda...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Jalankan Audit AI & Spasial</span>
          </>
        )}
      </button>
    </div>
  );
}
