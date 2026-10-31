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
    <header className="w-full border-b border-ink-700 bg-ink-950/90 backdrop-none sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-baseline gap-3">
          <span className="text-[18px] font-semibold tracking-tight text-bone-100">
            BaleKerta
          </span>
          <span className="hidden sm:inline-block text-[13px] text-bone-400 border-l border-ink-700 pl-3">
            Pra-Pemeriksaan Tata Ruang Adat Bali
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Glossary button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenGlossary}
            icon={<BookOpen size={15} className="text-bone-400" />}
            aria-label="Buka panduan istilah arsitektur Bali"
          >
            Panduan Istilah
          </Button>

          {/* API Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] text-bone-400 border border-ink-700 rounded-md"
            title={apiOnline ? "Layanan backend terhubung" : "Layanan backend terputus"}
          >
            <Circle
              size={8}
              className={
                apiOnline
                  ? "fill-bone-100 text-bone-100"
                  : "fill-clay text-clay"
              }
            />
            <span className="font-mono text-[12px]">
              {apiOnline ? "API aktif" : "API offline"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
