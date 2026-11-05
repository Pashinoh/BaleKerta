"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, Calculator, Grid3X3, Search, Moon, Sun } from "lucide-react";
import { GLOSSARY_TERMS, GlossaryGroup } from "@/data/glossary";
import { GlossarySidebar } from "@/components/glossary/GlossarySidebar";
import { TermCard } from "@/components/glossary/TermCard";
import { GlossaryCalculator } from "@/components/glossary/GlossaryCalculator";
import { useTheme } from "@/components/layout/ThemeProvider";

type PanduanTab = "kamus" | "kalkulator" | "sanga-mandala";

const CATEGORY_GROUPS: ("Semua" | GlossaryGroup)[] = [
  "Semua",
  "Arah",
  "9 Zona",
  "Bangunan",
  "Pedoman",
  "Ukuran",
  "Aturan",
];

export const PanduanPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const initialTermParam = searchParams.get("term");
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<PanduanTab>("kamus");
  const [selectedTermId, setSelectedTermId] = useState<string | null>(initialTermParam);
  const [selectedGroup, setSelectedGroup] = useState<"Semua" | GlossaryGroup>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (selectedTermId) {
        url.searchParams.set("term", selectedTermId);
      } else {
        url.searchParams.delete("term");
      }
      window.history.pushState(null, "", url.toString());
    }
  }, [selectedTermId]);

  const filteredTerms = GLOSSARY_TERMS.filter((t) => {
    const matchesGroup = selectedGroup === "Semua" || t.group === selectedGroup;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.term.toLowerCase().includes(q) ||
      t.short.toLowerCase().includes(q) ||
      t.why.toLowerCase().includes(q);
    return matchesGroup && matchesSearch;
  });

  const selectedTerm = GLOSSARY_TERMS.find((t) => t.id === selectedTermId);

  return (
    <div className="min-h-screen bg-ink-950 text-bone-100 font-sans selection:bg-bone-100 selection:text-ink-950 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-ink-700 bg-ink-900 sticky top-0 z-40 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-700 bg-ink-950 text-bone-100 hover:bg-ink-800 text-[13px] font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Kembali ke Pemeriksaan</span>
            </Link>
            <div className="hidden lg:block h-5 w-px bg-ink-700" />
            <div className="hidden lg:block">
              <span className="text-[15px] font-bold text-bone-100 block leading-tight">
                Panduan Arsitektur Bali
              </span>
              <span className="text-[11px] font-mono text-bone-400">
                Referensi Asta Kosala-Kosali &amp; Asta Bumi
              </span>
            </div>
          </div>

          {/* Mobile Theme Switcher */}
          <div
            className="flex md:hidden items-center p-0.5 rounded-lg border border-ink-700 bg-ink-950"
            role="group"
            aria-label="Pilih mode tampilan"
          >
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-[12px] font-mono flex items-center gap-1 transition-colors ${
                theme === "dark"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <Moon size={13} />
              <span>Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-[12px] font-mono flex items-center gap-1 transition-colors ${
                theme === "light"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <Sun size={13} />
              <span>Terang</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher & Desktop Theme Switcher */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 flex-wrap">
          <div className="flex p-1 bg-ink-950 border border-ink-700 rounded-lg text-[13px]">
            <button
              type="button"
              onClick={() => setActiveTab("kamus")}
              className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === "kamus"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <BookOpen size={14} />
              <span>Glosarium</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kalkulator")}
              className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === "kalkulator"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <Calculator size={14} />
              <span>Kalkulator Hasta</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sanga-mandala")}
              className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === "sanga-mandala"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <Grid3X3 size={14} />
              <span>Sanga Mandala</span>
            </button>
          </div>

          <div
            className="hidden md:flex items-center p-0.5 rounded-lg border border-ink-700 bg-ink-950"
            role="group"
            aria-label="Pilih mode tampilan"
          >
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={`min-h-[36px] px-2.5 py-1 rounded-md text-[12px] font-mono flex items-center gap-1.5 transition-colors ${
                theme === "dark"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <Moon size={13} />
              <span>Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`min-h-[36px] px-2.5 py-1 rounded-md text-[12px] font-mono flex items-center gap-1.5 transition-colors ${
                theme === "light"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <Sun size={13} />
              <span>Terang</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Contents */}
      {activeTab === "kalkulator" ? (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-[22px] font-bold text-bone-100 tracking-tight">
              Kalkulator Sikut &amp; Satuan Adat Bali
            </h1>
            <p className="text-[13px] text-bone-400 leading-relaxed">
              Dalam pakem Asta Kosala-Kosali, bangunan tradisional diukur menggunakan proporsi antropometrik tubuh kepala keluarga (Hasta, Depa, Musti). Alat ini mempermudah konversi satuan tradisional ke sistem metrik modern saat penyusunan berkas PBG.
            </p>
          </div>
          <GlossaryCalculator />
        </main>
      ) : activeTab === "sanga-mandala" ? (
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-[22px] font-bold text-bone-100 tracking-tight">
              Struktur Sembilan Zona Sanga Mandala
            </h1>
            <p className="text-[13px] text-bone-400 leading-relaxed">
              Sanga Mandala membagi tapak pekarangan menjadi 3×3 kuadran berdasarkan perpotongan sumbu kosmis Gunung Agung (Kaja - Kelod) dan edaran Matahari (Kangin - Kauh).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-ink-900 border border-ink-700 rounded-lg space-y-2">
              <span className="text-[11px] font-mono text-bone-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink-950 border border-ink-700 inline-block">
                Utamaning Utama (Kaja-Kangin)
              </span>
              <h2 className="text-[15px] font-bold text-bone-100">Kuadran Paling Suci</h2>
              <p className="text-[13px] text-bone-400 leading-relaxed">
                Tempat berdirinya Pemerajan / Sanggah Kemulan keluarga. Merupakan titik tertinggi kesucian menghadap Gunung Agung dan matahari terbit.
              </p>
            </div>

            <div className="p-4 bg-ink-900 border border-ink-700 rounded-lg space-y-2">
              <span className="text-[11px] font-mono text-bone-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink-950 border border-ink-700 inline-block">
                Madyaning Madya (Titik Tengah)
              </span>
              <h2 className="text-[15px] font-bold text-bone-100">Natah Terbuka</h2>
              <p className="text-[13px] text-bone-400 leading-relaxed">
                Halaman tengah terbuka tanpa atap masif sebagai titik keseimbangan Akasa dan Pertiwi, penghubung antar-paviliun, dan sirkulasi alami.
              </p>
            </div>

            <div className="p-4 bg-ink-900 border border-ink-700 rounded-lg space-y-2">
              <span className="text-[11px] font-mono text-clay font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-clay/10 border border-clay/40 inline-block">
                Nistaning Nista (Kelod-Kauh)
              </span>
              <h2 className="text-[15px] font-bold text-bone-100">Zona Teba / Pembuangan</h2>
              <p className="text-[13px] text-bone-400 leading-relaxed">
                Sisi terhilir pekarangan tempat alokasi utilitas sanitasi, kamar mandi/toilet, kandang ternak, dan area penampungan sampah pekarangan.
              </p>
            </div>
          </div>
        </main>
      ) : (
        /* Tab Kamus Glosarium */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <GlossarySidebar
            terms={GLOSSARY_TERMS}
            selectedTermId={selectedTermId}
            selectedGroup={selectedGroup}
            onGroupChange={(group) => setSelectedGroup(group)}
            onTermSelect={(termId) => setSelectedTermId(termId)}
            onGroupToggle={() => {}}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Mobile & Tablet Category Filter Bar (visible when sidebar is hidden below lg) */}
            <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORY_GROUPS.map((grp) => {
                const isSelected = selectedGroup === grp;
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`min-h-[36px] text-[12px] px-3 py-1 rounded-md shrink-0 font-medium border transition-colors ${
                      isSelected
                        ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                        : "bg-ink-900 text-bone-300 border-ink-700 hover:text-bone-100"
                    }`}
                  >
                    {grp}
                  </button>
                );
              })}
            </div>

            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari istilah adat (misal: Sanggah, Natah, Paon)..."
                aria-label="Cari istilah adat"
                className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-lg bg-ink-900 border border-ink-700 text-[13px] text-bone-100 placeholder:text-bone-400/70 focus:outline-none focus:border-bone-100"
              />
            </div>

            {selectedTermId && selectedTerm ? (
              <div className="max-w-2xl bg-ink-900 border border-ink-700 rounded-lg p-5 lg:p-6 space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedTermId(null)}
                  className="min-h-[36px] text-[13px] text-bone-400 hover:text-bone-100 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke seluruh istilah</span>
                </button>
                <div className="flex items-center justify-between pb-3 border-b border-ink-700">
                  <div>
                    <h1 className="text-[20px] font-bold text-bone-100">{selectedTerm.term}</h1>
                    <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider">
                      Kelompok: {selectedTerm.group}
                    </span>
                  </div>
                </div>
                <p className="text-[15px] text-bone-100 leading-relaxed">
                  {selectedTerm.short}
                </p>
                <div className="bg-ink-950 border border-ink-700/80 rounded-lg p-4 text-[13px] text-bone-300 space-y-2 leading-relaxed">
                  <div className="font-semibold text-bone-100">Makna Filosofis &amp; Regulasi:</div>
                  <p>{selectedTerm.why}</p>
                  {selectedTerm.example && (
                    <div className="pt-2 border-t border-ink-800 text-[12px] text-bone-400">
                      <strong>Contoh Penerapan:</strong> {selectedTerm.example}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[12px] font-mono text-bone-400">
                  Menampilkan {filteredTerms.length} istilah adat Bali
                </div>
                {filteredTerms.length === 0 ? (
                  <div className="p-8 text-center text-bone-400 border border-dashed border-ink-700/60 rounded-lg bg-ink-900">
                    Tidak ditemukan istilah yang sesuai dengan &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTerms.map((t) => (
                      <TermCard
                        key={t.id}
                        term={t}
                        variant="compact"
                        onClick={() => setSelectedTermId(t.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default PanduanPageClient;
