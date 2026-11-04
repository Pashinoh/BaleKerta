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
    <nav aria-label="Alur pemeriksaan: Verifikasi kepatuhan orientasi Asta Kosala-Kosali dan Asta Bumi sebelum pengajuan PBG" className="w-full">
      <ol className="flex items-center justify-between w-full">
        {STEPS.map((s, idx) => {
          const isActive = s.step === currentStep;
          const isCompleted = s.step < currentStep;
          const isReached = maxStepReached >= s.step || s.step < currentStep;
          const isClickable = s.step <= Math.max(maxStepReached, currentStep);

          return (
            <React.Fragment key={s.step}>
              {/* Connector line between steps */}
              {idx > 0 && (
                <div
                  className={`h-[1px] flex-1 mx-2 sm:mx-3 transition-colors duration-150 ${
                    s.step <= currentStep ? "bg-bone-400/50" : "bg-ink-700"
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Item */}
              <li className="flex flex-col items-center min-w-0 flex-none">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectStep(s.step)}
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-mono text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-bone-100 ${
                    isActive
                      ? "bg-bone-100 text-ink-950"
                      : isCompleted
                      ? "border border-bone-400 text-bone-400"
                      : isReached
                      ? "border border-bone-400/70 text-bone-400"
                      : "border border-ink-700 text-ink-600"
                  } ${isClickable && !isActive ? "cursor-pointer" : !isClickable ? "cursor-not-allowed" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Langkah ${s.step}: ${s.label}`}
                >
                  {isCompleted ? (
                    <Check size={12} strokeWidth={2.5} />
                  ) : (
                    s.step
                  )}
                </button>
                <div className="mt-1.5 text-center">
                  <p
                    className={`text-[11px] sm:text-[12px] leading-tight font-medium ${
                      isActive ? "text-bone-100" : "text-bone-400"
                    }`}
                  >
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="text-[10px] text-bone-300 mt-0.5 hidden sm:block">
                      {s.description}
                    </p>
                  )}
                </div>
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
