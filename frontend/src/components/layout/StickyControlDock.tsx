"use client";

import React from "react";
import { ArrowRight, ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

export interface StickyControlDockProps {
  step: number;
  onPrev: () => void;
  onNext: () => void;
  onRunAudit: () => void;
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
  isAuditing,
  locationLabel,
  kajaBearing,
  kajaDirection,
  presetName,
  hasFileOrPreset = true,
}) => {
  return (
    <aside aria-label="Bilah Aksi Alur Kerja" className="fixed bottom-0 left-0 right-0 z-40 bg-ink-950/95 border-t border-ink-700 py-3 px-4 sm:px-6 shadow-dock">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Status context summary */}
        <div className="flex items-center gap-3 text-[12px] w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5 font-mono text-bone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-bone-100"></span>
            <span className="tracking-wider">STATUS:</span>
          </div>

          {step === 1 && (
            <div className="flex items-center gap-2 font-mono text-bone-100">
              <span className="font-semibold text-bone-100">{locationLabel || "Bali"}</span>
              <span className="text-ink-600">·</span>
              <span className="text-bone-400">
                Arah Kaja: {kajaBearing?.toFixed(1)}° ({kajaDirection})
              </span>
            </div>
          )}

          {step === 2 && (
            <div className="flex items-center gap-2 font-mono text-bone-100">
              <span className="text-bone-400">Denah:</span>
              <span className="text-bone-100 font-medium truncate max-w-[220px] sm:max-w-xs">
                {presetName || "Berkas Denah"}
              </span>
            </div>
          )}

          {step === 3 && (
            <div className="flex items-center gap-2 text-bone-100 font-mono">
              <ShieldCheck size={14} className="text-bone-100 shrink-0" />
              <span className="text-bone-300">Hasil Audit Sanga Mandala</span>
            </div>
          )}
        </div>

        {/* Right Navigation & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {step > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrev}
              disabled={isAuditing}
              icon={<ArrowLeft size={14} />}
            >
              Kembali
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
              Lanjut ke Denah Bangunan
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
                  <ArrowRight size={15} />
                )
              }
              className="w-full sm:w-auto"
            >
              {isAuditing ? "Memeriksa Tata Ruang..." : "Periksa Denah Ini"}
            </Button>
          )}

          {step === 3 && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPrev()}
                icon={<RefreshCw size={14} />}
              >
                Ubah Parameter
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
