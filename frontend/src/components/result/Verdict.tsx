"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Printer, ArrowLeft } from "lucide-react";
import { AuditReport } from "@/types/audit";
import { Button } from "../ui/Button";

export interface VerdictProps {
  report: AuditReport;
  onPrintReport?: () => void;
  onEditPlan?: () => void;
  className?: string;
}

export const Verdict: React.FC<VerdictProps> = ({
  report,
  onPrintReport,
  onEditPlan,
  className = "",
}) => {
  const isPass = report.compliance_score >= 80;
  const violationsCount = report.violations_count || report.violations.length;

  return (
    <div
      className={`px-4 py-3 rounded-xl border bg-ink-900 ${
        isPass ? "border-ink-800" : "border-clay/50"
      } ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Status & Conclusion */}
        <div className="flex items-center gap-3 min-w-0">
          {isPass ? (
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-clay shrink-0" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                  isPass
                    ? "bg-ink-950 text-bone-100 border-ink-700"
                    : "bg-clay/10 text-clay border-clay/40"
                }`}
              >
                {isPass ? "Layak Aju PBG" : `${violationsCount} Temuan Revisi`}
              </span>
              <h2 className="text-[14px] sm:text-[16px] font-bold text-bone-100 leading-snug">
                {isPass
                  ? "Denah mematuhi pakem tata ruang Sanga Mandala."
                  : "Terdapat ruang yang belum selaras dengan hierarki Sanga Mandala."}
              </h2>
            </div>
          </div>
        </div>

        {/* Right: Metrics & Actions */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-5 shrink-0 pt-2 lg:pt-0 border-t border-ink-800/80 lg:border-t-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-mono text-bone-400">Skor:</span>
              <span className="text-[17px] font-bold font-mono text-bone-100 tabular-nums">
                {report.compliance_score}
                <span className="text-[11.5px] text-bone-400 font-normal">/100</span>
              </span>
            </div>

            <div className="h-4 w-px bg-ink-800" />

            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-mono text-bone-400">KDB:</span>
              <span className="text-[17px] font-bold font-mono text-bone-100 tabular-nums">
                {report.kdb_percentage}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditPlan && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onEditPlan}
                icon={<ArrowLeft size={13} />}
              >
                Ubah Denah
              </Button>
            )}
            {onPrintReport && (
              <Button
                variant="primary"
                size="sm"
                onClick={onPrintReport}
                icon={<Printer size={14} />}
              >
                Cetak PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
