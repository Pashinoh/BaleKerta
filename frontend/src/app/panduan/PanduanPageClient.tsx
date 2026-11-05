"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  Grid3X3,
  Search,
  Moon,
  Sun,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Compass,
  SlidersHorizontal,
} from "lucide-react";
import { GLOSSARY_TERMS, GlossaryGroup, GlossaryTerm } from "@/data/glossary";
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
  const [selectedTermId, setSelectedTermId] = useState<string | null>(
    initialTermParam || GLOSSARY_TERMS[0].id
  );
  const [selectedGroup, setSelectedGroup] = useState<"Semua" | GlossaryGroup>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(!!initialTermParam);

  const detailScrollRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);

  // Category slider interaction state & handlers
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isExpandedCategories, setIsExpandedCategories] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const hasMovedSlider = useRef(false);

  const checkSliderScroll = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  };

  useEffect(() => {
    checkSliderScroll();
    const handleResize = () => checkSliderScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Translate mouse wheel to horizontal slider scroll
  const handleSliderWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isExpandedCategories) return;
    const el = sliderRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      el.scrollLeft += delta;
      checkSliderScroll();
    }
  };

  // Mouse / Pointer drag handlers for silky-smooth slide
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isExpandedCategories) return;
    const el = sliderRef.current;
    if (!el) return;
    setIsDraggingSlider(true);
    hasMovedSlider.current = false;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    const el = sliderRef.current;
    if (!el) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 4) {
      hasMovedSlider.current = true;
    }
    el.scrollLeft = dragStartScrollLeft.current - diff;
    checkSliderScroll();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    setIsDraggingSlider(false);
    const el = sliderRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture released automatically
      }
    }
    checkSliderScroll();
  };

  const slideByAmount = (amount: number) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkSliderScroll, 200);
  };

  const handleCategoryClick = (
    grp: "Semua" | GlossaryGroup,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (hasMovedSlider.current) {
      return;
    }
    setSelectedGroup(grp);
    if (!isExpandedCategories) {
      e.currentTarget.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setTimeout(checkSliderScroll, 250);
    }
  };

  // Sync term query param in browser URL
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

  // Filter terms by category and search query
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((t) => {
      const matchesGroup = selectedGroup === "Semua" || t.group === selectedGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.why.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }, [selectedGroup, searchQuery]);

  // Currently selected term object
  const selectedTerm: GlossaryTerm | undefined = useMemo(() => {
    if (!selectedTermId) return filteredTerms[0] || GLOSSARY_TERMS[0];
    const found = GLOSSARY_TERMS.find((t) => t.id === selectedTermId);
    return found || filteredTerms[0] || GLOSSARY_TERMS[0];
  }, [selectedTermId, filteredTerms]);

  // Previous and Next term indices within active filtered list
  const { prevTerm, nextTerm } = useMemo(() => {
    if (!selectedTerm) return { prevTerm: null, nextTerm: null };
    const currentIndex = filteredTerms.findIndex((t) => t.id === selectedTerm.id);
    if (currentIndex === -1) return { prevTerm: null, nextTerm: null };
    const prev = currentIndex > 0 ? filteredTerms[currentIndex - 1] : null;
    const next = currentIndex < filteredTerms.length - 1 ? filteredTerms[currentIndex + 1] : null;
    return { prevTerm: prev, nextTerm: next };
  }, [filteredTerms, selectedTerm]);

  // Select a term: updates state, auto-scrolls detail reader to top, and opens mobile detail
  const handleSelectTerm = (termId: string) => {
    setSelectedTermId(termId);
    setIsMobileDetailOpen(true);
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  // Group terms count map
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: GLOSSARY_TERMS.length };
    GLOSSARY_TERMS.forEach((t) => {
      counts[t.group] = (counts[t.group] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div
      id="app-root"
      className="h-screen overflow-hidden flex flex-col bg-ink-950 text-bone-100 font-sans selection:bg-bone-100/20 selection:text-bone-100"
    >
      {/* 1. TOP HEADER (14 = 56px height, matches main page) */}
      <header
        id="app-header"
        className="no-print shrink-0 border-b border-ink-800 bg-ink-950/95 backdrop-blur-md z-30"
      >
        <div className="w-full px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left: Back Link & Page Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
            <Link
              href="/"
              className="min-h-[34px] inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg border border-ink-800 bg-ink-900 text-bone-200 hover:text-bone-100 hover:bg-ink-800 text-[12px] sm:text-[12.5px] font-medium transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Kembali ke Denah</span>
              <span className="sm:hidden">Kembali</span>
            </Link>

            <div className="hidden sm:block h-4 w-px bg-ink-800" />

            <div className="hidden md:flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-bone-100 font-display tracking-tight">
                Panduan Arsitektur Bali
              </span>
              <span className="hidden xl:inline-block text-[11px] font-mono text-bone-400">
                Asta Kosala-Kosali &amp; Asta Bumi
              </span>
            </div>
          </div>

          {/* Center: Tab Switcher */}
          <nav
            aria-label="Pilihan topik panduan"
            className="flex items-center gap-1 bg-ink-900 p-1 rounded-lg border border-ink-800"
          >
            <button
              type="button"
              onClick={() => setActiveTab("kamus")}
              aria-current={activeTab === "kamus" ? "page" : undefined}
              className={`min-h-[30px] px-2.5 sm:px-3 py-1 rounded-md text-[11.5px] sm:text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === "kamus"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100 hover:bg-ink-800/60"
              }`}
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Glosarium</span>
              <span className="sm:hidden">Kamus</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kalkulator")}
              aria-current={activeTab === "kalkulator" ? "page" : undefined}
              className={`min-h-[30px] px-2.5 sm:px-3 py-1 rounded-md text-[11.5px] sm:text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === "kalkulator"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100 hover:bg-ink-800/60"
              }`}
            >
              <Calculator size={13} />
              <span className="hidden md:inline">Kalkulator Hasta</span>
              <span className="md:hidden">Hasta</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sanga-mandala")}
              aria-current={activeTab === "sanga-mandala" ? "page" : undefined}
              className={`min-h-[30px] px-2.5 sm:px-3 py-1 rounded-md text-[11.5px] sm:text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === "sanga-mandala"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100 hover:bg-ink-800/60"
              }`}
            >
              <Grid3X3 size={13} />
              <span className="hidden md:inline">Sanga Mandala</span>
              <span className="md:hidden">9 Zona</span>
            </button>
          </nav>

          {/* Right: Theme Switcher */}
          <div
            className="flex items-center p-0.5 rounded-lg border border-ink-800 bg-ink-900 shrink-0"
            role="group"
            aria-label="Pilih mode tampilan warna"
          >
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={`min-h-[28px] px-2 py-0.5 rounded-md text-[11.5px] font-medium flex items-center gap-1 transition-colors ${
                theme === "dark"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Gelap"
            >
              <Moon size={12} />
              <span className="hidden sm:inline">Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`min-h-[28px] px-2 py-0.5 rounded-md text-[11.5px] font-medium flex items-center gap-1 transition-colors ${
                theme === "light"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Terang (Lontar Anti-Silau)"
            >
              <Sun size={12} />
              <span className="hidden sm:inline">Terang</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY VIEWPORT (100vh Fill) */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {activeTab === "kalkulator" ? (
          /* ============================================================== */
          /* TAB 2: KALKULATOR HASTA                                        */
          /* ============================================================== */
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-4">
              <div>
                <h1 className="text-[20px] sm:text-[22px] font-bold text-bone-100 tracking-tight font-display">
                  Kalkulator Sikut &amp; Satuan Adat Bali
                </h1>
                <p className="text-[13px] text-bone-400 mt-1 leading-relaxed">
                  Dalam pakem Asta Kosala-Kosali, bangunan tradisional diukur menggunakan proporsi antropometrik tubuh kepala keluarga (Hasta, Depa, Musti). Alat ini mempermudah konversi satuan tradisional ke sistem metrik modern saat penyusunan berkas PBG.
                </p>
              </div>
              <GlossaryCalculator />
            </div>
          </div>
        ) : activeTab === "sanga-mandala" ? (
          /* ============================================================== */
          /* TAB 3: SANGA MANDALA STRUCTURE OVERVIEW                        */
          /* ============================================================== */
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-[20px] sm:text-[22px] font-bold text-bone-100 tracking-tight font-display">
                  Struktur Sembilan Zona Sanga Mandala
                </h1>
                <p className="text-[13px] text-bone-400 mt-1 leading-relaxed">
                  Sanga Mandala membagi tapak pekarangan menjadi 3×3 kuadran berdasarkan perpotongan sumbu kosmis Gunung Agung (Kaja - Kelod) dan edaran Matahari (Kangin - Kauh).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 bg-ink-900 border border-ink-800 rounded-xl space-y-2">
                  <span className="text-[10.5px] font-mono text-bone-100 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink-950 border border-ink-700 inline-block">
                    Utamaning Utama (Kaja-Kangin)
                  </span>
                  <h2 className="text-[15px] font-bold text-bone-100">Kuadran Paling Suci</h2>
                  <p className="text-[12.5px] text-bone-400 leading-relaxed">
                    Tempat berdirinya Pemerajan / Sanggah Kemulan keluarga. Merupakan titik tertinggi kesucian menghadap Gunung Agung dan matahari terbit.
                  </p>
                </div>

                <div className="p-4 sm:p-5 bg-ink-900 border border-ink-800 rounded-xl space-y-2">
                  <span className="text-[10.5px] font-mono text-bone-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink-950 border border-ink-700 inline-block">
                    Madyaning Madya (Titik Tengah)
                  </span>
                  <h2 className="text-[15px] font-bold text-bone-100">Natah Terbuka</h2>
                  <p className="text-[12.5px] text-bone-400 leading-relaxed">
                    Halaman tengah terbuka tanpa atap masif sebagai titik keseimbangan Akasa dan Pertiwi, penghubung antar-paviliun, dan sirkulasi alami.
                  </p>
                </div>

                <div className="p-4 sm:p-5 bg-ink-900 border border-ink-800 rounded-xl space-y-2">
                  <span className="text-[10.5px] font-mono text-clay font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-clay/10 border border-clay/40 inline-block">
                    Nistaning Nista (Kelod-Kauh)
                  </span>
                  <h2 className="text-[15px] font-bold text-bone-100">Zona Teba / Pembuangan</h2>
                  <p className="text-[12.5px] text-bone-400 leading-relaxed">
                    Sisi terhilir pekarangan tempat alokasi utilitas sanitasi, kamar mandi/toilet, kandang ternak, dan area penampungan sampah pekarangan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* TAB 1: GLOSARIUM 100VH MASTER-DETAIL STUDIO                    */
          /* ============================================================== */
          <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-hidden">
            {/* PANE 1 (LEFT): SEARCH & LIST OF TERMS (INDEPENDENT SCROLL) */}
            <div
              className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 h-full flex flex-col border-r border-ink-800 bg-ink-950 overflow-hidden ${
                isMobileDetailOpen ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Search Bar & Category Filter Bar */}
              <div className="shrink-0 p-3.5 border-b border-ink-800 bg-ink-950 space-y-2.5">
                {/* Search Box */}
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-3 text-bone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari istilah (Sanggah, Natah, Kaja)..."
                    aria-label="Cari istilah adat"
                    className="w-full min-h-[38px] pl-9 pr-8 py-1.5 rounded-lg bg-ink-900 border border-ink-700 text-[12.5px] text-bone-100 placeholder:text-bone-400/70 focus:outline-none focus:border-bone-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Hapus pencarian"
                      className="absolute right-2.5 text-bone-400 hover:text-bone-100"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Category Filter Bar with Smooth Sliding Controls & Wrap Toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-bone-400 font-semibold">
                      Kategori Istilah
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsExpandedCategories(!isExpandedCategories)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-bone-400 hover:text-bone-100 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-900 border border-transparent hover:border-ink-800"
                      title={isExpandedCategories ? "Kembali ke tampilan slider (1 baris)" : "Tampilkan semua kategori (2 baris tanpa geser)"}
                    >
                      {isExpandedCategories ? (
                        <>
                          <SlidersHorizontal size={11} />
                          <span>Mode Geser</span>
                        </>
                      ) : (
                        <>
                          <Grid3X3 size={11} />
                          <span>Buka Semua</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Slider or Wrap Container */}
                  <div className="relative flex items-center gap-1">
                    {/* Left Chevron Button (Active in slider mode) */}
                    {!isExpandedCategories && (
                      <button
                        type="button"
                        disabled={!canScrollLeft}
                        onClick={() => slideByAmount(-120)}
                        aria-label="Geser kategori ke kiri"
                        className={`shrink-0 w-6 h-7 rounded flex items-center justify-center border transition-all ${
                          canScrollLeft
                            ? "bg-ink-900 text-bone-200 border-ink-700 hover:bg-ink-800 hover:text-bone-100 cursor-pointer shadow-sm active:scale-95"
                            : "bg-ink-950 text-ink-700 border-ink-850 cursor-not-allowed opacity-35"
                        }`}
                      >
                        <ChevronLeft size={13} />
                      </button>
                    )}

                    {/* Scrollable Pills Track */}
                    <div
                      ref={sliderRef}
                      onWheel={handleSliderWheel}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      className={`min-w-0 flex-1 ${
                        isExpandedCategories
                          ? "flex flex-wrap gap-1.5 pt-0.5"
                          : "flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth select-none cursor-grab active:cursor-grabbing pb-0.5"
                      }`}
                    >
                      {CATEGORY_GROUPS.map((grp) => {
                        const isSelected = selectedGroup === grp;
                        const count = groupCounts[grp] || 0;
                        return (
                          <button
                            key={grp}
                            type="button"
                            onClick={(e) => handleCategoryClick(grp, e)}
                            className={`min-h-[28px] text-[11.5px] px-2.5 py-0.5 rounded-md shrink-0 font-medium border transition-colors flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold shadow-sm"
                                : "bg-ink-900 text-bone-400 border-ink-800 hover:text-bone-100 hover:bg-ink-850"
                            }`}
                          >
                            <span>{grp}</span>
                            <span
                              className={`text-[10px] font-mono px-1 rounded ${
                                isSelected
                                  ? "bg-ink-950/20 text-ink-950 font-bold"
                                  : "bg-ink-950 text-bone-400"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Chevron Button (Active in slider mode) */}
                    {!isExpandedCategories && (
                      <button
                        type="button"
                        disabled={!canScrollRight}
                        onClick={() => slideByAmount(120)}
                        aria-label="Geser kategori ke kanan"
                        className={`shrink-0 w-6 h-7 rounded flex items-center justify-center border transition-all ${
                          canScrollRight
                            ? "bg-ink-900 text-bone-200 border-ink-700 hover:bg-ink-800 hover:text-bone-100 cursor-pointer shadow-sm active:scale-95"
                            : "bg-ink-950 text-ink-700 border-ink-850 cursor-not-allowed opacity-35"
                        }`}
                      >
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-bone-400 px-0.5">
                  <span>Menampilkan {filteredTerms.length} istilah</span>
                  <span>{selectedGroup}</span>
                </div>
              </div>

              {/* Scrollable Terms List (Scroll state persists independently!) */}
              <div
                ref={listScrollRef}
                className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5"
                role="listbox"
                aria-label="Daftar istilah adat"
              >
                {filteredTerms.length === 0 ? (
                  <div className="p-8 text-center text-bone-400 border border-dashed border-ink-800 rounded-xl bg-ink-900/40 text-[12.5px] space-y-1">
                    <p className="font-medium text-bone-200">Tidak ada istilah yang cocok</p>
                    <p className="text-[11.5px]">Coba kata kunci lain atau pilih kategori &quot;Semua&quot;.</p>
                  </div>
                ) : (
                  filteredTerms.map((t) => {
                    const isSelected = selectedTerm?.id === t.id;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectTerm(t.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-150 select-none ${
                          isSelected
                            ? "bg-ink-850 border-bone-100 shadow-sm text-bone-100 ring-1 ring-bone-100/30"
                            : "bg-ink-900/50 border-ink-800 hover:border-ink-700 hover:bg-ink-900 text-bone-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-[13.5px] font-semibold text-bone-100 leading-snug truncate">
                            {t.term}
                          </span>
                          <span
                            className={`shrink-0 text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              isSelected
                                ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                                : "bg-ink-950 text-bone-400 border-ink-800"
                            }`}
                          >
                            {t.group}
                          </span>
                        </div>
                        <p className="text-[12px] text-bone-400 leading-snug line-clamp-2">
                          {t.short}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* PANE 2 (RIGHT): DETAILED INSPECTOR / READER PANE */}
            <div
              ref={detailScrollRef}
              className={`flex-1 min-h-0 h-full overflow-y-auto p-4 sm:p-7 lg:p-9 bg-ink-900/30 ${
                isMobileDetailOpen ? "flex flex-col" : "hidden lg:flex lg:flex-col"
              }`}
            >
              {/* Mobile Back Button (< lg) */}
              <div className="lg:hidden pb-3 sm:pb-4 border-b border-ink-800 mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={() => setIsMobileDetailOpen(false)}
                  className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900 border border-ink-800 text-bone-200 hover:text-bone-100 text-[12px] sm:text-[12.5px] font-medium transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke Daftar Istilah ({filteredTerms.length})</span>
                </button>
              </div>

              {selectedTerm ? (
                <article className="max-w-2xl space-y-5 sm:space-y-6">
                  {/* Top Metadata & Navigation Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-ink-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-ink-950 border border-ink-700 text-bone-300 font-semibold">
                        Kelompok: {selectedTerm.group}
                      </span>
                      {selectedTerm.verified && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-ink-700 text-bone-200 bg-ink-950 text-[11px] font-mono">
                          <ShieldCheck size={12} className="text-emerald-500" />
                          <span>Pakem Adat Terverifikasi</span>
                        </span>
                      )}
                    </div>

                    {/* Sequential Navigation between terms */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={!prevTerm}
                        onClick={() => prevTerm && handleSelectTerm(prevTerm.id)}
                        title={prevTerm ? `Istilah sebelumnya: ${prevTerm.term}` : "Tidak ada sebelumnya"}
                        className="min-h-[30px] px-2 py-1 rounded border border-ink-800 bg-ink-900 text-bone-400 hover:text-bone-100 hover:bg-ink-850 disabled:opacity-30 disabled:cursor-not-allowed text-[11.5px] font-mono inline-flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft size={13} />
                        <span className="hidden sm:inline">Sebelum</span>
                      </button>
                      <button
                        type="button"
                        disabled={!nextTerm}
                        onClick={() => nextTerm && handleSelectTerm(nextTerm.id)}
                        title={nextTerm ? `Istilah berikutnya: ${nextTerm.term}` : "Tidak ada berikutnya"}
                        className="min-h-[30px] px-2 py-1 rounded border border-ink-800 bg-ink-900 text-bone-400 hover:text-bone-100 hover:bg-ink-850 disabled:opacity-30 disabled:cursor-not-allowed text-[11.5px] font-mono inline-flex items-center gap-1 transition-colors"
                      >
                        <span className="hidden sm:inline">Lanjut</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Term Title & Short Definition */}
                  <div className="space-y-2">
                    <h1 className="text-[24px] sm:text-[28px] font-bold text-bone-100 font-display tracking-tight leading-tight">
                      {selectedTerm.term}
                    </h1>
                    <p className="text-[15px] sm:text-[16px] text-bone-200 leading-relaxed font-sans">
                      {selectedTerm.short}
                    </p>
                  </div>

                  {/* Philosophical Meaning & Customary Regulation */}
                  <div className="p-4 sm:p-5 rounded-xl bg-ink-950 border border-ink-800 space-y-2">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-bone-100">
                      <Compass size={15} className="text-bone-400" />
                      <span>Makna Filosofis &amp; Kaidah Tata Ruang:</span>
                    </div>
                    <p className="text-[13px] sm:text-[13.5px] text-bone-300 leading-relaxed pl-6">
                      {selectedTerm.why}
                    </p>
                  </div>

                  {/* Real-world Application Example (if available) */}
                  {selectedTerm.example && (
                    <div className="p-4 rounded-xl bg-ink-900/60 border border-ink-800 space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-bone-400 font-semibold block">
                        Contoh Penerapan Nyata:
                      </span>
                      <p className="text-[13px] text-bone-200 leading-relaxed italic">
                        &ldquo;{selectedTerm.example}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Cross-linking to Calculator or Sanga Mandala */}
                  <div className="pt-2 border-t border-ink-800/80 flex items-center justify-between text-[12px] text-bone-400">
                    <span className="font-mono text-[11px]">
                      Rujukan: Asta Kosala-Kosali &amp; Perda Bali No. 5/2005
                    </span>

                    {selectedTerm.group === "Ukuran" ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab("kalkulator")}
                        className="inline-flex items-center gap-1 text-bone-200 hover:text-bone-100 font-medium transition-colors"
                      >
                        <span>Buka Kalkulator Hasta</span>
                        <ExternalLink size={12} />
                      </button>
                    ) : selectedTerm.group === "9 Zona" ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab("sanga-mandala")}
                        className="inline-flex items-center gap-1 text-bone-200 hover:text-bone-100 font-medium transition-colors"
                      >
                        <span>Lihat Peta 9 Zona</span>
                        <ExternalLink size={12} />
                      </button>
                    ) : null}
                  </div>
                </article>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-bone-400 space-y-2">
                  <BookOpen size={32} className="text-bone-400 mx-auto opacity-40" />
                  <p className="text-[14px] font-medium text-bone-200">
                    Pilih salah satu istilah di daftar samping untuk membaca ulasan lengkap.
                  </p>
                  <p className="text-[12px] text-bone-400">
                    Tersedia {GLOSSARY_TERMS.length} istilah arsitektur adat Bali terverifikasi.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanduanPageClient;
