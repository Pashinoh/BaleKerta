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

      // Generate thumbnail preview
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
        <div className="p-4 bg-ink-900 border border-ink-700 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="Pratinjau denah"
                className="w-14 h-14 object-cover rounded border border-ink-700 bg-ink-950 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded border border-ink-700 bg-ink-950 flex items-center justify-center shrink-0">
                <FileImage size={24} className="text-bone-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-bone-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[12px] text-bone-400 font-mono">
                {formatFileSize(selectedFile.size)} · {selectedFile.type.split("/")[1].toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-bone-400 hover:text-clay hover:bg-ink-800 rounded transition-colors"
            title="Hapus dan pilih denah lain"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        /* Drag & Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors ${
            isDragOver
              ? "border-bone-100 bg-ink-800"
              : "border-ink-700 hover:border-ink-600 bg-ink-900 hover:bg-ink-850"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                validateAndProcessFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full border border-ink-700 bg-ink-950 flex items-center justify-center text-bone-400">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-bone-100">
                Pilih atau seret gambar denah ke sini
              </p>
              <p className="text-[12px] text-bone-400 mt-0.5">
                Mendukung PNG, JPG, WebP hingga 10 MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-ink-900 border border-clay text-clay rounded-md text-[13px]">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
