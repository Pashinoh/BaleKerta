"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { GLOSSARY_TERMS } from "@/data/glossary";
import { GlossarySearch } from "./GlossarySearch";
import { TermCard } from "./TermCard";

export interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string | null;
}

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({
  isOpen,
  onClose,
  initialTermId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<"Semua" | "Arah" | "9 Zona" | "Bangunan" | "Pedoman" | "Ukuran" | "Aturan">("Semua");
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Scroll to initial term if specified
  useEffect(() => {
    if (isOpen && initialTermId && itemRefs.current[initialTermId]) {
      setTimeout(() => {
        itemRefs.current[initialTermId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 200);
    }
  }, [isOpen, initialTermId]);

  // Filter terms
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((t) => {
      const matchGroup = selectedGroup === "Semua" || t.group === selectedGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.why.toLowerCase().includes(q);
      return matchGroup && matchSearch;
    });
  }, [searchQuery, selectedGroup]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink-950/80 transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl h-full bg-ink-900 border-l border-ink-700 flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-ink-700 bg-ink-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink-800 border border-ink-700 flex items-center justify-center text-peach">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-bone-100">Panduan</h2>
              <p className="text-[12px] text-bone-400 font-mono">Panduan singkat istilah arsitektur Bali</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded-lg transition-colors" aria-label="Tutup panduan">
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <GlossarySearch onSearch={setSearchQuery} onGroupChange={(grp) => setSelectedGroup(grp as "Semua" | "Arah" | "9 Zona" | "Bangunan" | "Pedoman" | "Ukuran" | "Aturan")} selectedGroup={selectedGroup} searchQuery={searchQuery} />

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12px] text-bone-400 px-1 font-mono">
              <span>Menampilkan {filteredTerms.length} istilah</span>
              <span>Total {GLOSSARY_TERMS.length} entri</span>
            </div>

            {filteredTerms.length === 0 ? (
              <div className="p-8 text-center text-bone-400 border border-dashed border-ink-700/60 rounded-xl bg-ink-950/50">
                Tidak ada istilah yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTerms.map((t) => {
                  const isTarget = initialTermId === t.id;
                  return (
                    <div
                      key={t.id}
                      ref={(el) => {
                        itemRefs.current[t.id] = el;
                      }}
                      className={`p-3 rounded-xl border transition-all duration-200 ${isTarget ? "bg-navy-800 border-peach shadow-card scale-[1.01]" : "bg-navy-800/80 border-ink-700/50 hover:border-peach/50 hover:bg-navy-800"}`}
                    >
                      <TermCard term={t} variant="compact" onClick={() => window.location.href = `/panduan?term=${t.id}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink-700 bg-ink-950 text-[12px] text-bone-400 flex items-center justify-between">
          <span className="font-mono text-bone-400">BaleKerta Cultural Reference Guide</span>
          <button type="button" onClick={() => window.location.href = "/panduan"} className="text-white hover:text-peach underline font-semibold transition-colors">
            Buka Panduan Lengkap
          </button>
        </div>
      </div>
    </div>
  );
};