"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/layout/Header";
import { Stepper } from "@/components/layout/Stepper";
import { GlossaryDrawer } from "@/components/glossary/GlossaryDrawer";
import { MiniZoneGrid, sacredCornerLabel } from "@/components/map/MiniZoneGrid";
import { SampleList } from "@/components/plan/SampleList";
import { UploadBox } from "@/components/plan/UploadBox";
import { OrientationPicker } from "@/components/plan/OrientationPicker";
import { PlanCanvas } from "@/components/plan/PlanCanvas";

import { Verdict } from "@/components/result/Verdict";
import { IssueCard } from "@/components/result/IssueCard";
import { SourceBanner } from "@/components/result/SourceBanner";
import { Report } from "@/components/result/Report";
import { AuditTransparency } from "@/components/result/AuditTransparency";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Disclosure } from "@/components/ui/Disclosure";

import {
  AuditResponse,
  KajaGeoResponse,
} from "@/types/audit";
import {
  checkBackendHealth,
  getKaja,
  runPresetAudit,
  auditUploadedFloorPlan,
  ApiError,
} from "@/lib/api";
import { DEFAULT_LOCATION, BALI_QUICK_LOCATIONS, isInBali } from "@/lib/geo";
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, Locate, AlertCircle, X, Compass, Landmark, Printer } from "lucide-react";

// Dynamic import for Leaflet map to disable SSR
const KajaMap = dynamic(() => import("@/components/map/KajaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-ink-900 border border-ink-700 rounded-lg flex items-center justify-center text-bone-400 font-mono text-[13px]">
      Memuat peta interaktif Bali...
    </div>
  ),
});

// Helper: cardinal direction to singular Indonesian (remove NE/E/NW etc)
function cardinalSingular(cardinal: string): string {
  const map: Record<string, string> = {
    "Timur Laut (NE)": "Timur Laut",
    "Timur (E)": "Timur",
    "Timur Daya (SE)": "Timur Daya",
    "Selatan (S)": "Selatan",
    "Barat Daya (SW)": "Barat Daya",
    "Barat (W)": "Barat",
    "Barat Laut (NW)": "Barat Laut",
    "Utara (N)": "Utara",
  };
  return map[cardinal] || cardinal.replace(/\s*\([A-Z]{1,2}\)/, "");
}

// Helper: corner label to capitalized Indonesian
function cornerCapitalized(corner: string): string {
  const map: Record<string, string> = {
    "kanan-atas": "Sudut Kanan Atas",
    "kanan-bawah": "Sudut Kanan Bawah",
    "kiri-bawah": "Sudut Kiri Bawah",
    "kiri-atas": "Sudut Kiri Atas",
  };
  return map[corner] || corner;
}

