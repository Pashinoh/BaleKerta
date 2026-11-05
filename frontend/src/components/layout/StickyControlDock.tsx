"use client";

import React from "react";
import { ArrowRight, ArrowLeft, RefreshCw, ShieldCheck, Printer } from "lucide-react";
import { Button } from "../ui/Button";

export interface StickyControlDockProps {
  step: number;
  onPrev: () => void;
  onNext: () => void;
  onRunAudit: () => void;
  onOpenReport?: () => void;
  isAuditing: boolean;
  locationLabel?: string;
  kajaBearing?: number;
  kajaDirection?: string;
  presetName?: string;
  hasFileOrPreset?: boolean;
}

export const StickyControlDock: React.FC<StickyControlDockProps> = ({
  step,
  onPrev,
  onNext,
  onRunAudit,
  onOpenReport,
  isAuditing,
  locationLabel,
  kajaBearing,
  kajaDirection,
  presetName,
  hasFileOrPreset = true,
}) => {
  return (
    <aside
      aria-label="Bilah navigasi tahapan pemeriksaan"
      className="fixed bottom-0 left-0 right-0 z-40 bg-ink-900/95 backdrop-blur-sm border-t border-ink-700 py-2.5 sm:py-3 px-4 sm:px-6 shadow-dock no-print"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Contextual Parameter Status */}
        <div className="flex items-center gap-2.5 text-[12px] w-full sm:w-auto justify-between sm:justify-start min-w-0">
          <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-ink-950 border border-ink-700 text-bone-400 shrink-0">
            Langkah {step}/3
          </span>

          {step === 1 && (
            <div className="flex items-center gap-2 font-mono text-bone-100 truncate">
              <span className="font-semibold text-bone-100 truncate">
                {locationLabel || "Pulau Bali"}
              </span>
              <span className="text-ink-500">&middot;</span>
              <span className="text-bone-400 truncate">
                Kaja: {kajaBearing?.toFixed(1)}&deg; ({kajaDirection})
              </span>
            </div>
          )}

          {step === 2 && (
            <div className="flex items-center gap-2 font-mono text-bone-100 truncate">
              <span className="text-bone-400 shrink-0">Denah:</span>
              <span className="text-bone-100 font-semibold truncate max-w-[200px] sm:max-w-xs">
                {presetName || "Pilih atau unggah denah"}
              </span>
            </div>
          )}

          {step === 3 && (
            <div className="flex items-center gap-2 text-bone-100 font-mono truncate">
              <ShieldCheck size={14} className="text-bone-100 shrink-0" aria-hidden="true" />
              <span className="text-bone-300 truncate">
                Evaluasi Sanga Mandala &amp; Perda Bali No. 5/2005 Selesai
              </span>
            </div>
          )}
        </div>

        {/* Right: Step Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {step > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrev}
              disabled={isAuditing}
              icon={<ArrowLeft size={14} />}
            >
              Sebelumnya
            </Button>
          )}

          {step === 1 && (
            <Button
              variant="primary"
              size="md"
              onClick={onNext}
              icon={<ArrowRight size={15} />}
              className="w-full sm:w-auto"
            >
              Lanjut Pilih Denah Bangunan
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="primary"
              size="md"
              onClick={onRunAudit}
              disabled={isAuditing || !hasFileOrPreset}
              icon={
                isAuditing ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <ShieldCheck size={15} />
                )
              }
              className="w-full sm:w-auto"
            >
              {isAuditing ? "Memeriksa Tata Ruang..." : "Jalankan Pemeriksaan Sanga Mandala"}
            </Button>
          )}

          {step === 3 && onOpenReport && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenReport}
              icon={<Printer size={14} />}
              className="flex-1 sm:flex-initial"
            >
              Cetak Lembar PBG (PDF)
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};
