"use client";

import React from "react";
import type { GlossaryTerm } from "@/data/glossary";

export interface TermCardProps {
  term: GlossaryTerm;
  variant?: "compact" | "full";
  isHighlighted?: boolean;
  onClick?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
}

export const TermCard: React.FC<TermCardProps> = ({
  term,
  variant = "compact",
  isHighlighted = false,
  onClick,
  onPrev,
  onNext,
  showNavigation = false,
}) => {
  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={`p-3.5 rounded-lg border transition-colors duration-150 cursor-pointer ${
          isHighlighted
            ? "bg-ink-800 border-bone-100 shadow-card"
            : "bg-ink-900 border-ink-700 hover:border-bone-300 hover:bg-ink-850"
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <h4 className="text-[14px] font-bold text-bone-100 truncate">
              {term.term}
            </h4>
            <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider">
              {term.group}
            </span>
          </div>
          {term.verified && (
            <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-950 border border-ink-700 text-bone-300">
              Pakem Adat
            </span>
          )}
        </div>

        <p className="text-[12px] text-bone-200 leading-relaxed mb-2.5 line-clamp-2">
          {term.short}
        </p>

        <div className="text-[11px] text-bone-400 bg-ink-950 p-2.5 rounded border border-ink-700/80 line-clamp-2 leading-relaxed">
          <span className="text-bone-200 font-semibold">Fungsi:</span>{" "}
          {term.why}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-4 border-b border-ink-700">
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold text-bone-100 mb-1">{term.term}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider">
              {term.group}
            </span>
            {term.verified && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ink-700 text-bone-200 bg-ink-950 text-[10px] font-mono font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-bone-100" />
                <span>Pedoman Adat Terverifikasi</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Definisi */}
      <section className="space-y-1.5">
        <h3 className="text-[12px] font-mono font-semibold text-bone-400 uppercase tracking-wider">
          Definisi Arsitektural
        </h3>
        <p className="text-[14px] text-bone-100 leading-relaxed">{term.short}</p>
      </section>

      {/* Mengapa Penting */}
      <section className="space-y-1.5">
        <h3 className="text-[12px] font-mono font-semibold text-bone-400 uppercase tracking-wider">
          Kaidah &amp; Alasan Tata Ruang
        </h3>
        <p className="text-[13px] text-bone-300 leading-relaxed">{term.why}</p>
      </section>

      {/* Contoh */}
      {term.example && (
        <section className="space-y-1.5 p-3.5 bg-ink-950 border border-ink-700 rounded-lg">
          <h3 className="text-[11px] font-mono font-semibold text-bone-300 uppercase tracking-wider">
            Contoh Penerapan
          </h3>
          <p className="text-[12px] text-bone-400 leading-relaxed">{term.example}</p>
        </section>
      )}

      {/* Navigation */}
      {showNavigation && (
        <div className="flex items-center justify-between pt-4 border-t border-ink-700">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            className="min-h-[40px] flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Istilah Sebelumnya</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext}
            className="min-h-[40px] flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Istilah Berikutnya</span>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
