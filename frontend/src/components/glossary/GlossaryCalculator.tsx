"use client";

import React, { useState } from "react";

export interface GlossaryCalculatorProps {
  hastaCm?: number;
  onHastaChange?: (value: number) => void;
  depaCm?: number;
  mustiCm?: number;
}

export const GlossaryCalculator: React.FC<GlossaryCalculatorProps> = ({
  hastaCm = 40,
  onHastaChange,
  depaCm = 160,
  mustiCm = 10,
}) => {
  const [hasta, setHasta] = useState<number>(hastaCm);
  const [depa, setDepa] = useState<number>(depaCm);
  const [musti, setMusty] = useState<number>(mustiCm);

  const calculateDepa = (hastaVal: number) => Math.round(hastaVal * 4);
  const calculateMusti = (hastaVal: number) => Math.round(hastaVal * 0.25);

  return (
    <div className="p-4 bg-ink-950/50 border border-ink-700 rounded-lg text-[13px] text-bone-300 space-y-3">
      <div>
        <span className="text-[11px] text-bone-400 uppercase tracking-wider">Hasta</span>
        <input
          type="number"
          value={hasta}
          onChange={(e) => {
            const val = Math.max(10, Math.min(100, Number(e.target.value) || 0));
            setHasta(val);
            onHastaChange?.(val);
            setDepa(calculateDepa(val));
            setMusty(calculateMusti(val));
          }}
          className="w-full px-3 py-2 rounded-md bg-ink-900 border border-ink-700 text-bone-100 focus:outline-none focus:border-bone-100"
        />
        <span className="text-[11px] text-bone-400 ml-2">≈ {calculateDepa(hasta)} cm Depa</span>
        <span className="text-[11px] text-bone-400 ml-2">≈ {calculateMusti(hasta)} cm Musti</span>
      </div>

      <div>
        <span className="text-[11px] text-bone-400 uppercase tracking-wider">Depa</span>
        <input
          type="number"
          value={depa}
          onChange={(e) => {
            const val = Math.max(50, Math.min(400, Number(e.target.value) || 160));
            setDepa(val);
            const newHasta = Math.round(val / 4);
            setHasta(newHasta);
            onHastaChange?.(newHasta);
            setMusty(calculateMusti(newHasta));
          }}
          className="w-full px-3 py-2 rounded-md bg-ink-900 border border-ink-700 text-bone-100 focus:outline-none focus:border-bone-100"
        />
        <span className="text-[11px] text-bone-400 ml-2">≈ {Math.round(hasta * 4)} cm Hasta</span>
        <span className="text-[11px] text-bone-400 ml-2">≈ {calculateMusti(hasta)} cm Musti</span>
      </div>

      <div>
        <span className="text-[11px] text-bone-400 uppercase tracking-wider">Musti</span>
        <input
          type="number"
          value={musti}
          onChange={(e) => {
            const val = Math.max(1, Math.min(50, Number(e.target.value) || 10));
            setMusty(val);
            const newHasta = Math.round(val * 4);
            setHasta(newHasta);
            onHastaChange?.(newHasta);
            setDepa(calculateDepa(newHasta));
          }}
          className="w-full px-3 py-2 rounded-md bg-ink-900 border border-ink-700 text-bone-100 focus:outline-none focus:border-bone-100"
        />
        <span className="text-[11px] text-bone-400 ml-2">≈ {Math.round(musti * 4)} cm Hasta</span>
        <span className="text-[11px] text-bone-400 ml-2">≈ {Math.round(musti / 0.25)} cm Depa</span>
      </div>
    </div>
  );
};