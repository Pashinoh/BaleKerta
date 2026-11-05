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
  { step: 1, label: "Lokasi Tanah", description: "Arah Kaja ke Gunung Agung" },
  { step: 2, label: "Denah Bangunan", description: "Pilih contoh atau unggah denah" },
  { step: 3, label: "Hasil Pemeriksaan", description: "Verifikasi kepatuhan ruang adat" },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  maxStepReached,
  onSelectStep,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, step: number, isClickable: boolean, currentStep: number, maxStepReached: number) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectStep(step);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextStep = STEPS.find(stepItem => 
        stepItem.step > step && stepItem.step <= Math.max(maxStepReached, currentStep)
      );
      if (nextStep) onSelectStep(nextStep.step);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevStep = [...STEPS].reverse().find(stepItem => 
        stepItem.step < step && stepItem.step <= Math.max(maxStepReached, currentStep)
      );
      if (prevStep) onSelectStep(prevStep.step);
    }
  };

  return (
    <nav
      aria-label="Alur pemeriksaan tata ruang adat Bali"
      className="w-full bg-ink-900 border border-ink-700 rounded-lg p-3 sm:p-4 shadow-sm"
    >
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
                  className={`h-[1px] flex-1 mx-2 sm:mx-4 transition-colors duration-150 ${
                    s.step <= currentStep
                      ? "bg-bone-400/60"
                      : "bg-ink-700"
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Item */}
              <li className="flex flex-col sm:flex-row items-center gap-2 min-w-0 flex-none">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectStep(s.step)}
                  onKeyDown={(e) => handleKeyDown(e, s.step, isClickable, currentStep, maxStepReached)}
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-mono text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-bone-100 ${
                    isActive
                      ? "bg-bone-100 text-ink-950 shadow-sm"
                      : isCompleted
                      ? "border border-bone-400 text-bone-400 bg-ink-850"
                      : isReached
                      ? "border border-ink-600 text-bone-400 hover:border-bone-400"
                      : "border border-ink-700 text-ink-600 cursor-not-allowed"
                  } ${isClickable && !isActive ? "cursor-pointer" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Langkah ${s.step}: ${s.label}`}
                >
                  {isCompleted ? (
                    <Check size={13} strokeWidth={2.5} className="text-bone-400" />
                  ) : (
                    s.step
                  )}
                </button>
                <div className="text-center sm:text-left">
                  <p
                    className={`text-[12px] leading-tight font-medium ${
                      isActive ? "text-bone-100 font-semibold" : "text-bone-400"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[11px] text-bone-400/80 mt-0.5 hidden md:block">
                    {s.description}
                  </p>
                </div>
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};