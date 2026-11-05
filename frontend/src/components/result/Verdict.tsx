"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Printer } from "lucide-react";
import { AuditReport } from "@/types/audit";
import { Button } from "../ui/Button";

export interface VerdictProps {
  report: AuditReport;
  onPrintReport?: () => void;
  className?: string;
}

export const Verdict: React.FC<VerdictProps> = ({
  report,
  onPrintReport,
  className = "",
}) => {
  const isPass = report.compliance_score >= 80;
  const violationsCount = report.violations_count || report.violations.length;

  return (
    <div
      className={`p-4 sm:p-5 rounded-lg border bg-ink-900 shadow-sm ${
        isPass ? "border-ink-700" : "border-clay/60"
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Conclusion Sentence & Status */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            {isPass ? (
              <CheckCircle2 size={18} className="text-bone-100 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-clay shrink-0" />
            )}
            <span
              className={`text-[12px] font-mono px-2.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                isPass
                  ? "border-bone-400/40 text-bone-100 bg-ink-850"
                  : "border-clay text-clay bg-clay/10"
              }`}
            >
              {isPass ? "Memenuhi Kepatuhan Adat" : "Perlu Penyesuaian Ruang"}
            </span>
          </div>

          <h3 className="text-[17px] sm:text-[18px] font-semibold text-bone-100 leading-snug">
            {isPass
              ? "Denah ini mematuhi kaidah tata ruang adat Bali (Asta Bumi)."
              : `Denah ini belum sesuai: terdapat ${violationsCount} hal yang perlu disesuaikan.`}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-bone-400 font-mono">
            <span>
              Skor: <strong className="text-bone-100 font-semibold">{report.compliance_score}</strong> / 100
            </span>
            <span>·</span>
            <span>
              Perkiraan kasar terbangun:{" "}
              <strong className="text-bone-100 font-semibold">{report.kdb_percentage}%</strong> (maks 60%)
            </span>
            <span>·</span>
            <a
              href="#transparansi-sistem"
              className="text-bone-300 hover:text-bone-100 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Lihat Formula & Dasar Hukum ↓
            </a>
          </div>
        </div>

        {/* Right: Print Button */}
        {onPrintReport && (
          <div className="shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrintReport}
              icon={<Printer size={14} className="text-bone-400" />}
            >
              Cetak Dokumen Resmi
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
