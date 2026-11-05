"use client";

import React from "react";
import { Violation } from "@/types/audit";
import { getRuleCopy } from "@/data/rules-copy";
import { Term } from "../glossary/Term";
import { Eye, Wrench } from "lucide-react";

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

  return (
    <div
      className={`p-4 rounded-xl border bg-ink-950/60 space-y-3 transition-colors ${
        isSelected ? "border-clay" : "border-ink-800 hover:border-clay/60"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="w-5 h-5 rounded-full bg-clay/15 text-clay font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div>
            <h4 className="text-[14px] font-semibold text-bone-100 leading-snug">
              {displayTitle}
            </h4>
            <div className="text-[12px] text-bone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <strong className="text-clay font-medium">{violation.room_name}</strong>
              <span>·</span>
              <span>
                Zona{" "}
                <Term id={termId} onOpenDrawer={onOpenGlossaryDrawer}>
                  {violation.zone_name}
                </Term>
              </span>
            </div>
          </div>
        </div>

        {onFocusRoom && (
          <button
            type="button"
            onClick={() => onFocusRoom(violation.box)}
            className="shrink-0 min-h-[30px] inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] border border-ink-800 bg-ink-900 hover:bg-ink-800 text-bone-300 hover:text-bone-100 rounded-md transition-colors"
          >
            <Eye size={12} />
            <span>Sorot</span>
          </button>
        )}
      </div>

      {/* Meaning */}
      <p className="text-[12.5px] text-bone-300 leading-relaxed">
        {displayMeaning}
      </p>

      {/* Actionable Fix */}
      <div className="pt-2.5 border-t border-ink-800/80 flex items-start gap-2 text-[12.5px] text-bone-200 leading-relaxed">
        <Wrench size={13} className="text-bone-400 shrink-0 mt-1" />
        <p>
          <strong className="text-bone-100 font-medium">Saran perbaikan: </strong>
          {displayFix}
        </p>
      </div>
    </div>
  );
};
