"use client";

import React, { useState, useEffect } from "react";
import { GlossaryGroup, GlossaryTerm } from "@/data/glossary";

export interface GlossarySidebarProps {
  terms: GlossaryTerm[];
  selectedTermId?: string | null;
  selectedGroup: "Semua" | GlossaryGroup;
  onGroupChange: (group: "Semua" | GlossaryGroup) => void;
  onTermSelect: (termId: string) => void;
  onGroupToggle?: (group: GlossaryGroup) => void;
}

export const GlossarySidebar: React.FC<GlossarySidebarProps> = ({
  terms,
  selectedTermId,
  selectedGroup,
  onGroupChange,
  onTermSelect,
  onGroupToggle,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<GlossaryGroup>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("panduan-collapsed-groups");
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem("panduan-collapsed-groups", JSON.stringify(Array.from(collapsedGroups)));
  }, [collapsedGroups]);

  const toggleGroupCollapse = (group: GlossaryGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
    onGroupToggle?.(group);
  };

  const groups: GlossaryGroup[] = ["Arah", "9 Zona", "Bangunan", "Pedoman", "Ukuran", "Aturan"];

  return (
    <aside className="w-72 flex-shrink-0 border-r border-ink-700 bg-ink-900 flex flex-col hidden lg:flex">
      <div className="p-4 border-b border-ink-700 bg-ink-950/80 sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-bone-100">Kategori</h2>
        <button
          type="button"
          onClick={() => onGroupChange("Semua")}
          className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
            selectedGroup === "Semua"
              ? "bg-ink-800 text-bone-100 border-bone-100/40"
              : "text-bone-400 border-ink-700 hover:text-bone-200"
          }`}
        >
          Semua
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-2" aria-label="Kategori panduan">
        {groups.map((group) => {
          const groupTerms = terms.filter((t) => t.group === group);
          const isCollapsed = collapsedGroups.has(group);
          const isSelected = selectedGroup === group;

          return (
            <div key={group} className="space-y-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onGroupChange(group)}
                  className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded-lg text-bone-300 hover:text-bone-100 hover:bg-ink-800 transition-colors ${
                    isSelected ? "bg-ink-800 text-bone-100 font-medium" : ""
                  }`}
                >
                  <span className="font-medium text-bone-100">{group}</span>
                  <span className="text-[11px] font-mono text-bone-400 bg-ink-950/50 px-1.5 py-0.5 rounded">
                    {groupTerms.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(group)}
                  className="p-1.5 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded transition-colors text-[11px]"
                  aria-label={`Toggle grup ${group}`}
                >
                  {isCollapsed ? "+" : "−"}
                </button>
              </div>

              {!isCollapsed && (
                <ul className="mt-1 ml-2 space-y-1" role="list">
                  {groupTerms.map((term) => (
                    <li key={term.id}>
                      <button
                        type="button"
                        onClick={() => onTermSelect(term.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-colors ${
                          selectedTermId === term.id
                            ? "bg-ink-800 text-bone-100 font-medium"
                            : "text-bone-300 hover:text-bone-100 hover:bg-ink-800"
                        }`}
                      >
                        {term.term}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-ink-700 lg:hidden">
        <p className="text-[11px] text-bone-400 text-center">
          Geser untuk menutup sidebar
        </p>
      </div>
    </aside>
  );
};
