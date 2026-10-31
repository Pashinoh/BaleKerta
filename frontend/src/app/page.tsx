"use client";

import React, { useState, useEffect } from "react";
import PlanCanvas from "@/components/PlanCanvas";
import UploadDropzone from "@/components/UploadDropzone";
import ControlPanel from "@/components/ControlPanel";
import AuditReportPanel from "@/components/AuditReportPanel";
import PrintCertificateModal from "@/components/PrintCertificateModal";
import { Room, AuditResponse, PresetSummary } from "@/types/audit";
import { 
  runPresetAudit, 
  auditUploadedFloorPlan, 
  getPresets, 
  checkBackendHealth 
} from "@/lib/api";
import { 
  Building2, 
  Compass, 
  Sparkles, 
  AlertTriangle,
  FileText,
  Server
} from "lucide-react";

export default function Home() {
  // State: Configuration & Input
  const [selectedRegency, setSelectedRegency] = useState("denpasar");
  const [hastaCm, setHastaCm] = useState(45.0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);

  // State: Audit Data
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>("preset_1_pass");

  // State: Status & Modals
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // 1. Initial Load: Check Backend & Load Presets
  useEffect(() => {
    async function init() {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);

      if (isOnline) {
        const presetList = await getPresets();
        setPresets(presetList);
        // Load default preset audit
        try {
          const defaultAudit = await runPresetAudit("preset_1_pass");
          setAuditData(defaultAudit);
        } catch (e) {
          console.error("Gagal memuat preset awal:", e);
        }
      }
    }
    init();
  }, []);

  // 2. Handle Preset Click
  const handleSelectPreset = async (presetId: string) => {
    setActivePresetId(presetId);
    setSelectedFile(null);
    setUploadedImageSrc(null);
    setSelectedRoom(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await runPresetAudit(presetId);
      setAuditData(result);
      if (result.kaja_vector) {
        const regKey = result.kaja_vector.location.toLowerCase();
        if (regKey.includes("buleleng")) setSelectedRegency("buleleng");
        else if (regKey.includes("badung")) setSelectedRegency("badung");
        else if (regKey.includes("gianyar")) setSelectedRegency("gianyar");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat preset";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle File Upload Selection
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadedImageSrc(objectUrl);
    setActivePresetId("");
    setErrorMessage(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (uploadedImageSrc) URL.revokeObjectURL(uploadedImageSrc);
    setUploadedImageSrc(null);
    handleSelectPreset("preset_1_pass");
  };

  // 4. Run Live Audit
  const handleRunAudit = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedRoom(null);

    try {
      const result = await auditUploadedFloorPlan(selectedFile, selectedRegency, hastaCm);
      setAuditData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Audit gagal dilakukan";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRooms = auditData?.rooms || [];
  const currentViolations = auditData?.audit_report?.violations || [];
  const currentGrid = auditData?.grid_layout || null;
  const currentKaja = auditData?.kaja_vector || {
    bearing_degrees: 55.95,
    cardinal_direction: "Timur Laut (NE)",
    location: "Denpasar"
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">BaleKerta</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  AI ARCHITECTURAL AUDIT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Audit Kepatuhan Asta Kosala-Kosali & Perda Bali No. 5/2005
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend Health Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-slate-900 border border-slate-800">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">API:</span>
              {backendOnline === true ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Online
                </span>
              ) : backendOnline === false ? (
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                  Offline
                </span>
              ) : (
                <span className="text-slate-500">Checking...</span>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Bali DigiFest 2026</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Preset Selector Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pilihan Uji Coba Cepat (Preset Demo Siap Diuji Juri)</span>
              {presets.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  {presets.length} Preset API Aktif
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              Respons instan 0 detik tanpa memakan kuota token API
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "preset_1_pass",
                title: "Denah Hunian Tradisional Bali",
                badge: "100% Layak PBG",
                badgeColor: "emerald",
                desc: "Sanggah Pemerajan di Kaja-Kangin, Toilet di Teba"
              },
              {
                id: "preset_2_toilet_violation",
                title: "Denah Modern Salah Letak Toilet",
                badge: "Melanggar Regulasi",
                badgeColor: "red",
                desc: "Toilet di Sudut Suci Kaja-Kangin, Tanpa Pemerajan"
              },
              {
                id: "preset_3_villa_overbuild",
                title: "Denah Vila Wisata Canggu",
                badge: "Perlu Penyesuaian",
                badgeColor: "amber",
                desc: "KDB > 60% & Bangunan Menutup Area Natah"
              }
            ].map((p) => {
              const isSelected = p.id === activePresetId && !selectedFile;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  disabled={isLoading}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{p.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.badgeColor === "emerald"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : p.badgeColor === "red"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visualizer & Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Plan Canvas (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <PlanCanvas
              imageSrc={uploadedImageSrc}
              gridLayout={currentGrid}
              rooms={currentRooms}
              violations={currentViolations}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              kajaBearing={currentKaja.bearing_degrees}
              kajaDirection={currentKaja.cardinal_direction}
              regencyName={currentKaja.location}
            />

            {/* Azimuth & Cultural Guide Card */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Kalkulasi Geodesic Azimuth Menuju Gunung Agung</span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">
                  {currentKaja.bearing_degrees.toFixed(2)}° N
                </span>
              </div>
              <p>
                Grid 9 Sanga Mandala berorientasi pada arah suci (*Kaja*) yang mengarah ke puncak Gunung Agung. 
                Pojok dengan garis kuning tebal merupakan <strong>Utamaning Utama</strong> (khusus tempat persembahyangan keluarga/Pemerajan).
              </p>
            </div>
          </div>

          {/* Right Column: Controls, Upload & Audit Report Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Upload Dropzone */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Unggah Denah Baru
              </span>
              <UploadDropzone
                onFileSelected={handleFileSelected}
                isLoading={isLoading}
                selectedFile={selectedFile}
                onClearFile={handleClearFile}
              />
            </div>

            {/* Control Panel (Regency & Antropometri) */}
            <ControlPanel
              selectedRegency={selectedRegency}
              onRegencyChange={setSelectedRegency}
              hastaCm={hastaCm}
              onHastaChange={setHastaCm}
              isLoading={isLoading}
              onRunAudit={handleRunAudit}
              canAudit={!!selectedFile}
            />

            {/* Dedicated Audit Report Panel (Tabbed & Print Capable) */}
            <AuditReportPanel
              auditData={auditData}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          </div>
        </div>

      </div>

      {/* Print Certificate Modal */}
      <PrintCertificateModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        auditData={auditData}
        hastaCm={hastaCm}
      />
    </main>
  );
}
