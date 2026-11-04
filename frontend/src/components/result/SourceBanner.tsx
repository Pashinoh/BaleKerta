"use client";

import React from "react";
import { Database, Sparkles, Server, AlertCircle } from "lucide-react";

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
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 px-3 py-1.5 text-[13px] font-medium border border-clay text-clay hover:bg-clay/10 rounded transition-colors"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  if (!source) return null;

  const isCache = source.startsWith("cache:");
  const isLiveAI = source.startsWith("ai:");

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-[11px] text-bone-400 ${className}`}>
        {isLiveAI ? (
          <Sparkles size={12} className="text-bone-100 shrink-0" />
        ) : isCache ? (
          <Server size={12} className="text-bone-400 shrink-0" />
        ) : (
          <Database size={12} className="text-bone-400 shrink-0" />
        )}
        <span className="font-medium text-bone-100 truncate max-w-[200px]">
          {isLiveAI
            ? "Dianalisis AI Vision"
            : isCache
            ? "Dari Cache AI"
            : "Denah Contoh"}
        </span>
        <span className="font-mono text-[10px] truncate max-w-[140px]">
          {model
            ? `(${model})`
            : isLiveAI
            ? `(${source.replace("ai:", "")})`
            : isCache
            ? `(${source.replace("cache:ai:", "")})`
            : "(Preset Statis)"}
        </span>
        <span className="shrink-0 font-mono px-1.5 py-0.5 bg-ink-950 border border-ink-700 text-bone-400 rounded text-[10px]">
          {isLiveAI ? "AI" : isCache ? "Cache" : "Preset"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 bg-ink-900 border border-ink-700 rounded-lg flex items-center justify-between gap-3 text-[13px] ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isLiveAI ? (
          <Sparkles size={16} className="text-bone-100 shrink-0" />
        ) : isCache ? (
          <Server size={16} className="text-bone-400 shrink-0" />
        ) : (
          <Database size={16} className="text-bone-400 shrink-0" />
        )}

        <div className="min-w-0">
          <span className="font-medium text-bone-100">
            {isLiveAI
              ? "Dianalisis langsung oleh AI Vision"
              : isCache
              ? "Dari Cache Hasil AI Nyata"
              : "Denah Contoh Bawaan"}
          </span>
          <span className="text-bone-400 ml-2 font-mono text-[11px] truncate">
            {model
              ? `(${model})`
              : isLiveAI
              ? `(${source.replace("ai:", "")})`
              : isCache
              ? `(${source.replace("cache:ai:", "")})`
              : "(Bukan hasil AI · Referensi Statis)"}
          </span>
        </div>
      </div>

      <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 bg-ink-950 border border-ink-700 text-bone-400 rounded">
        {isLiveAI ? "AI Aktif" : isCache ? "Cache Valid" : "Preset"}
      </span>
    </div>
  );
};
