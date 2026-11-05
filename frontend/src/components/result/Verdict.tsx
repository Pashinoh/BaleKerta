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
      className={`p-5 sm:p-6 rounded-xl border bg-ink-900 ${
        isPass ? "border-ink-800" : "border-clay/50"
      } ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Status & Conclusion */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2">
            {isPass ? (
              <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle size={17} className="text-clay shrink-0" />
            )}
            <span
              className={`text-[11.5px] font-mono uppercase tracking-wider font-semibold ${
                isPass ? "text-bone-200" : "text-clay"
              }`}
            >
              {isPass ? "Memenuhi Kepatuhan Adat" : `${violationsCount} Temuan Perlu Penyesuaian`}
            </span>
          </div>

          <h2 className="text-[19px] sm:text-[21px] font-bold text-bone-100 leading-snug tracking-tight">
            {isPass
              ? "Denah mematuhi pakem tata ruang Sanga Mandala & layak diajukan PBG."
              : "Terdapat penempatan ruang yang belum selaras dengan hierarki Sanga Mandala."}
          </h2>
        </div>

        {/* Right: Metrics & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 lg:gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-ink-800">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] font-mono text-bone-400 block">
                Skor Kepatuhan
              </span>
              <span className="text-[22px] font-bold font-mono text-bone-100 tabular-nums">
                {report.compliance_score}
                <span className="text-[13px] text-bone-400 font-normal">/100</span>
              </span>
            </div>

            <div className="h-8 w-px bg-ink-800" />

            <div>
              <span className="text-[11px] font-mono text-bone-400 block">
                Estimasi KDB
              </span>
              <span className="text-[22px] font-bold font-mono text-bone-100 tabular-nums">
                {report.kdb_percentage}%
                <span className="text-[12px] text-bone-400 font-normal ml-1">(≤60%)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onEditPlan && (
              <Button
                variant="secondary"
                size="md"
                onClick={onEditPlan}
                icon={<ArrowLeft size={14} />}
              >
                Ubah Denah
              </Button>
            )}
            {onPrintReport && (
              <Button
                variant="primary"
                size="md"
                onClick={onPrintReport}
                icon={<Printer size={15} />}
              >
                Laporan PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
