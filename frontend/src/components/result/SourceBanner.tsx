"use client";

import React from "react";
import { Database, Sparkles, Server, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";

export interface SourceBannerProps {
  source?: string;
  model?: string;
  error?: string | null;
  retryAfterS?: number;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export const SourceBanner: React.FC<SourceBannerProps> = ({
  source,
  model,
  error,
  retryAfterS,
  onRetry,
  className = "",
  compact = false,
}) => {
  if (error) {
    return (
      <div
        className={`p-3.5 bg-ink-900 border border-clay rounded-lg flex items-start justify-between gap-3 ${className}`}
      >
        <div className="flex items-start gap-2.5">
          <AlertCircle size={18} className="text-clay shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-[14px] font-semibold text-clay">
              Pemeriksaan AI Belum Berhasil
            </h4>
            <p className="text-[13px] text-bone-400 leading-relaxed">
              {error}
              {retryAfterS ? ` Disarankan mencoba kembali dalam ${retryAfterS} detik.` : ""}
            </p>
          </div>
        </div>

        {onRetry && (
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw size={14} />}
          >
            Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  if (!source) return null;

  const isCache = source.startsWith("cache:");
  const isLiveAI = source.startsWith("ai:");

  let label = "Contoh Bawaan Sistem";
  let icon = <Database size={13} className="text-bone-400" />;

  if (isLiveAI) {
    label = `AI Vision Langsung (${model || "Gemini"})`;
    icon = <Sparkles size={13} className="text-bone-400" />;
  } else if (isCache) {
    label = `Hasil Cache AI (${source.replace("cache:", "")})`;
    icon = <Server size={13} className="text-bone-400" />;
  }

  return (
    <div
      className={`px-3 ${
        compact ? "py-1 text-[11px]" : "py-1.5 text-[12px]"
      } rounded border border-ink-700 bg-ink-900 flex items-center justify-between gap-2 text-bone-400 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span>Sumber:</span>
        <span className="font-mono text-bone-100">{label}</span>
      </div>

      <div className="font-mono text-[11px] text-bone-400/80">
        Keputusan: Deterministik
      </div>
    </div>
  );
};