export default function Home() {
  // Stepper state
  const [step, setStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  // Geo & Location state
  const [lat, setLat] = useState<number>(DEFAULT_LOCATION.lat);
  const [lon, setLon] = useState<number>(DEFAULT_LOCATION.lon);
  const [kajaData, setKajaData] = useState<KajaGeoResponse>({
    latitude: DEFAULT_LOCATION.lat,
    longitude: DEFAULT_LOCATION.lon,
    in_bali: true,
    bearing_degrees: 41.7,
    cardinal_direction: "Timur Laut (NE)",
    kaja_quadrant: "TOP_RIGHT",
    distance_km: 48.7,
    location_label: "Kota Denpasar",
    target: { lat: -8.3433, lon: 115.5071 },
    message: "Koordinat valid",
  });

  // Plan input state
  const [inputTab, setInputTab] = useState<string>("sample");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset_1_pass");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [planNorthDeg, setPlanNorthDeg] = useState<number>(0);

  // Audit results & UI state
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<{
    message: string;
    retryAfterS?: number;
  } | null>(null);

  // Synchronized canvas & room list selection
  const [hoveredRoomIndex, setHoveredRoomIndex] = useState<number | null>(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null);

  // Modals & Drawers
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossaryTermId, setGlossaryTermId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [apiOnline, setApiOnline] = useState<boolean>(true);

  // 1. Initial health check & load default Kaja / Preset
  useEffect(() => {
    async function init() {
      const isOnline = await checkBackendHealth();
      setApiOnline(isOnline);

      // Load initial Kaja vector
      try {
        const kaja = await getKaja(lat, lon);
        setKajaData(kaja);
      } catch {
        // Fallback default already in state
      }

      // Preload initial preset audit
      try {
        const initialAudit = await runPresetAudit("preset_1_pass", lat, lon, 0);
        setAuditData(initialAudit);
      } catch {
        // Handled silently
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Fetch Kaja vector whenever coordinates change
  const handleLocationChange = useCallback(
    async (newLat: number, newLon: number) => {
      setLat(newLat);
      setLon(newLon);
      try {
        const kaja = await getKaja(newLat, newLon);
        setKajaData(kaja);

        // If on result step and using preset, recalculate live
        if (inputTab === "sample" && selectedPresetId && auditData) {
          const updated = await runPresetAudit(selectedPresetId, newLat, newLon, planNorthDeg);
          setAuditData(updated);
        }
      } catch {
        // Keep prior state
      }
    },
    [inputTab, selectedPresetId, planNorthDeg, auditData]
  );

  // 2b. GPS: validasi Bali + pesan error yang terlihat (bukan diam-diam)
  const [geoError, setGeoError] = useState<string | null>(null);
  const handleUseMyLocation = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Batas Wilayah Bali: Peramban Anda tidak mendukung penentuan lokasi otomatis.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        if (isInBali(userLat, userLon)) {
          handleLocationChange(userLat, userLon);
        } else {
          setGeoError(
            `Batas Wilayah Bali: Lokasi GPS Anda (${userLat.toFixed(2)}, ${userLon.toFixed(2)}) berada di luar Pulau Bali. Silakan pilih titik di dalam Pulau Bali.`
          );
        }
      },
      () => setGeoError("Batas Wilayah Bali: Izin lokasi GPS ditolak atau tidak tersedia."),
      { timeout: 8000 }
    );
  }, [handleLocationChange]);

  // 3. Handle File selection
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImageSrc(url);
    } else {
      if (uploadedImageSrc) URL.revokeObjectURL(uploadedImageSrc);
      setUploadedImageSrc(null);
    }
    setAuditError(null);
  };

  // 4. Run Audit Execution
  const handleExecuteAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);
    setSelectedRoomIndex(null);
    setHoveredRoomIndex(null);

    try {
      let result: AuditResponse;
      if (inputTab === "sample") {
        result = await runPresetAudit(selectedPresetId, lat, lon, planNorthDeg);
      } else {
        if (!selectedFile) {
          setAuditError({ message: "Silakan pilih berkas gambar denah terlebih dahulu." });
          setIsAuditing(false);
          return;
        }
        result = await auditUploadedFloorPlan(selectedFile, {
          lat,
          lon,
          planNorthDeg,
        });
      }

      setAuditData(result);
      setMaxStepReached((prev) => Math.max(prev, 3));
      setStep(3);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setAuditError({
          message: err.message,
          retryAfterS: err.retryAfterS,
        });
      } else {
        const msg = err instanceof Error ? err.message : "Pemeriksaan denah gagal dilakukan.";
        setAuditError({ message: msg });
      }
    } finally {
      setIsAuditing(false);
    }
  };

  // Open glossary drawer with term focus
  const handleOpenGlossaryWithTerm = (termId: string) => {
    setGlossaryTermId(termId);
    setIsGlossaryOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-bone-100 font-sans selection:bg-bone-100 selection:text-ink-950">
      {/* Header */}
      <Header
        onOpenGlossary={() => {
          setGlossaryTermId(null);
          setIsGlossaryOpen(true);
        }}
        apiOnline={apiOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stepper */}
        <div className="space-y-4">
          {/* 3-Step Stepper */}
          <Stepper
            currentStep={step}
            maxStepReached={maxStepReached}
            onSelectStep={(targetStep) => setStep(targetStep)}
          />
        </div>

        {step === 1 ? (
          /* ========================================================== */
          /* STEP 1: RESTRUCTURED FOCUS LAYOUT                         */
          /* ========================================================== */
          <div className="space-y-10">
            {/* 1. TOP: Peta tanpa heading kartu */}
            <div className="bg-ink-900 border border-ink-700 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 overflow-hidden">
              {/* Quick location controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label htmlFor="quick-location-select" className="text-[13px] text-bone-300">
                    Pilih cepat: Kabupaten
                  </label>
                  <select
                    id="quick-location-select"
                    className="bg-ink-800 border border-ink-600 text-bone-100 rounded-md px-2.5 py-1 text-[13px] focus-visible:outline-2 focus-visible:outline-bone-100"
                    onChange={(e) => {
                      const selected = BALI_QUICK_LOCATIONS.find((loc) => loc.id === e.target.value);
                      if (selected) {
                        handleLocationChange(selected.lat, selected.lon);
                      }
                    }}
                  >
                    <option value="">Pilih lokasi</option>
                    {BALI_QUICK_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUseMyLocation}
                    icon={<Locate size={14} />}
                  >
                    Lokasi Saya
                  </Button>
                </div>
              </div>

              {geoError && (
                <div className="flex items-center justify-between p-3 bg-ink-900 border border-clay text-clay rounded-md text-[13px]">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{geoError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeoError(null)}
                    aria-label="Tutup pesan"
                    className="text-bone-300 hover:text-bone-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <KajaMap
                lat={lat}
                lon={lon}
                bearing={kajaData.bearing_degrees}
                cardinalDirection={kajaData.cardinal_direction}
                distanceKm={kajaData.distance_km}
                onChangeLocation={handleLocationChange}
                className="w-full"
              />
            </div>

            {/* 2. BOTTOM DASHBOARD */}
            <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 lg:p-6">
              <h3 className="text-[15px] font-semibold text-bone-100 mb-4">
                Hasil Analisis Tapak
              </h3>
              
              {/* Summary Card - quick skimmable facts */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-ink-950/50 border border-ink-700 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="shrink-0 text-bone-100" />
                  <span className="text-[14px] font-medium text-bone-100">Arah Kaja:</span>
                  <span className="text-[14px] text-bone-300">{cardinalSingular(kajaData.cardinal_direction)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark size={16} className="shrink-0 text-bone-100" />
                  <span className="text-[14px] font-medium text-bone-100">Area Sanggah:</span>
                  <span className="text-[14px] text-bone-300">{cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant))}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-center">
                <div>
                  <MiniZoneGrid kajaQuadrant={kajaData.kaja_quadrant} />
                </div>
                <div className="space-y-4">
                  <p className="text-[14px] text-bone-100 leading-relaxed">
                    <Compass size={16} className="inline-block mr-1" />Arah Kaja lahan Anda menghadap ke {cardinalSingular(kajaData.cardinal_direction)}. Sesuai aturan Sanga Mandala, area paling suci (Utamaning Utama) berada di {cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant))} denah Anda.
                  </p>
                </div>
              </div>

              {/* Disclosure moved below grid, full-width */}
              <Disclosure title="Lihat Detail Teknis & Koordinat" defaultOpen={false}>
                <div className="space-y-4">
                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-ink-950 border border-ink-800 rounded-lg">
                      <span className="text-[11px] text-bone-300 block mb-1">Koordinat Tanah</span>
                      <span className="text-[13px] font-mono font-medium text-bone-100 block">
                        {lat.toFixed(4)}°, {lon.toFixed(4)}°
                      </span>
                      <span className="text-[11px] text-bone-300 mt-1 block truncate">
                        {kajaData.location_label || "Wilayah Bali"}
                      </span>
                    </div>

                    <div className="p-3 bg-ink-950 border border-ink-800 rounded-lg">
                      <span className="text-[11px] text-bone-300 block mb-1">Sudut Geodesik Kaja</span>
                      <span className="text-[15px] font-mono font-semibold text-bone-100 block">
                        {kajaData.bearing_degrees.toFixed(1)}°
                      </span>
                      <span className="text-[11px] text-clay font-medium mt-1 block">
                        Arah {kajaData.cardinal_direction}
                      </span>
                    </div>

                    <div className="p-3 bg-ink-950 border border-ink-800 rounded-lg">
                      <span className="text-[11px] text-bone-300 block mb-1">Jarak ke Gn. Agung</span>
                      <span className="text-[15px] font-mono font-semibold text-bone-100 block">
                        {kajaData.distance_km ? `${kajaData.distance_km.toFixed(1)} km` : "-"}
                      </span>
                      <span className="text-[11px] text-bone-300 mt-1 block">
                        Puncak 3.142 mdpl
                      </span>
                    </div>
                  </div>

                  {/* Cultural rule note */}
                  <div className="p-3.5 bg-ink-950/70 border border-ink-800 rounded-lg text-[13px] text-bone-300 space-y-1">
                    <p className="leading-relaxed">
                      <strong>Ketentuan Tata Ruang Adat:</strong> Posisi suci Kaja bersifat relatif terhadap Gunung Agung. Di Bali Selatan (Denpasar, Badung, Gianyar), Kaja mengarah ke Timur Laut. Di Bali Utara (Buleleng), Kaja mengarah ke Selatan.
                    </p>
                    <p className="text-[12px] text-bone-300">
                      Sistem kami mengunci orientasi ini agar denah bangunan yang diaudit pada Langkah 2 dievaluasi secara akurat.
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-bone-300">
                    Asta Bumi Geodesic Engine
                  </div>
                </div>
              </Disclosure>
            </div>

            {/* CTA Button below both cards */}
            <div className="w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-between"
                onClick={() => {
                  setMaxStepReached((prev) => Math.max(prev, 2));
                  setStep(2);
                }}
                icon={<ArrowRight size={16} />}
              >
                <span>Lanjut ke Denah Bangunan</span>
              </Button>
            </div>
          </div>
        ) : step === 2 ? (
          /* ========================================================== */
          /* STEP 2: SINGLE UNIFIED CARD (consistent with Step 1)      */
          /* ========================================================== */
          <div className="space-y-6">
            {/* 1. TOP HERO: Full-Width Architectural Canvas */}
            <PlanCanvas
              imageSrc={inputTab === "upload" ? uploadedImageSrc : null}
              gridLayout={auditData?.grid_layout || null}
              rooms={auditData?.rooms || []}
              violations={auditData?.audit_report?.violations || []}
              hoveredIndex={hoveredRoomIndex}
              selectedIndex={selectedRoomIndex}
              onHoverIndex={setHoveredRoomIndex}
              onSelectIndex={setSelectedRoomIndex}
              kajaBearing={kajaData.bearing_degrees}
              kajaDirection={kajaData.cardinal_direction}
            />

            {/* 2. BOTTOM CONTROLS: Single Unified Card */}
            <header className="step-header">
              <h2 className="step-title">Masukkan Denah Bangunan</h2>
              <span className="step-subtitle">Langkah 2 dari 3</span>
            </header>

            <div className="step-card">
              {/* Mode Selector Tabs */}
              <Tabs
                tabs={[
                  { id: "sample", label: "Pilih Denah Contoh" },
                  { id: "upload", label: "Unggah Denah Saya" },
                ]}
                activeTab={inputTab}
                onChange={(id) => {
                  setInputTab(id);
                  setAuditError(null);
                }}
                className="w-full"
              />

              {/* Sample List or Upload Box */}
              {inputTab === "sample" ? (
                <SampleList
                  selectedPresetId={selectedPresetId}
                  onSelectPreset={(id) => {
                    setSelectedPresetId(id);
                    setAuditError(null);
                  }}
                />
              ) : (
                <UploadBox
                  selectedFile={selectedFile}
                  onFileSelect={handleFileChange}
                />
              )}

              {/* Orientation Picker inline */}
              <div className="p-4 bg-ink-950/50 border border-ink-700 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="inline-icon" />
                  <span className="text-[14px] font-medium text-bone-100">Arah Hadap Denah</span>
                </div>
                <p className="text-[12px] text-bone-300 ml-6">
                  Atur arah hadap denah (Utara/Timur/Selatan/Barat) agar sumbu Kaja akurat.
                </p>
                <OrientationPicker
                  planNorthDeg={planNorthDeg}
                  onChange={setPlanNorthDeg}
                />
              </div>

              {/* Error Banner if any */}
              {auditError && (
                <SourceBanner
                  error={auditError.message}
                  retryAfterS={auditError.retryAfterS}
                  onRetry={handleExecuteAudit}
                />
              )}

              {/* Action Row */}
              <div className="action-row">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setStep(1)}
                  icon={<ArrowLeft size={15} />}
                >
                  Kembali
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  disabled={isAuditing || (inputTab === "upload" && !selectedFile)}
                  onClick={handleExecuteAudit}
                  icon={
                    isAuditing ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <ArrowRight size={15} />
                    )
                  }
                >
                  {isAuditing
                    ? inputTab === "upload"
                      ? "AI sedang membaca denah..."
                      : "Memproses evaluasi..."
                    : "Periksa Denah Ini"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* STEP 3: SINGLE UNIFIED CARDS (consistent with Step 1/2)   */
          /* ========================================================== */
          <div className="space-y-6">
            {/* 1. TOP HERO: Full-Width Architectural Plan Canvas */}
            <PlanCanvas
              imageSrc={inputTab === "upload" ? uploadedImageSrc : null}
              gridLayout={auditData?.grid_layout || null}
              rooms={auditData?.rooms || []}
              violations={auditData?.audit_report?.violations || []}
              hoveredIndex={hoveredRoomIndex}
              selectedIndex={selectedRoomIndex}
              onHoverIndex={setHoveredRoomIndex}
              onSelectIndex={setSelectedRoomIndex}
              kajaBearing={kajaData.bearing_degrees}
              kajaDirection={kajaData.cardinal_direction}
            />

            {/* 2. BOTTOM WORKSPACE: Unified Cards */}
            {auditData && (
              <>
                {/* Header ringkas + SourceBanner compact */}
                <header className="step-header">
                  <h2 className="step-title">Hasil Pemeriksaan</h2>
                  <SourceBanner
                    source={auditData.source}
                    model={auditData.model}
                    compact
                  />
                </header>

                {/* Verdict Summary Card - existing */}
                <Verdict
                  report={auditData.audit_report}
                  onPrintReport={() => setIsReportOpen(true)}
                />

                {/* Issues List in unified card */}
                <div className="step-card">
                  <header className="section-header">
                    <span className="section-title">Perbaikan Diperlukan</span>
                    <span className="text-[12px] font-mono text-bone-400">Asta Kosala-Kosali</span>
                  </header>
                  {auditData.audit_report.violations.length === 0 ? (
                    <div className="p-6 text-center text-bone-400 bg-ink-950/50 rounded-lg border border-ink-700/50 space-y-1">
                      <CheckCircle2 size={28} className="text-bone-100 mx-auto" />
                      <p className="text-[14px] font-medium text-bone-100">
                        Semua ruangan sudah sesuai pakem Asta Bumi. Tidak ada pelanggaran.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditData.audit_report.violations.map((violation, i) => (
                        <IssueCard
                          key={violation.id || i}
                          violation={violation}
                          index={i}
                          onFocusRoom={() => {
                            const idx = auditData.rooms.findIndex(
                              (r) =>
                                r.name.toLowerCase() === violation.room_name.toLowerCase() ||
                                (violation.box &&
                                  r.box[0] === violation.box[0] &&
                                  r.box[1] === violation.box[1])
                            );
                            if (idx >= 0) {
                              setSelectedRoomIndex(idx);
                            }
                          }}
                          onOpenGlossaryDrawer={handleOpenGlossaryWithTerm}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Compliances (Collapsible) */}
                {auditData.audit_report.compliances.length > 0 && (
                  <Disclosure
                    title={
                      <span className="text-[14px] font-medium text-bone-100">
                        Ruangan yang Sudah Sesuai ({auditData.audit_report.compliances.length})
                      </span>
                    }
                    subtitle="Daftar tata letak yang mematuhi pakem Asta Bumi"
                  >
                    <ul className="space-y-2 pt-1 text-[13px]">
                      {auditData.audit_report.compliances.map((c, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 p-2 bg-ink-950/50 rounded border border-ink-700/50"
                        >
                          <CheckCircle2 size={15} className="text-bone-100 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-medium text-bone-100 block">
                              {c.room_name} · <span className="text-bone-400">{c.zone_name}</span>
                            </span>
                            <span className="text-bone-400/90 text-[12px] block">
                              {c.detail}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Disclosure>
                )}

                {/* Footer Action Row */}
                <div className="action-row">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setStep(2)}
                    icon={<ArrowLeft size={15} />}
                  >
                    Kembali ke Denah
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={() => setIsReportOpen(true)}
                    icon={<Printer size={15} />}
                  >
                    Cetak Laporan
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

      {/* FULL-WIDTH SECTION: TRANSPARANSI PERHITUNGAN SISTEM & DASAR HUKUM PBG */}
      {step === 3 && auditData && (
        <div className="mt-8 pt-6 border-t border-ink-800">
          <AuditTransparency
            kajaVector={auditData.kaja_vector}
            report={auditData.audit_report}
            rooms={auditData.rooms}
            planNorthDeg={planNorthDeg}
          />
        </div>
      )}
      </main>

      {/* Slide-over Glossary Drawer */}
      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTermId={glossaryTermId}
      />

      {/* Official Pre-Inspection Printable Report Modal */}
      <Report
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={auditData}
      />
    </div>
  );
}
