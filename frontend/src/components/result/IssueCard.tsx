"use client";

import React from "react";
import { Violation } from "@/types/audit";
import { getRuleCopy } from "@/data/rules-copy";
import { Term } from "../glossary/Term";
import { Disclosure } from "../ui/Disclosure";
import { Eye, ShieldCheck, Wrench } from "lucide-react";

export interface IssueCardProps {
  violation: Violation;
  index: number;
  onFocusRoom?: (box: [number, number, number, number]) => void;
  onOpenGlossaryDrawer?: (termId: string) => void;
  isSelected?: boolean;
  className?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  violation,
  index,
  onFocusRoom,
  onOpenGlossaryDrawer,
  isSelected = false,
  className = "",
}) => {
  const ruleCopy = getRuleCopy(violation.rule_id);

  const displayTitle = ruleCopy?.title || violation.issue || violation.room_name;
  const displayMeaning = ruleCopy?.meaning || violation.issue;
  const displayFix = ruleCopy?.fix || violation.recommendation;
  const termId = ruleCopy?.termId || violation.zone_id.toLowerCase().replace(/_/g, "-");

  const legalBasis =
    violation.verified && violation.legal_reference
      ? violation.legal_reference
      : ruleCopy?.legalBasisVerified
      ? ruleCopy.legalBasisText
      : null;

  return (
    <div
      className={`p-4 rounded-lg border bg-ink-900 space-y-3.5 transition-colors duration-150 ${
        isSelected
          ? "border-clay ring-1 ring-clay/40"
          : "border-clay/70 hover:border-clay"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-clay/10 border border-clay text-clay font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-clay leading-snug">
              {displayTitle}
            </h4>
            <div className="text-[12px] text-bone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>
                Ruangan: <strong className="text-bone-100">{violation.room_name}</strong>
              </span>
              <span>·</span>
              <span>
                Zona:{" "}
                <Term id={termId} onOpenDrawer={onOpenGlossaryDrawer}>
                  {violation.zone_name}
                </Term>
              </span>
            </div>
          </div>
        </div>

        {/* View on Canvas Button */}
        {onFocusRoom && (
          <button
            type="button"
            onClick={() => onFocusRoom(violation.box)}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[12px] border border-ink-700 bg-ink-950 hover:bg-ink-800 text-bone-400 hover:text-bone-100 rounded transition-colors"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Lihat di denah</span>
          </button>
        )}
      </div>

      {/* 1. Apa Artinya */}
      <div className="space-y-1 text-[13px] leading-relaxed">
        <span className="font-semibold text-bone-100 block">Apa artinya:</span>
        <p className="text-bone-400">{displayMeaning}</p>
      </div>

      {/* 2. Cara Memperbaiki */}
      <div className="space-y-1 text-[13px] leading-relaxed bg-ink-950 p-3 rounded border border-ink-700/60">
        <div className="flex items-center gap-1.5 text-bone-100 font-semibold mb-0.5">
          <Wrench size={13} className="text-bone-400" />
          <span>Cara memperbaiki:</span>
        </div>
        <p className="text-bone-400">{displayFix}</p>
      </div>

      {/* 3. Dasar Hukum */}
      {legalBasis && (
        <Disclosure
          title="Dasar Hukum & Regulasi"
          subtitle="Perda Prov. Bali No. 5/2005"
          className="text-[12px] border-ink-700/60 bg-ink-950/60"
        >
          <div className="flex items-start gap-2 pt-1 text-bone-400">
            <ShieldCheck size={15} className="text-bone-300 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{legalBasis}</p>
          </div>
        </Disclosure>
      )}
    </div>
  );
};
