"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, Search, Sliders, BookOpen } from "lucide-react";
import { GLOSSARY_TERMS, GlossaryGroup } from "@/data/glossary";

export interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string | null;
}

const GROUPS: ("Semua" | GlossaryGroup)[] = [
  "Semua",
  "Arah",
  "9 Zona",
  "Bangunan",
  "Pedoman",
  "Ukuran",
  "Aturan",
];

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({
  isOpen,
  onClose,
  initialTermId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<"Semua" | GlossaryGroup>("Semua");
  const [hastaCm, setHastaCm] = useState<number>(44.5);
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

  // Anthropometric calculations
  const depaCm = (hastaCm * 4).toFixed(1);
  const mustiCm = (hastaCm / 4).toFixed(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl h-full bg-navy-900 border-l border-berry-700/70 flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-berry-700/60 bg-navy-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-cta flex items-center justify-center text-white shadow-cta">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white">
                Panduan Istilah Adat Bali
              </h2>
              <p className="text-[12px] text-peach-300 font-mono">
                Kamus arsitektur tradisional, arah suci, dan pedoman Asta Bumi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-bone-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
            aria-label="Tutup panduan istilah"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-berry-700/50 space-y-3 bg-navy-950/50">
          {/* Search Box */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-peach"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari istilah, misal: Natah, Kaja, Sanga Mandala..."
              className="w-full pl-9 pr-3 py-2.5 text-[14px] bg-navy-900 border border-berry-700/60 rounded-lg text-white placeholder:text-bone-400 focus:outline-none focus:border-peach transition-colors"
            />
          </div>

          {/* Group Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {GROUPS.map((grp) => {
              const isSelected = selectedGroup === grp;
              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`text-[12px] px-3 py-1 rounded-full shrink-0 font-medium transition-all ${
                    isSelected
                      ? "bg-gradient-cta text-white shadow-cta"
                      : "bg-navy-800 text-bone-300 border border-berry-700/60 hover:text-white hover:bg-berry-800"
                  }`}
                >
                  {grp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Anthropometric Calculator Section */}
          <div className="border border-berry-700/60 rounded-xl p-4 bg-navy-950/80 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-peach" />
                <h3 className="text-[14px] font-bold text-white">
                  Kalkulator Ukuran Adat (Asta Kosala-Kosali)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 border border-berry-700/60 text-peach rounded-full bg-berry-900/60">
                Antropometri
              </span>
            </div>
            <p className="text-[12px] text-bone-300 mb-3.5 leading-relaxed">
              Proporsi bangunan dalam arsitektur Bali mengacu pada modul tubuh
              pemilik rumah (antropometris) demi keselarasan spiritual dan mikrokosmos.
            </p>

            {/* Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[13px]">
                <label htmlFor="hasta-slider" className="text-bone-300">
                  Panjang 1 Hasta (siku ke ujung jari tengah):
                </label>
                <span className="font-mono text-peach font-bold text-[14px]">
                  {hastaCm} cm
                </span>
              </div>
              <input
                id="hasta-slider"
                type="range"
                min={38}
                max={52}
                step={0.5}
                value={hastaCm}
                onChange={(e) => setHastaCm(parseFloat(e.target.value))}
                className="w-full accent-peach bg-navy-800 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-bone-400 font-mono">
                <span>38 cm (Kecil)</span>
                <span>44.5 cm (Rata-rata)</span>
                <span>52 cm (Tinggi)</span>
              </div>
            </div>

            {/* Computed Units Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-navy-900 border border-berry-700/60 rounded-lg">
                <span className="block text-[11px] text-bone-400 font-mono">
                  1 Depa (4 Hasta)
                </span>
                <span className="font-mono text-[16px] font-bold text-peach">
                  {depaCm} cm
                </span>
                <span className="block text-[11px] text-bone-400 mt-0.5">
                  Rentang 2 lengan terbuka
                </span>
              </div>
              <div className="p-3 bg-navy-900 border border-berry-700/60 rounded-lg">
                <span className="block text-[11px] text-bone-400 font-mono">
                  1 Musti (1/4 Hasta)
                </span>
                <span className="font-mono text-[16px] font-bold text-peach">
                  {mustiCm} cm
                </span>
                <span className="block text-[11px] text-bone-400 mt-0.5">
                  Kepalan tangan rapat
                </span>
              </div>
            </div>
          </div>

          {/* Term List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12px] text-peach-300 px-1 font-mono">
              <span>Menampilkan {filteredTerms.length} istilah</span>
              <span>Total {GLOSSARY_TERMS.length} entri</span>
            </div>

            {filteredTerms.length === 0 ? (
              <div className="p-8 text-center text-bone-400 border border-dashed border-berry-700/60 rounded-xl bg-navy-950/50">
                Tidak ada istilah yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredTerms.map((t) => {
                const isTarget = initialTermId === t.id;
                return (
                  <div
                    key={t.id}
                    ref={(el) => {
                      itemRefs.current[t.id] = el;
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isTarget
                        ? "bg-navy-800 border-peach shadow-card scale-[1.01]"
                        : "bg-navy-800/80 border-berry-700/50 hover:border-peach/50 hover:bg-navy-800"
                    }`}
                  >
                    {/* Title + Group */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-[15px] font-bold text-white">
                          {t.term}
                        </h4>
                        <span className="text-[11px] font-mono text-peach uppercase tracking-wider">
                          {t.group}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-medium ${
                          t.verified
                            ? "border-peach/60 text-peach bg-berry-900/60"
                            : "border-berry-700/80 text-bone-400"
                        }`}
                      >
                        {t.verified ? "Pedoman Adat" : "Perkiraan"}
                      </span>
                    </div>

                    {/* Short definition */}
                    <p className="text-[13px] text-bone-200 leading-relaxed mb-2.5">
                      {t.short}
                    </p>

                    {/* Why */}
                    <div className="text-[12px] text-bone-300 bg-navy-950/80 p-2.5 rounded-lg border border-berry-700/50">
                      <span className="text-peach font-semibold">
                        Pengaruh pada denah:
                      </span>{" "}
                      {t.why}
                    </div>

                    {/* Example */}
                    {t.example && (
                      <p className="text-[11px] text-bone-400 italic mt-2">
                        Contoh: {t.example}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-berry-700/60 bg-navy-950 text-[12px] text-bone-400 flex items-center justify-between">
          <span className="font-mono text-peach-300">BaleKerta Cultural Reference Guide</span>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-peach underline font-semibold transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
