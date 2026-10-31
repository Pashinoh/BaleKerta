"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, Search, Sliders } from "lucide-react";
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
        className="fixed inset-0 bg-ink-950/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl h-full bg-ink-900 border-l border-ink-700 flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-ink-700 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-bone-100">
              Panduan Istilah Adat Bali
            </h2>
            <p className="text-[13px] text-bone-400">
              Kamus arsitektur tradisional, arah suci, dan pedoman tata ruang
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded-md transition-colors"
            aria-label="Tutup panduan istilah"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-ink-700/80 space-y-3 bg-ink-950/50">
          {/* Search Box */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari istilah, misal: Natah, Kaja, Sanga Mandala..."
              className="w-full pl-9 pr-3 py-2 text-[14px] bg-ink-900 border border-ink-700 rounded-md text-bone-100 placeholder:text-bone-400/70 focus:outline-none focus:border-bone-100 transition-colors"
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
                  className={`text-[12px] px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                    isSelected
                      ? "bg-bone-100 text-ink-950 font-medium"
                      : "bg-ink-800 text-bone-400 hover:text-bone-100 hover:bg-ink-700"
                  }`}
                >
                  {grp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Anthropometric Calculator Section */}
          <div className="border border-ink-700 rounded-lg p-4 bg-ink-950/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-bone-400" />
                <h3 className="text-[14px] font-semibold text-bone-100">
                  Kalkulator Ukuran Adat
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 border border-ink-700 text-bone-400 rounded">
                Perkiraan
              </span>
            </div>
            <p className="text-[13px] text-bone-400 mb-4 leading-relaxed">
              Proporsi bangunan dalam Asta Kosala-Kosali mengacu pada modul tubuh
              pemilik rumah. Ukuran ini bersifat perkiraan antropometris.
            </p>

            {/* Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[13px]">
                <label htmlFor="hasta-slider" className="text-bone-400">
                  Panjang 1 Hasta (siku ke ujung jari):
                </label>
                <span className="font-mono text-bone-100 font-medium">
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
                className="w-full accent-bone-100 bg-ink-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-bone-400/80 font-mono">
                <span>38 cm (Kecil)</span>
                <span>44.5 cm (Rata-rata)</span>
                <span>52 cm (Tinggi)</span>
              </div>
            </div>

            {/* Computed Units Grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-ink-900 border border-ink-700 rounded">
                <span className="block text-[11px] text-bone-400">
                  1 Depa (4 Hasta)
                </span>
                <span className="font-mono text-[16px] font-semibold text-bone-100">
                  {depaCm} cm
                </span>
                <span className="block text-[11px] text-bone-400/80 mt-0.5">
                  Rentang 2 lengan
                </span>
              </div>
              <div className="p-2.5 bg-ink-900 border border-ink-700 rounded">
                <span className="block text-[11px] text-bone-400">
                  1 Musti (1/4 Hasta)
                </span>
                <span className="font-mono text-[16px] font-semibold text-bone-100">
                  {mustiCm} cm
                </span>
                <span className="block text-[11px] text-bone-400/80 mt-0.5">
                  Kepalan tangan
                </span>
              </div>
            </div>
          </div>

          {/* Term List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[13px] text-bone-400 px-1">
              <span>Menampilkan {filteredTerms.length} istilah</span>
              <span>Total {GLOSSARY_TERMS.length} entri</span>
            </div>

            {filteredTerms.length === 0 ? (
              <div className="p-8 text-center text-bone-400 border border-dashed border-ink-700 rounded-lg">
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
                    className={`p-4 rounded-lg border transition-colors ${
                      isTarget
                        ? "bg-ink-800 border-bone-100"
                        : "bg-ink-900 border-ink-700 hover:border-ink-600"
                    }`}
                  >
                    {/* Title + Group */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-[16px] font-medium text-bone-100">
                          {t.term}
                        </h4>
                        <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider">
                          {t.group}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded border font-mono ${
                          t.verified
                            ? "border-ink-700 text-bone-400"
                            : "border-ink-700 text-bone-400/70"
                        }`}
                        title={
                          t.verified
                            ? "Terverifikasi dalam pedoman adat / regulasi"
                            : "Ukuran atau interpretasi perkiraan adat"
                        }
                      >
                        {t.verified ? "Pedoman Adat" : "Perkiraan"}
                      </span>
                    </div>

                    {/* Short definition */}
                    <p className="text-[14px] text-bone-100 leading-relaxed mb-2.5">
                      {t.short}
                    </p>

                    {/* Why */}
                    <div className="text-[13px] text-bone-400 bg-ink-950 p-2.5 rounded border border-ink-700/60">
                      <span className="text-bone-100 font-medium">
                        Pengaruh pada tata letak denah:
                      </span>{" "}
                      {t.why}
                    </div>

                    {/* Example */}
                    {t.example && (
                      <p className="text-[12px] text-bone-400/90 italic mt-2">
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
        <div className="p-4 border-t border-ink-700 bg-ink-950/80 text-[12px] text-bone-400 flex items-center justify-between">
          <span>BaleKerta Cultural Reference Guide</span>
          <button
            type="button"
            onClick={onClose}
            className="text-bone-100 underline hover:text-bone-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
