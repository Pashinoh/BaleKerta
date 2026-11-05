"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Calculator, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export interface HeaderProps {
  onOpenGlossary: () => void;
  apiOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGlossary,
  apiOnline = true,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/90 backdrop-blur-md print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-bone-100 rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-bone-100 text-ink-950 flex items-center justify-center font-display font-bold text-[14px] tracking-tight shrink-0">
              BK
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-[17px] font-bold tracking-tight text-bone-100 font-display">
                BaleKerta
              </span>
              <span className="hidden md:inline-block text-[12px] text-bone-400">
                Pra-Pemeriksaan Tata Ruang Adat Bali
              </span>
            </div>
          </Link>

          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono text-bone-400 bg-ink-900 border border-ink-800"
            title={apiOnline ? "Mesin Geodesik & AI Siap" : "Mode Pratinjau Lokal"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiOnline ? "bg-emerald-500" : "bg-clay"
              }`}
            />
            <span>{apiOnline ? "Online" : "Lokal"}</span>
          </span>
        </div>

        {/* Right: Actions & Theme Switcher */}
        <div className="flex items-center gap-2">
          <Link
            href="/panduan"
            className="hidden sm:inline-flex min-h-[38px] items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-900 transition-colors"
          >
            <Calculator size={14} className="text-bone-400" />
            <span>Kalkulator Hasta</span>
          </Link>

          <button
            type="button"
            onClick={onOpenGlossary}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-900 transition-colors"
          >
            <BookOpen size={14} className="text-bone-400" />
            <span>Kamus Adat</span>
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
              className={`min-h-[32px] px-2.5 py-1 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                theme === "dark"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Gelap (Obsidian)"
            >
              <Moon size={13} />
              <span className="hidden xs:inline">Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`min-h-[32px] px-2.5 py-1 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                theme === "light"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Terang Hangat (Lontar Anti-Silau)"
            >
              <Sun size={13} />
              <span className="hidden xs:inline">Terang</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
