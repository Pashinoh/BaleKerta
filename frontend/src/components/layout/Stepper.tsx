"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";

export interface StepperProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxStepReached?: number;
}

const STEPS = [
  { number: 1, title: "Lokasi & Arah Kaja" },
  { number: 2, title: "Denah Bangunan" },
  { number: 3, title: "Hasil Evaluasi PBG" },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onSelectStep,
  maxStepReached = 3,
}) => {
  return (
    <nav
       aria-label="Tahapan pemeriksaan denah"
      className="w-full print:hidden border-b border-ink-800 pb-4"
    >
      <ol className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isClickable = step.number <= Math.max(currentStep, maxStepReached, 3);

          return (
            <React.Fragment key={step.number}>
              <li className="shrink-0">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectStep(step.number)}
                  aria-current={isActive ? "step" : undefined}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg flex items-center gap-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                      : isCompleted
                      ? "bg-ink-900 text-bone-100 hover:bg-ink-800 border border-ink-800"
                      : "text-bone-400 hover:text-bone-200 hover:bg-ink-900/60"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-ink-950 text-bone-100"
                        : isCompleted
                        ? "bg-bone-100/20 text-bone-100"
                        : "border border-ink-700 text-bone-400"
                    }`}
                  >
                    {isCompleted ? <Check size={11} strokeWidth={3} /> : step.number}
                  </span>
                  <span className="text-[13px] whitespace-nowrap">{step.title}</span>
                </button>
              </li>

              {idx < STEPS.length - 1 && (
                <li aria-hidden="true" className="text-ink-600 shrink-0">
                  <ChevronRight size={15} />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
