import React from "react";
import { BookOpen, Circle } from "lucide-react";
import { Button } from "../ui/Button";

export interface HeaderProps {
  onOpenGlossary: () => void;
  apiOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGlossary,
  apiOnline = true,
}) => {
  return (
    <header className="w-full border-b border-ink-700 bg-ink-950 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[17px] sm:text-[18px] font-semibold tracking-tight text-bone-100">
              BaleKerta
            </span>
            <span className="hidden md:inline-block text-[12px] font-mono text-bone-400 border-l border-ink-700 pl-3">
              Pra-Pemeriksaan Tata Ruang Adat Bali · Sanga Mandala
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Glossary button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenGlossary}
            icon={<BookOpen size={14} className="text-bone-400" />}
            aria-label="Buka panduan istilah arsitektur Bali"
          >
            Panduan Istilah
          </Button>

          {/* API Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-bone-400 bg-ink-900 border border-ink-700 rounded"
            title={apiOnline ? "Layanan backend terhubung" : "Layanan backend terputus"}
          >
            <Circle
              size={7}
              className={
                apiOnline
                  ? "fill-bone-100 text-bone-100"
                  : "fill-clay text-clay"
              }
            />
            <span className="font-mono text-[11px]">
              {apiOnline ? "Sistem Aktif" : "API Offline"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
