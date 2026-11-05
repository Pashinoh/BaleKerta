"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Calculator, Moon, Sun, Check, ChevronRight } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export interface HeaderProps {
  onOpenGlossary: () => void;
  apiOnline?: boolean;
  currentStep?: number;
  maxStepReached?: number;
  onSelectStep?: (step: number) => void;
}

const STEPS = [
  { number: 1, title: "Lokasi & Arah Kaja", shortTitle: "Lokasi" },
  { number: 2, title: "Denah Bangunan", shortTitle: "Denah" },
  { number: 3, title: "Hasil Evaluasi PBG", shortTitle: "Hasil PBG" },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenGlossary,
  apiOnline = true,
  currentStep = 1,
  maxStepReached = 3,
  onSelectStep,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header
      id="app-header"
      className="no-print shrink-0 border-b border-ink-800 bg-ink-950/95 backdrop-blur-md z-30"
    >
      <div className="w-full px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-bone-100 rounded-md"
          >
            <div className="w-7 h-7 rounded-md bg-bone-100 text-ink-950 flex items-center justify-center font-display font-bold text-[13px] tracking-tight shrink-0">
              BK
            </div>
            <span className="text-[16px] font-bold tracking-tight text-bone-100 font-display">
              BaleKerta
            </span>
          </Link>

          <span
            className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono text-bone-400 bg-ink-900 border border-ink-800"
            title={apiOnline ? "Mesin Geodesik & AI Siap" : "Mode Pratinjau Lokal"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiOnline ? "bg-emerald-500" : "bg-clay"
              }`}
            />
            <span>{apiOnline ? "Sistem Aktif" : "Mode Lokal"}</span>
          </span>
        </div>

        {/* Center: Integrated 3-Step Switcher (Desktop) */}
        {onSelectStep && (
          <nav
            aria-label="Tahapan pemeriksaan denah"
            className="hidden md:flex items-center gap-1.5 bg-ink-900 p-1 rounded-lg border border-ink-800"
          >
            {STEPS.map((s, idx) => {
              const isActive = currentStep === s.number;
              const isCompleted = currentStep > s.number;
              const isClickable = s.number <= Math.max(currentStep, maxStepReached, 3);

              return (
                <React.Fragment key={s.number}>
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onSelectStep(s.number)}
                    aria-current={isActive ? "step" : undefined}
                    className={`min-h-[32px] px-3 py-1 rounded-md flex items-center gap-2 text-[12.5px] transition-colors ${
                      isActive
                        ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                        : isCompleted
                        ? "text-bone-100 hover:bg-ink-800"
                        : "text-bone-400 hover:text-bone-200 hover:bg-ink-800/60"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-ink-950 text-bone-100"
                          : isCompleted
                          ? "bg-bone-100/20 text-bone-100"
                          : "border border-ink-700 text-bone-400"
                      }`}
                    >
                      {isCompleted ? <Check size={10} strokeWidth={3} /> : s.number}
                    </span>
                    <span className="whitespace-nowrap">{s.title}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight size={13} className="text-ink-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Right: Actions & Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/panduan"
            className="hidden lg:inline-flex min-h-[34px] items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12.5px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-900 transition-colors"
          >
            <Calculator size={13.5} className="text-bone-400" />
            <span>Kalkulator Hasta</span>
          </Link>

          <button
            type="button"
            onClick={onOpenGlossary}
            className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12.5px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-900 transition-colors"
          >
            <BookOpen size={13.5} className="text-bone-400" />
            <span className="hidden sm:inline">Kamus Adat</span>
          </button>

          <div className="h-4 w-px bg-ink-800 mx-0.5 hidden sm:block" />

          {/* Theme Switcher */}
          <div
            className="flex items-center p-0.5 rounded-lg border border-ink-800 bg-ink-900"
            role="group"
            aria-label="Pilih mode tampilan warna"
          >
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={`min-h-[28px] px-2 py-0.5 rounded-md text-[11.5px] font-medium flex items-center gap-1 transition-colors ${
                theme === "dark"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Gelap (Obsidian)"
            >
              <Moon size={12} />
              <span>Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`min-h-[28px] px-2 py-0.5 rounded-md text-[11.5px] font-medium flex items-center gap-1 transition-colors ${
                theme === "light"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Terang Hangat (Lontar Anti-Silau)"
            >
              <Sun size={12} />
              <span>Terang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Stepper Row (< md) */}
      {onSelectStep && (
        <div className="flex md:hidden items-center justify-between gap-1 px-3 py-1.5 border-t border-ink-800 bg-ink-900">
          {STEPS.map((s) => {
            const isActive = currentStep === s.number;
            const isCompleted = currentStep > s.number;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => onSelectStep(s.number)}
                className={`min-h-[32px] px-2 py-1 rounded-md flex items-center justify-center gap-1.5 text-[11.5px] sm:text-[12px] flex-1 whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                    : isCompleted
                    ? "text-bone-100 hover:bg-ink-800"
                    : "text-bone-400 hover:text-bone-200"
                }`}
              >
                <span className="font-mono font-bold">{s.number}.</span>
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{s.shortTitle}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
