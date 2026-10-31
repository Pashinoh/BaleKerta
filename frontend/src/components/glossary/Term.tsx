"use client";

import React, { useState, useRef, useEffect } from "react";
import { getGlossaryTerm } from "@/data/glossary";
import { ExternalLink, Info } from "lucide-react";

export interface TermProps {
  id: string;
  children?: React.ReactNode;
  onOpenDrawer?: (termId: string) => void;
  className?: string;
}

export const Term: React.FC<TermProps> = ({
  id,
  children,
  onOpenDrawer,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const termData = getGlossaryTerm(id);

  const displayText = children || (termData ? termData.term : id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!termData) {
    return <span className={className}>{displayText}</span>;
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onFocus={() => setIsOpen(true)}
        className={`underline decoration-dotted decoration-bone-400 underline-offset-4 font-normal text-bone-100 hover:text-bone-200 cursor-help focus-visible:outline-2 focus-visible:outline-bone-100 transition-colors ${className}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {displayText}
      </button>

      {/* Accessible Tooltip Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={termData.term}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 bg-ink-900 border border-ink-700 rounded-lg shadow-xl text-left pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-ink-700">
            <div>
              <span className="text-[14px] font-semibold text-bone-100 block">
                {termData.term}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-bone-400">
                {termData.group}
              </span>
            </div>
            <Info size={15} className="text-bone-400 shrink-0 mt-0.5" />
          </div>

          {/* Definition */}
          <p className="text-[13px] text-bone-100 leading-relaxed mb-2">
            {termData.short}
          </p>

          {/* Why it matters */}
          <div className="text-[12px] text-bone-400 bg-ink-950 p-2 rounded border border-ink-700/60 mb-2.5">
            <span className="text-bone-100 font-medium">Fungsi denah:</span>{" "}
            {termData.why}
          </div>

          {/* Action */}
          {onOpenDrawer && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenDrawer(termData.id);
              }}
              className="w-full flex items-center justify-between text-[12px] text-bone-400 hover:text-bone-100 hover:underline pt-1 transition-colors"
            >
              <span>Buka panduan lengkap</span>
              <ExternalLink size={13} />
            </button>
          )}
        </div>
      )}
    </span>
  );
};
