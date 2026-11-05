import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  step: number;
  label: string;
  description: string;
}

export interface StepperProps {
  currentStep: number;
  maxStepReached: number;
  onSelectStep: (step: number) => void;
}

export const STEPS: StepItem[] = [
  { step: 1, label: "1. Lokasi & Arah Kaja", description: "Titik tanah & poros Gunung Agung" },
  { step: 2, label: "2. Denah Bangunan", description: "Pilih contoh atau unggah gambar denah" },
  { step: 3, label: "3. Hasil & Laporan PBG", description: "Evaluasi 9 zona & cetak dokumen PDF" },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  maxStepReached,
  onSelectStep,
}) => {
  const handleKeyDown = (
    e: React.KeyboardEvent,
    step: number,
    isClickable: boolean
  ) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectStep(step);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextStep = STEPS.find(
        (stepItem) =>
          stepItem.step > step &&
          stepItem.step <= Math.max(maxStepReached, currentStep)
      );
      if (nextStep) onSelectStep(nextStep.step);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevStep = [...STEPS]
        .reverse()
        .find(
          (stepItem) =>
            stepItem.step < step &&
            stepItem.step <= Math.max(maxStepReached, currentStep)
        );
      if (prevStep) onSelectStep(prevStep.step);
    }
  };

  return (
    <nav
      aria-label="Tahapan pemeriksaan tata ruang adat Bali"
      className="w-full bg-ink-900 border border-ink-700 rounded-xl p-2 sm:p-3 shadow-card"
    >
      <ol className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full">
        {STEPS.map((s) => {
          const isActive = s.step === currentStep;
          const isCompleted = s.step < currentStep;
          const isClickable = s.step <= Math.max(maxStepReached, currentStep);

          return (
            <li key={s.step} className="min-w-0">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(s.step)}
                onKeyDown={(e) => handleKeyDown(e, s.step, isClickable)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Langkah ${s.step}: ${s.label}`}
                className={`w-full min-h-[48px] sm:min-h-[54px] px-2.5 sm:px-3.5 py-2 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  isActive
                    ? "bg-ink-950 border-bone-100 text-bone-100 shadow-sm"
                    : isCompleted
                    ? "bg-ink-950/50 border-ink-600 text-bone-200 hover:bg-ink-850"
                    : isClickable
                    ? "bg-transparent border-ink-700 text-bone-300 hover:bg-ink-850"
                    : "bg-transparent border-ink-800 text-bone-500 opacity-60 cursor-not-allowed"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center font-mono text-[12px] font-bold transition-colors ${
                    isActive
                      ? "bg-bone-100 text-ink-950"
                      : isCompleted
                      ? "bg-ink-800 text-bone-100 border border-ink-600"
                      : "bg-ink-950 text-bone-400 border border-ink-700"
                  }`}
                >
                  {isCompleted ? <Check size={14} strokeWidth={2.5} /> : s.step}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[12px] sm:text-[13.5px] leading-tight truncate ${
                      isActive ? "font-bold text-bone-100" : "font-medium text-bone-200"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[11px] text-bone-400 truncate mt-0.5 hidden md:block">
                    {s.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
