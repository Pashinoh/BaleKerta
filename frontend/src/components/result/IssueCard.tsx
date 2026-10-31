"use client";

import React from "react";
import { Violation } from "@/types/audit";
import { getRuleCopy } from "@/data/rules-copy";
import { Term } from "../glossary/Term";
import { Disclosure } from "../ui/Disclosure";
import { Eye, ShieldCheck } from "lucide-react";

export interface IssueCardProps {
  violation: Violation;
  index: number;
  onFocusRoom?: (box: [number, number, number, number]) => void;
  onOpenGlossaryDrawer?: (termId: string) => void;
  className?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  violation,
  index,
  onFocusRoom,
  onOpenGlossaryDrawer,
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
      className={`p-4 rounded-lg border border-clay bg-ink-900 space-y-3.5 transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-clay/10 border border-clay flex items-center justify-center shrink-0 mt-0.5">
            <span className="font-mono text-[12px] font-bold text-clay">
              {index + 1}
            </span>
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-clay leading-snug">
              {displayTitle}
            </h4>
            <div className="text-[12px] text-bone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Ruangan: <strong className="text-bone-100">{violation.room_name}</strong></span>
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
        <span className="font-semibold text-bone-100 block">Cara memperbaiki:</span>
        <p className="text-bone-400">{displayFix}</p>
      </div>

      {/* 3. Dasar Pedoman (Collapsible, verified only) */}
      {legalBasis && (
        <Disclosure
          title={
            <span className="flex items-center gap-1.5 text-[13px] text-bone-400">
              <ShieldCheck size={14} className="text-bone-100" />
              <span>Dasar Pedoman Adat</span>
            </span>
          }
          className="border-ink-700/60 bg-ink-950/60"
        >
          <p className="text-[12px] text-bone-400 leading-relaxed font-mono">
            {legalBasis}
          </p>
        </Disclosure>
      )}
    </div>
  );
};
