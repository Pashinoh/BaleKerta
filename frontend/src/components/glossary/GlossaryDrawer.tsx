"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { X, BookOpen, ExternalLink } from "lucide-react";
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
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Panduan Istilah Adat"
        className="relative w-full max-w-xl h-full bg-ink-900 border-l border-ink-700 flex flex-col shadow-2xl z-10"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-ink-700 bg-ink-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink-800 border border-ink-700 flex items-center justify-center text-bone-100">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-bone-100">
                Kamus Istilah Adat
              </h2>
              <p className="text-[12px] text-bone-400 font-mono">
                Asta Kosala-Kosali &amp; Asta Bumi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded-lg transition-colors"
            aria-label="Tutup panduan"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-ink-700 bg-ink-900">
          <GlossarySearch
            onSearch={setSearchQuery}
            onGroupChange={(grp) => setSelectedGroup(grp as "Semua" | "Arah" | "9 Zona" | "Bangunan" | "Pedoman" | "Ukuran" | "Aturan")}
            selectedGroup={selectedGroup}
            searchQuery={searchQuery}
          />
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12px] text-bone-400 px-1 font-mono">
              <span>Menampilkan {filteredTerms.length} istilah</span>
              <span>Total {GLOSSARY_TERMS.length} entri</span>
            </div>

            {filteredTerms.length === 0 ? (
              <div className="p-8 text-center text-bone-400 border border-dashed border-ink-700/60 rounded-lg bg-ink-950/50">
                Tidak ada istilah yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTerms.map((t) => {
                  const isTarget = initialTermId === t.id;
                  return (
                    <div
                      key={t.id}
                      ref={(el) => {
                        itemRefs.current[t.id] = el;
                      }}
                    >
                      <Link href={`/panduan?term=${t.id}`} onClick={onClose} className="block">
                        <TermCard term={t} variant="compact" isHighlighted={isTarget} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Links to Full Guide & Calculator */}
        <div className="p-4 border-t border-ink-700 bg-ink-950 text-[12px] text-bone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-bone-400 text-[11px]">
            Pedoman Arsitektur Tradisional Bali
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/panduan"
              onClick={onClose}
              className="text-bone-100 hover:text-bone-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Buka Halaman Panduan &amp; Kalkulator Hasta</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlossaryDrawer;
