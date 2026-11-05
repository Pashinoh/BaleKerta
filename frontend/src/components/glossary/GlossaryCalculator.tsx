"use client";

import React, { useState } from "react";
import { Calculator, Sparkles, Info } from "lucide-react";

export interface GlossaryCalculatorProps {
  initialHastaCm?: number;
  onHastaChange?: (value: number) => void;
  className?: string;
}

export const GlossaryCalculator: React.FC<GlossaryCalculatorProps> = ({
  initialHastaCm = 44.5,
  onHastaChange,
  className = "",
}) => {
  const [hasta, setHasta] = useState<number>(initialHastaCm);
  const [roomHastaLength, setRoomHastaLength] = useState<number>(8);
  const [roomHastaWidth, setRoomHastaWidth] = useState<number>(6);

  const handleHastaUpdate = (val: number) => {
    const clamped = Math.max(35, Math.min(60, Number(val) || 44.5));
    setHasta(clamped);
    onHastaChange?.(clamped);
  };

  // Konversi satuan Asta Kosala-Kosali
  const depaCm = Number((hasta * 4).toFixed(1)); // 1 Depa = 4 Hasta
  const mustiCm = Number((hasta * 0.25).toFixed(1)); // 1 Musti = 1/4 Hasta
  const nyariCm = Number((hasta / 16).toFixed(1)); // 1 Nyari = 1/16 Hasta

  // Simulasi dimensi ruangan
  const roomLengthMeters = ((roomHastaLength * hasta) / 100).toFixed(2);
  const roomWidthMeters = ((roomHastaWidth * hasta) / 100).toFixed(2);
  const roomAreaMeters = (
    (parseFloat(roomLengthMeters) * parseFloat(roomWidthMeters))
  ).toFixed(2);

  return (
    <div
      className={`p-5 bg-ink-900 border border-ink-700 rounded-xl space-y-5 text-bone-100 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-ink-700 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center text-bone-100">
            <Calculator size={16} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-bone-100">
              Kalkulator Sikut & Satuan Adat Bali
            </h3>
            <p className="text-[12px] font-mono text-bone-400">
              Pengukuran proporsi antropometrik Asta Kosala-Kosali
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ink-950 border border-ink-700 text-bone-400">
          Pedoman PBG Adat
        </span>
      </div>

      {/* Input Utama: Kalibrasi Hasta */}
      <div className="p-4 bg-ink-950 border border-ink-700/80 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="hasta-input" className="text-[13px] font-medium text-bone-100 flex items-center gap-1.5">
            <Sparkles size={14} className="text-bone-400" />
            1 Hasta Pemilik Rumah (cm)
          </label>
          <span className="text-[14px] font-mono font-bold text-bone-100">
            {hasta} cm
          </span>
        </div>
        <input
          id="hasta-input"
          type="range"
          min="38"
          max="52"
          step="0.5"
          value={hasta}
          onChange={(e) => handleHastaUpdate(parseFloat(e.target.value))}
          className="w-full accent-bone-100 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono text-bone-400">
          <span>38.0 cm (Postur Kecil)</span>
          <span className="text-bone-100 font-semibold">44.5 cm (Rata-rata Bali)</span>
          <span>52.0 cm (Postur Tinggi)</span>
        </div>
      </div>

      {/* Grid Konversi Turunan Satuan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-ink-950 border border-ink-700/70 rounded-lg space-y-1">
          <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider block">
            1 Depa (4 Hasta)
          </span>
          <span className="text-[18px] font-bold text-bone-100 font-mono">
            {depaCm} cm
          </span>
          <p className="text-[11px] text-bone-400 leading-tight">
            Rentangan kedua tangan horizontal dari ujung jari tengah ke jari tengah.
          </p>
        </div>

        <div className="p-3 bg-ink-950 border border-ink-700/70 rounded-lg space-y-1">
          <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider block">
            1 Musti (1/4 Hasta)
          </span>
          <span className="text-[18px] font-bold text-bone-100 font-mono">
            {mustiCm} cm
          </span>
          <p className="text-[11px] text-bone-400 leading-tight">
            Satu kepalan tangan tegak dengan ibu jari terangkat.
          </p>
        </div>

        <div className="p-3 bg-ink-950 border border-ink-700/70 rounded-lg space-y-1">
          <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider block">
            1 Nyari (1/16 Hasta)
          </span>
          <span className="text-[18px] font-bold text-bone-100 font-mono">
            {nyariCm} cm
          </span>
          <p className="text-[11px] text-bone-400 leading-tight">
            Lebar satu jari tangan untuk penyesuaian detail ukiran & sendi saka.
          </p>
        </div>
      </div>

      {/* Simulator Dimensi Bangunan Adat */}
      <div className="p-4 bg-ink-950 border border-ink-700/80 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-bone-400" />
          <h4 className="text-[13px] font-semibold text-bone-100">
            Simulasi Dimensi Ruangan Berdasarkan Hasta
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono text-bone-400 block mb-1">
              Panjang Ruang (Hasta)
            </label>
            <input
              type="number"
              min="2"
              max="24"
              value={roomHastaLength}
              onChange={(e) => setRoomHastaLength(Math.max(2, parseInt(e.target.value) || 2))}
              className="w-full px-3 py-1.5 rounded bg-ink-900 border border-ink-700 text-bone-100 font-mono text-[13px]"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-bone-400 block mb-1">
              Lebar Ruang (Hasta)
            </label>
            <input
              type="number"
              min="2"
              max="24"
              value={roomHastaWidth}
              onChange={(e) => setRoomHastaWidth(Math.max(2, parseInt(e.target.value) || 2))}
              className="w-full px-3 py-1.5 rounded bg-ink-900 border border-ink-700 text-bone-100 font-mono text-[13px]"
            />
          </div>
        </div>
        <div className="p-2.5 bg-ink-900 border border-ink-700 rounded flex items-center justify-between text-[12px] font-mono">
          <span className="text-bone-400">Dimensi Aktual Metrik:</span>
          <span className="font-bold text-bone-100">
            {roomLengthMeters} m × {roomWidthMeters} m ({roomAreaMeters} m²)
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlossaryCalculator;
