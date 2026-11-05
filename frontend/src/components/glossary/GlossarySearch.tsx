"use client";

import React, { useState, useEffect } from "react";

export interface GlossarySearchProps {
  onSearch: (query: string) => void;
  onGroupChange: (group: "Semua" | "Arah" | "9 Zona" | "Bangunan" | "Pedoman" | "Ukuran" | "Aturan") => void;
  selectedGroup: "Semua" | "Arah" | "9 Zona" | "Bangunan" | "Pedoman" | "Ukuran" | "Aturan";
  searchQuery: string;
}

export const GlossarySearch: React.FC<GlossarySearchProps> = ({
  onSearch,
  onGroupChange,
  selectedGroup,
  searchQuery,
}) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(debouncedQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="space-y-3">
      {/* Search Box */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-400"
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={debouncedQuery}
          onChange={(e) => setDebouncedQuery(e.target.value)}
          placeholder="Cari istilah, misal: Natah, Kaja, Sanga Mandala..."
          className="w-full pl-9 pr-10 py-2.5 text-[14px] bg-ink-900 border border-ink-700 rounded-lg text-bone-100 placeholder:text-bone-400 focus:outline-none focus:border-bone-400 transition-colors"
        />
        {debouncedQuery && (
          <button
            type="button"
            onClick={() => setDebouncedQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-400 hover:text-bone-100"
            aria-label="Hapus pencarian"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Group Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {["Semua", "Arah", "9 Zona", "Bangunan", "Pedoman", "Ukuran", "Aturan"].map((grp) => {
          const isSelected = selectedGroup === grp;
          return (
            <button
              key={grp}
              type="button"
              onClick={() => onGroupChange(grp as "Semua" | "Arah" | "9 Zona" | "Bangunan" | "Pedoman" | "Ukuran" | "Aturan")}
              className={`text-[12px] px-3 py-1 rounded-full shrink-0 font-medium transition-all ${
                isSelected
                  ? "bg-ink-800 text-bone-100 font-medium"
                  : "bg-transparent text-bone-300 hover:text-bone-100 hover:bg-ink-800 border border-ink-700"
              }`}
            >
              {grp}
            </button>
          );
        })}
      </div>
    </div>
  );
};