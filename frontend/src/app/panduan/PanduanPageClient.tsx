"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GLOSSARY_TERMS, GlossaryGroup } from "@/data/glossary";
import { GlossarySidebar } from "@/components/glossary/GlossarySidebar";
import { TermCard } from "@/components/glossary/TermCard";

export const PanduanPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const initialTermParam = searchParams.get("term");
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
    const matchesSearch =
      !searchQuery.trim() ||
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.short.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const selectedTerm = GLOSSARY_TERMS.find((t) => t.id === selectedTermId);

  return (
    <div className="min-h-screen bg-ink-950 text-bone-100 font-sans selection:bg-bone-100 selection:text-ink-950 flex flex-col">
      <header className="border-b border-ink-700 bg-ink-900 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-bold text-bone-100">Panduan</h1>
          <p className="text-[13px] text-bone-400 font-mono">Panduan lengkap istilah arsitektur Bali</p>
        </div>
        <div className="w-full sm:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari istilah..."
            className="w-full px-3 py-2 rounded-md bg-ink-900 border border-ink-700 text-[13px] text-bone-100 focus:outline-none focus:border-bone-100"
          />
        </div>
      </header>

      <div className="flex-1 flex flex-row overflow-hidden">
        <GlossarySidebar
          terms={GLOSSARY_TERMS}
          selectedTermId={selectedTermId}
          selectedGroup={selectedGroup}
          onGroupChange={(group) => setSelectedGroup(group)}
          onTermSelect={(termId) => setSelectedTermId(termId)}
          onGroupToggle={() => {}}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {selectedTermId && selectedTerm ? (
            <div className="max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setSelectedTermId(null)}
                className="mb-4 text-[13px] text-bone-400 hover:text-bone-100 flex items-center gap-1 transition-colors"
              >
                ← Kembali ke daftar
              </button>
              <div className="flex items-center justify-between pb-4 border-b border-ink-700 mb-4">
                <div className="flex items-start gap-3">
                  <h2 className="text-[17px] font-semibold text-bone-100">{selectedTerm.term}</h2>
                  <span className="text-[11px] font-mono text-peach uppercase tracking-wider">
                    {selectedTerm.group}
                  </span>
                </div>
              </div>
              <p className="text-[14px] text-bone-100 leading-relaxed mb-4">
                {selectedTerm.short}
              </p>
              <div className="bg-ink-950/50 border border-ink-700/50 rounded-lg p-4 text-[13px] text-bone-300 space-y-1 leading-relaxed">
                <p>{selectedTerm.why}</p>
                {selectedTerm.example && (
                  <p className="text-[12px] text-bone-400 italic mt-2">
                    Contoh: {selectedTerm.example}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </main>
      </div>
    </div>
  );
};

export default PanduanPageClient;
