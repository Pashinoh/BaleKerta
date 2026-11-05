"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, FileImage, X, AlertCircle } from "lucide-react";

export interface UploadBoxProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const UploadBox: React.FC<UploadBoxProps> = ({
  selectedFile,
  onFileSelect,
  className = "",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setErrorMessage(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMessage("Format file tidak didukung. Harap unggah format PNG, JPG, atau WebP.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage("Ukuran gambar melebihi batas 10 MB.");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMessage(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {selectedFile ? (
        /* Selected File Card */
        <div className="p-3.5 bg-ink-850 border border-bone-100/70 rounded-lg flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="Pratinjau denah"
                className="w-12 h-12 object-cover rounded border border-ink-700 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-ink-950 flex items-center justify-center shrink-0 border border-ink-700">
                <FileImage size={20} className="text-bone-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-bone-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-bone-400 font-mono">
                {formatFileSize(selectedFile.size)} · Siap Dianalisis AI Vision
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-bone-400 hover:text-clay hover:bg-ink-950 rounded transition-colors"
            title="Hapus berkas"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors select-none ${
            isDragOver
              ? "border-bone-100 bg-ink-850"
              : "border-ink-600 bg-ink-900/40 hover:border-bone-400 hover:bg-ink-850"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                validateAndProcessFile(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center text-bone-300">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-bone-100">
                Tarik & letakkan berkas denah Anda di sini
              </p>
              <p className="text-[11px] text-bone-400 mt-0.5">
                atau klik untuk memilih dari perangkat (PNG, JPG, WebP hingga 10 MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-ink-950 border border-clay text-clay rounded-md text-[13px]">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
