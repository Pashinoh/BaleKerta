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
  { step: 1, label: "Lokasi Tanah", description: "Tentukan arah Kaja (Gunung Agung)" },
  { step: 2, label: "Denah Bangunan", description: "Pilih contoh atau unggah denah" },
  { step: 3, label: "Hasil Pemeriksaan", description: "Verifikasi kepatuhan ruang adat" },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  maxStepReached,
  onSelectStep,
}) => {
  return (
    <nav aria-label="Alur pemeriksaan" className="w-full">
      <ol className="flex items-center justify-between w-full border border-ink-700 bg-ink-900 rounded-lg p-2 sm:p-3">
        {STEPS.map((s, idx) => {
          const isActive = s.step === currentStep;
          const isCompleted = s.step < currentStep || maxStepReached >= s.step;
          const isClickable = s.step <= Math.max(maxStepReached, currentStep);

          return (
            <React.Fragment key={s.step}>
              {/* Connector line between steps */}
              {idx > 0 && (
                <div
                  className={`h-[1px] flex-1 mx-2 sm:mx-4 transition-colors duration-150 ${
                    s.step <= currentStep ? "bg-bone-400/50" : "bg-ink-700"
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Button */}
              <li className={`min-w-0 ${isActive ? "flex-[2] sm:flex-1" : "flex-none sm:flex-1"} max-w-[260px]`}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectStep(s.step)}
                  className={`w-full flex items-center gap-2 sm:gap-2.5 p-1.5 rounded-md text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-bone-100 ${
                    isActive
                      ? "bg-ink-800 text-bone-100"
                      : isClickable
                      ? "text-bone-400 hover:text-bone-100 hover:bg-ink-800/60 cursor-pointer"
                      : "text-ink-600 cursor-not-allowed opacity-60"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Step Number / Check Icon */}
                  <div
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-mono text-[13px] font-semibold transition-colors ${
                      isActive
                        ? "bg-bone-100 text-ink-950"
                        : isCompleted && s.step < currentStep
                        ? "border border-bone-400 text-bone-400"
                        : "border border-ink-700 text-bone-400"
                    }`}
                  >
                    {isCompleted && s.step < currentStep ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : (
                      s.step
                    )}
                  </div>

                  {/* Step Label (Desktop & Tablet) */}
                  <div className="min-w-0 hidden sm:block">
                    <p
                      className={`text-[13px] sm:text-[14px] leading-tight font-medium truncate ${
                        isActive ? "text-bone-100" : "text-bone-400"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="hidden md:block text-[12px] text-bone-400/80 truncate">
                      {s.description}
                    </p>
                  </div>

                  {/* Step Label (Compact on Mobile: show title for active step only) */}
                  <div className="min-w-0 sm:hidden">
                    {isActive && (
                      <p className="text-[12px] font-medium text-bone-100 truncate">
                        {s.label}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
