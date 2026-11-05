"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Compass, Moon, Sun } from "lucide-react";
import { Button } from "../ui/Button";
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
    <header className="w-full border-b border-ink-700 bg-ink-900/95 backdrop-blur-sm sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[60px] py-2 flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-ink-950 border border-ink-600 flex items-center justify-center text-bone-100 shrink-0">
            <Compass size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[17px] sm:text-[18px] font-bold tracking-tight text-bone-100">
                BaleKerta
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono text-bone-400 bg-ink-950 border border-ink-700 rounded"
                title={apiOnline ? "Server analisis Sanga Mandala aktif" : "Server analisis tidak terhubung"}
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full ${
                    apiOnline ? "bg-bone-100" : "bg-clay"
                  }`}
                />
                <span>{apiOnline ? "Aktif" : "Offline"}</span>
              </span>
            </div>
            <p className="hidden md:block text-[11.5px] font-mono text-bone-400 truncate">
              Pra-Pemeriksaan Tata Ruang Adat Bali &middot; Asta Kosala-Kosali &amp; PBG
            </p>
          </div>
        </div>

        {/* Right Actions: Theme Switcher & Cultural Guide */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dual Theme Switcher (Dark Ink vs Soft Warm Lontar) */}
          <div
            role="group"
            aria-label="Pilih tema tampilan aplikasi"
            className="flex items-center p-0.5 bg-ink-950 border border-ink-700 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-[12px] font-mono flex items-center gap-1.5 transition-colors ${
                theme === "dark"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Gelap (Obsidian Ink)"
            >
              <Moon size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-[12px] font-mono flex items-center gap-1.5 transition-colors ${
                theme === "light"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Terang Lembut (Kertas Lontar - Tidak Silau)"
            >
              <Sun size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Terang</span>
            </button>
          </div>

          {/* Quick Glossary Drawer Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenGlossary}
            icon={<BookOpen size={14} />}
            aria-label="Buka kamus cepat istilah arsitektur Bali"
          >
            <span className="hidden sm:inline">Kamus Istilah</span>
            <span className="sm:hidden">Kamus</span>
          </Button>

          {/* Direct Link to Full Guide & Calculator */}
          <Link
            href="/panduan"
            className="hidden lg:inline-flex items-center justify-center min-h-[36px] px-3 py-1.5 text-[13px] font-medium rounded-lg bg-ink-950 text-bone-300 border border-ink-700 hover:text-bone-100 hover:border-ink-600 transition-colors"
          >
            Kalkulator Hasta
          </Link>
        </div>
      </div>
    </header>
  );
};
