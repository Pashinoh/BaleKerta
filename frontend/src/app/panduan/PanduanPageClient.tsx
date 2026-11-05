"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, Calculator, Grid3X3, Search } from "lucide-react";
import { GLOSSARY_TERMS, GlossaryGroup } from "@/data/glossary";
import { GlossarySidebar } from "@/components/glossary/GlossarySidebar";
import { TermCard } from "@/components/glossary/TermCard";
import { GlossaryCalculator } from "@/components/glossary/GlossaryCalculator";

type PanduanTab = "kamus" | "kalkulator" | "sanga-mandala";

export const PanduanPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const initialTermParam = searchParams.get("term");
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
      <header className="border-b border-ink-700 bg-ink-900 sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-700 bg-ink-950 text-bone-100 hover:bg-ink-800 text-[13px] font-medium transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Pemeriksaan Denah</span>
          </Link>
          <div className="hidden md:block h-5 w-px bg-ink-700" />
          <div className="hidden md:block">
            <span className="text-[15px] font-bold text-bone-100 block leading-tight">
              Panduan Arsitektur Bali
            </span>
            <span className="text-[11px] font-mono text-bone-400">
              Referensi Asta Kosala-Kosali & Asta Bumi
            </span>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-0.5 bg-ink-950 border border-ink-700 rounded-lg text-[13px]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("kamus");
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === "sanga-mandala"
                  ? "bg-bone-100 text-ink-950 font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
            >
              <Grid3X3 size={14} />
              <span>Sanga Mandala</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Contents */}
      {activeTab === "kalkulator" ? (
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-[20px] font-bold text-bone-100">
              Kalkulator Sikut & Satuan Adat Bali
            </h2>
            <p className="text-[13px] text-bone-400 leading-relaxed">
              Dalam pakem Asta Kosala-Kosali, bangunan tradisional diukur menggunakan proporsi antropometrik tubuh kepala keluarga (Hasta, Depa, Musti). Alat ini mempermudah konversi satuan tradisional ke sistem metrik modern saat penyusunan berkas PBG.
            </p>
          </div>
          <GlossaryCalculator />
        </main>
      ) : activeTab === "sanga-mandala" ? (
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-[20px] font-bold text-bone-100">
              Struktur Sembilan Zona Sanga Mandala
            </h2>
            <p className="text-[13px] text-bone-400 leading-relaxed">
              Sanga Mandala membagi tapak pekarangan menjadi 3×3 kuadran berdasarkan perpotongan sumbu kosmis Gunung Agung (Kaja - Kelod) dan edaran Matahari (Kangin - Kauh).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-ink-900 border border-ink-700 rounded-xl space-y-2">
              <span className="text-[12px] font-mono text-peach font-bold uppercase">
                Utamaning Utama (Kaja-Kangin)
              </span>
              <h3 className="text-[15px] font-bold text-bone-100">Kuadran Paling Suci</h3>
              <p className="text-[13px] text-bone-400 leading-relaxed">
                Tempat berdirinya Pemerajan / Sanggah Kemulan keluarga. Merupakan titik tertinggi kesucian menghadap Gunung Agung dan matahari terbit.
              </p>
            </div>

            <div className="p-4 bg-ink-900 border border-ink-700 rounded-xl space-y-2">
              <span className="text-[12px] font-mono text-bone-400 font-bold uppercase">
                Madyaning Madya (Titik Tengah)
              </span>
              <h3 className="text-[15px] font-bold text-bone-100">Natah Terbuka</h3>
              <p className="text-[13px] text-bone-400 leading-relaxed">
                Halaman tengah terbuka tanpa atap masif sebagai titik keseimbangan Akasa dan Pertiwi, penghubung antar-paviliun, dan sirkulasi alami.
              </p>
            </div>

            <div className="p-4 bg-ink-900 border border-ink-700 rounded-xl space-y-2">
              <span className="text-[12px] font-mono text-clay font-bold uppercase">
                Nistaning Nista (Kelod-Kauh)
              </span>
              <h3 className="text-[15px] font-bold text-bone-100">Zona Teba / Pembuangan</h3>
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

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari istilah adat (misal: Sanggah, Natah, Paon)..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-ink-900 border border-ink-700 text-[13px] text-bone-100 placeholder:text-bone-400/60 focus:outline-none focus:border-bone-100"
              />
            </div>

            {selectedTermId && selectedTerm ? (
              <div className="max-w-2xl bg-ink-900 border border-ink-700 rounded-xl p-5 lg:p-6 space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedTermId(null)}
                  className="text-[13px] text-bone-400 hover:text-bone-100 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke seluruh istilah</span>
                </button>
                <div className="flex items-center justify-between pb-3 border-b border-ink-700">
                  <div>
                    <h2 className="text-[20px] font-bold text-bone-100">{selectedTerm.term}</h2>
                    <span className="text-[11px] font-mono text-peach uppercase tracking-wider">
                      Kelompok: {selectedTerm.group}
                    </span>
                  </div>
                </div>
                <p className="text-[15px] text-bone-100 leading-relaxed">
                  {selectedTerm.short}
                </p>
                <div className="bg-ink-950 border border-ink-700/60 rounded-lg p-4 text-[13px] text-bone-300 space-y-2 leading-relaxed">
                  <div className="font-semibold text-bone-100">Makna Filosofis & Regulasi:</div>
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
                  <div className="p-8 text-center text-bone-400 border border-dashed border-ink-700/60 rounded-xl bg-ink-900">
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
