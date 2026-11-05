"use client";

import React from "react";
import type { GlossaryTerm } from "@/data/glossary";

export interface TermCardProps {
  term: GlossaryTerm;
  variant?: "compact" | "full";
  onClick?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
}

export const TermCard: React.FC<TermCardProps> = ({
  term,
  variant = "compact",
  onClick,
  onPrev,
  onNext,
  showNavigation = false,
}) => {
  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className="p-3 rounded-xl border bg-ink-800/80 border-ink-700/50 hover:border-peach/50 hover:bg-navy-800 transition-all duration-200 cursor-pointer"
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
            <span className="text-[11px] font-mono text-peach uppercase tracking-wider">
              {term.group}
            </span>
          </div>
        </div>

        <p className="text-[12px] text-bone-200 leading-relaxed mb-2 line-clamp-2">
          {term.short}
        </p>

        <div className="text-[11px] text-bone-400 bg-ink-950/80 p-2 rounded-lg border border-ink-700/50 line-clamp-2">
          <span className="text-bone-300 font-medium">Mengapa:</span>{" "}
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
          <span className="text-[11px] font-mono text-peach uppercase tracking-wider">
            {term.group}
          </span>
          {term.verified && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-peach/60 text-peach bg-berry-900/60 text-[10px] font-mono font-medium">
              <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-peach animate-pulse" />
              <span className="font-mono text-[10px]">Pedoman Adat</span>
            </span>
          )}
        </div>

        {/* Definisi */}
        <section className="space-y-1.5">
          <h3 className="text-[13px] font-semibold text-bone-100 uppercase tracking-wider text-peach">
            Definisi
          </h3>
          <p className="text-[14px] text-bone-200 leading-relaxed">{term.short}</p>
        </section>

        {/* Mengapa Penting */}
        <section className="space-y-1.5">
          <h3 className="text-[13px] font-semibold text-bone-100 uppercase tracking-wider text-peach">
            Mengapa Penting
          </h3>
          <p className="text-[13px] text-bone-300 leading-relaxed">{term.why}</p>
        </section>

        {/* Contoh */}
        {term.example && (
          <section className="space-y-1.5">
            <h3 className="text-[13px] font-semibold text-bone-100 uppercase tracking-wider text-peach">
              Contoh
            </h3>
            <p className="text-[12px] text-bone-400 italic">Contoh: {term.example}</p>
          </section>
        )}

        {/* Navigation */}
        {showNavigation && (
          <div className="flex items-center justify-between pt-4 border-t border-ink-700">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 9 6" />
              </svg>
              <span>Term Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-bone-300 hover:text-bone-100 hover:bg-ink-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Term Berikutnya</span>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};