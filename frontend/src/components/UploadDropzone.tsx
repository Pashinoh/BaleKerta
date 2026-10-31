"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, FileCheck, AlertCircle } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
  onClearFile: () => void;
}

export default function UploadDropzone({
  onFileSelected,
  isLoading,
  selectedFile,
  onClearFile
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndHandleFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Format file harus berupa gambar (PNG, JPG, atau WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal adalah 10 MB.");
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Tarik & Lepas Gambar Denah ke Sini
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Atau klik untuk memilih file dari komputer (PNG, JPG, maks. 10MB)
              </p>
            </div>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Format: Denah Arsitek, Sketsa Berskala, atau Layout 2D
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • File Siap Diaudit
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearFile();
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition"
            title="Hapus file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
