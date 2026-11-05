"use client";

import React, { useState, useRef, useEffect } from "react";
import { getGlossaryTerm } from "@/data/glossary";

export interface TermProps {
  id: string;
  label?: string;
  children?: React.ReactNode;
  onOpenDrawer?: (termId: string) => void;
  onOpenGlossary?: () => void;
  className?: string;
}

export const Term: React.FC<TermProps> = ({
  id,
  label,
  children,
  onOpenDrawer,
  onOpenGlossary,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const termData = getGlossaryTerm(id);

  const displayText = children || label || (termData ? termData.term : id);

  const handleOpenDetailed = () => {
    setIsOpen(false);
    if (onOpenDrawer) {
      onOpenDrawer(termData ? termData.id : id);
    } else if (onOpenGlossary) {
      onOpenGlossary();
    } else {
      window.location.href = `/panduan?term=${termData ? termData.id : id}`;
    }
  };

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
    return <span className={`text-bone-100 ${className}`}>{displayText}</span>;
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
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bone-400 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>

          {/* Definition */}
          <p className="text-[13px] text-bone-100 leading-relaxed mb-2">
            {termData.short}
          </p>

          {/* Why it matters */}
          <div className="text-[12px] text-bone-400 bg-ink-950 p-2 rounded border border-ink-700/60 mb-2.5">
            <span className="text-bone-100 font-medium">
              Fungsi denah:
            </span>{" "}
            {termData.why}
          </div>

          {/* Action */}
          <button
            type="button"
            onClick={handleOpenDetailed}
            className="w-full flex items-center justify-between text-[12px] text-bone-400 hover:text-bone-100 hover:underline pt-1 transition-colors"
          >
            <span>Buka Panduan</span>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
      )}
    </span>
  );
};