"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/layout/Header";
import { GlossaryDrawer } from "@/components/glossary/GlossaryDrawer";
import { MiniZoneGrid, sacredCornerLabel, type SangaMandalaGrid } from "@/components/map/MiniZoneGrid";
import { LocationSearchBox } from "@/components/map/LocationSearchBox";
import { SampleList } from "@/components/plan/SampleList";
import { UploadBox } from "@/components/plan/UploadBox";
import { OrientationPicker } from "@/components/plan/OrientationPicker";
import { PlanCanvas } from "@/components/plan/PlanCanvas";
import { RoomList } from "@/components/plan/RoomList";

import { Verdict } from "@/components/result/Verdict";
import { IssueCard } from "@/components/result/IssueCard";
import { SourceBanner } from "@/components/result/SourceBanner";
import { Report } from "@/components/result/Report";
import { AuditTransparency } from "@/components/result/AuditTransparency";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

import {
  AuditResponse,
  KajaGeoResponse,
} from "@/types/audit";
import {
  checkBackendHealth,
  getKaja,
  getSangaMandalaGrid,
  runPresetAudit,
  auditUploadedFloorPlan,
  ApiError,
} from "@/lib/api";
import { DEFAULT_LOCATION, isInBali, cleanLocationLabel } from "@/lib/geo";
import { animateStepTransition } from "@/lib/animations";
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Locate,
  AlertCircle,
  X,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const SAVED_LOCATION_KEY = "balekerta_saved_location";

const KajaMap = dynamic(() => import("@/components/map/KajaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] bg-ink-900 flex items-center justify-center text-bone-400 font-mono text-[13px]">
      Memuat peta interaktif Bali...
    </div>
  ),
});

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
  // State stepper
  const [step, setStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  // State geo & lokasi (hasPin default false sampai user menaruh pin atau dimuat dari localStorage)
  const [hasPin, setHasPin] = useState<boolean>(false);
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

  // State input denah
  const [inputTab, setInputTab] = useState<string>("sample");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset_1_pass");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [planNorthDeg, setPlanNorthDeg] = useState<number>(0);

  // State hasil audit & UI
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<{
    message: string;
    retryAfterS?: number;
  } | null>(null);

  // Tab panel kanan pada Step 3
  const [resultTab, setResultTab] = useState<string>("temuan");

  // State sinkronisasi canvas & room list
  const [hoveredRoomIndex, setHoveredRoomIndex] = useState<number | null>(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null);

  // State modals & drawers
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossaryTermId, setGlossaryTermId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [apiOnline, setApiOnline] = useState<boolean>(true);

  // State grid Sanga Mandala
  const [gridConfig, setGridConfig] = useState<SangaMandalaGrid | null>(null);

  const handleStepChange = (newStep: number, direction: "forward" | "backward" = "forward") => {
    setStep(newStep);
    setMaxStepReached((prev) => Math.max(prev, newStep));
    if (stepContainerRef.current) {
      animateStepTransition(stepContainerRef.current, direction);
    }
  };

  // 1. Health check awal & cek lokasi tersimpan di localStorage browser
  useEffect(() => {
    async function init() {
      const isOnline = await checkBackendHealth();
      setApiOnline(isOnline);

      let initialLat = DEFAULT_LOCATION.lat;
      let initialLon = DEFAULT_LOCATION.lon;
      let restoredFromStorage = false;

      try {
        const rawSaved = window.localStorage.getItem(SAVED_LOCATION_KEY);
        if (rawSaved) {
          const parsed = JSON.parse(rawSaved);
          if (
            typeof parsed?.lat === "number" &&
            typeof parsed?.lon === "number" &&
            isInBali(parsed.lat, parsed.lon)
          ) {
            initialLat = parsed.lat;
            initialLon = parsed.lon;
            restoredFromStorage = true;
          }
        }
      } catch {
        // Abaikan jika gagal membaca localStorage
      }

      if (restoredFromStorage) {
        setLat(initialLat);
        setLon(initialLon);
        setHasPin(true);
      }

      try {
        const kaja = await getKaja(initialLat, initialLon);
        setKajaData(kaja);
      } catch {
        // Fallback ke default
      }

      try {
        const initialAudit = await runPresetAudit("preset_1_pass", initialLat, initialLon, 0);
        setAuditData(initialAudit);
      } catch {
        // Tangani diam-diam
      }
    }
    init();
  }, []);

  // 2. Sinkronkan pratinjau preset saat memilih preset baru atau merotasi arah utara denah
  useEffect(() => {
    if (inputTab !== "sample" || !selectedPresetId) return;
    let cancelled = false;
    runPresetAudit(selectedPresetId, lat, lon, planNorthDeg)
      .then((res) => {
        if (!cancelled) {
          setAuditData(res);
          setSelectedRoomIndex(null);
          setHoveredRoomIndex(null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [inputTab, selectedPresetId, lat, lon, planNorthDeg]);

  // 3. Ambil vektor Kaja & simpan lokasi ke localStorage setiap kali pengguna menaruh/menggeser pin
  const handleLocationChange = useCallback(async (newLat: number, newLon: number) => {
    setLat(newLat);
    setLon(newLon);
    setHasPin(true);
    try {
      window.localStorage.setItem(
        SAVED_LOCATION_KEY,
        JSON.stringify({ lat: newLat, lon: newLon })
      );
    } catch {
      // Abaikan jika storage penuh
    }
    try {
      const kaja = await getKaja(newLat, newLon);
      setKajaData(kaja);
    } catch {
      // Pertahankan state sebelumnya
    }
  }, []);

  // 3b. Handler lokasi GPS
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
            `Batas Wilayah Bali: Lokasi GPS Anda (${userLat.toFixed(2)}, ${userLon.toFixed(2)}) berada di luar Pulau Bali.`
          );
        }
      },
      () => setGeoError("Batas Wilayah Bali: Izin lokasi GPS ditolak atau tidak tersedia."),
      { timeout: 8000 }
    );
  }, [handleLocationChange]);

  // Fetch grid config Sanga Mandala
  useEffect(() => {
    if (!kajaData.kaja_quadrant) return;
    getSangaMandalaGrid(kajaData.kaja_quadrant, planNorthDeg)
      .then((data) => setGridConfig(data))
      .catch(() => setGridConfig(null));
  }, [kajaData.kaja_quadrant, planNorthDeg]);

  // 4. Handle pemilihan berkas
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImageSrc(url);
    } else {
      if (uploadedImageSrc) URL.revokeObjectURL(uploadedImageSrc);
      setUploadedImageSrc(null);
    }
    // Bersihkan hasil audit lama agar kotak preset/denah sebelumnya tidak tertinggal di atas denah baru
    setAuditData(null);
    setSelectedRoomIndex(null);
    setHoveredRoomIndex(null);
    setAuditError(null);
  };

  // 5. Eksekusi audit
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
      setResultTab("temuan");
      handleStepChange(3, "forward");
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

  const handleOpenGlossaryWithTerm = (termId: string) => {
    setGlossaryTermId(termId);
    setIsGlossaryOpen(true);
  };

  return (
    <div
      id="app-root"
      className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-ink-950 text-bone-100 font-sans selection:bg-bone-100/20 selection:text-bone-100"
    >
      {/* Header Terpadu dengan Stepper */}
      <Header
        onOpenGlossary={() => {
          setGlossaryTermId(null);
          setIsGlossaryOpen(true);
        }}
        apiOnline={apiOnline}
        currentStep={step}
        maxStepReached={maxStepReached}
        onSelectStep={(targetStep) =>
          handleStepChange(targetStep, targetStep > step ? "forward" : "backward")
        }
      />

      {/* Kontainer Utama Full-Width & 100vh Desktop */}
      <main
        id="app-main-workspace"
        className="no-print flex-1 min-h-0 w-full px-3 sm:px-5 lg:px-6 py-3 lg:py-4 flex flex-col overflow-y-auto lg:overflow-hidden"
      >
        <div ref={stepContainerRef} className="flex-1 min-h-0 flex flex-col">
          {step === 1 ? (
            /* ========================================================== */
            /* STEP 1: LOKASI TAPAK & ORIENTASI KAJA (100VH 2 KOLOM)      */
            /* ========================================================== */
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Kiri (8 Kolom): Kartu Peta Interaktif Full-Height */}
              <div className="lg:col-span-8 flex flex-col min-h-[320px] sm:min-h-[420px] lg:min-h-0 bg-ink-900 border border-ink-800 rounded-xl overflow-hidden">
                {/* Baris Kontrol Pencarian Wilayah / Koordinat di Atas Peta */}
                <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-ink-800 flex flex-wrap items-center justify-between gap-2 bg-ink-900">
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <span className="text-[12.5px] sm:text-[13px] font-semibold text-bone-100 mr-0.5 hidden xs:inline">
                      Lokasi Tapak:
                    </span>
                    <LocationSearchBox
                      lat={lat}
                      lon={lon}
                      hasPin={hasPin}
                      onSelectLocation={handleLocationChange}
                      className="flex-1 sm:flex-none"
                    />

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleUseMyLocation}
                      icon={<Locate size={13} className="text-bone-400" />}
                      className="shrink-0"
                    >
                      <span className="hidden xs:inline">Lokasi </span><span>Saya</span>
                    </Button>
                  </div>

                  <div className="w-full sm:w-auto text-[11px] sm:text-[11.5px] font-mono text-bone-400 flex items-center gap-1.5 truncate">
                    <MapPin size={13} className={`shrink-0 ${hasPin ? "text-clay" : "text-bone-400"}`} />
                    {hasPin ? (
                      <span className="truncate">
                        {cleanLocationLabel(kajaData.location_label)} ({lat.toFixed(4)}°, {lon.toFixed(4)}°)
                      </span>
                    ) : (
                      <span className="truncate">Belum ada pin lokasi (Klik peta / cari wilayah)</span>
                    )}
                  </div>
                </div>

                {geoError && (
                  <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-ink-950 border-b border-clay/50 text-clay text-[12px]">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{geoError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGeoError(null)}
                      aria-label="Tutup pesan"
                      className="text-bone-400 hover:text-bone-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Peta Mengisi Sisa Tinggi Kartu */}
                <div className="flex-1 min-h-0">
                  <KajaMap
                    lat={lat}
                    lon={lon}
                    hasPin={hasPin}
                    bearing={kajaData.bearing_degrees}
                    cardinalDirection={kajaData.cardinal_direction}
                    distanceKm={kajaData.distance_km}
                    onChangeLocation={handleLocationChange}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Kanan (4 Kolom): Panel Sanga Mandala & Tombol Lanjut */}
              <div className="lg:col-span-4 flex flex-col justify-between min-h-0 bg-ink-900 border border-ink-800 rounded-xl p-4 sm:p-5 overflow-y-auto gap-4">
                <div className="space-y-4">
                  {/* 2 Metrik Kunci */}
                  <div className="grid grid-cols-2 gap-3 pb-3.5 border-b border-ink-800">
                    <div>
                      <span className="text-[10.5px] font-mono text-bone-400 uppercase tracking-wider block">
                        Arah Suci Kaja
                      </span>
                      <span className="text-[16px] font-bold text-bone-100 mt-0.5 block">
                        {hasPin ? cardinalSingular(kajaData.cardinal_direction) : "Pilih Titik"}
                      </span>
                      <span className="text-[11.5px] font-mono text-bone-400">
                        {hasPin
                          ? `${kajaData.bearing_degrees.toFixed(1)}° · ${kajaData.distance_km?.toFixed(1) || "-"} km`
                          : "Klik peta di samping"}
                      </span>
                    </div>

                    <div className="border-l border-ink-800 pl-3">
                      <span className="text-[10.5px] font-mono text-bone-400 uppercase tracking-wider block">
                        Sudut Sanggah
                      </span>
                      <span className="text-[16px] font-bold text-bone-100 mt-0.5 block">
                        {hasPin
                          ? cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant)).replace("Sudut ", "")
                          : "Menunggu Pin"}
                      </span>
                      <span className="text-[11.5px] font-mono text-bone-400">
                        Utamaning Utama
                      </span>
                    </div>
                  </div>

                  {/* Matriks 3x3 Sanga Mandala */}
                  <MiniZoneGrid
                    gridConfig={gridConfig}
                    cardinalDirection={kajaData.cardinal_direction}
                    kajaQuadrant={kajaData.kaja_quadrant}
                    planNorthDeg={planNorthDeg}
                  />

                  <p className="text-[12px] text-bone-400 leading-relaxed">
                    {hasPin ? (
                      <>
                        Lokasi terakhir Anda tersimpan otomatis di peramban. Poros Kaja mengarah ke{" "}
                        <strong className="text-bone-200">{cardinalSingular(kajaData.cardinal_direction)}</strong> dan zona suci (Sanggah) dikunci pada{" "}
                        <strong className="text-bone-200">{cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant))}</strong>.
                      </>
                    ) : (
                      <>
                        Silakan <strong>klik titik lokasi tanah Anda pada peta</strong> atau gunakan kotak pencarian wilayah/koordinat di atas. Pilihan Anda akan otomatis disimpan di peramban.
                      </>
                    )}
                  </p>
                </div>

                {/* Tombol Lanjut */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shrink-0"
                  disabled={!hasPin}
                  onClick={() => handleStepChange(2, "forward")}
                  icon={<ArrowRight size={16} />}
                >
                  {hasPin ? "Lanjut ke Denah Bangunan" : "Letakkan Pin di Peta Dahulu"}
                </Button>
              </div>
            </div>
          ) : step === 2 ? (
            /* ========================================================== */
            /* STEP 2: KONFIGURASI DENAH & PRATINJAU (100VH 2 KOLOM)      */
            /* ========================================================== */
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Kiri (4 Kolom): Panel Kontrol Denah */}
              <div className="lg:col-span-4 flex flex-col justify-between min-h-0 bg-ink-900 border border-ink-800 rounded-xl p-4 sm:p-5 overflow-y-auto gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-[16px] font-bold text-bone-100">
                      Pilih / Unggah Denah
                    </h1>
                    <button
                      type="button"
                      onClick={() => handleStepChange(1, "backward")}
                      className="text-[12px] text-bone-400 hover:text-bone-100 inline-flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft size={13} />
                      <span>Lokasi</span>
                    </button>
                  </div>

                  <Tabs
                    tabs={[
                      { id: "sample", label: "Denah Contoh" },
                      { id: "upload", label: "Unggah Denah (AI)" },
                    ]}
                    activeTab={inputTab}
                    onChange={(id) => {
                      setInputTab(id);
                      setAuditError(null);
                      setSelectedRoomIndex(null);
                      setHoveredRoomIndex(null);
                      if (id === "upload") {
                        // Saat beralih ke tab upload, bersihkan kotak preset jika belum diaudit AI
                        if (auditData?.source === "preset" || auditData?.mode === "preset") {
                          setAuditData(null);
                        }
                      }
                    }}
                    className="w-full"
                  />

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

                  <div className="pt-3 border-t border-ink-800">
                    <OrientationPicker
                      planNorthDeg={planNorthDeg}
                      onChange={setPlanNorthDeg}
                    />
                  </div>

                  {auditError && (
                    <SourceBanner
                      error={auditError.message}
                      retryAfterS={auditError.retryAfterS}
                      onRetry={handleExecuteAudit}
                      onSwitchToPreset={() => {
                        setInputTab("sample");
                        setSelectedPresetId("preset_1_pass");
                        setAuditError(null);
                      }}
                    />
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shrink-0"
                  disabled={isAuditing || (inputTab === "upload" && !selectedFile)}
                  onClick={handleExecuteAudit}
                  icon={
                    isAuditing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={16} />
                    )
                  }
                >
                  {isAuditing
                    ? inputTab === "upload"
                      ? "AI Sedang Memindai Denah..."
                      : "Memeriksa Tata Ruang..."
                    : "Periksa Kepatuhan Denah"}
                </Button>
              </div>

              {/* Kanan (8 Kolom): Pratinjau Kanvas Full-Height (Bisa Zoom In/Out & Pan) */}
              <div className="lg:col-span-8 flex flex-col h-[420px] sm:h-[480px] lg:h-auto lg:min-h-0 relative">
                <PlanCanvas
                  imageSrc={inputTab === "upload" ? uploadedImageSrc : null}
                  gridLayout={auditData?.grid_layout || null}
                  rooms={
                    inputTab === "upload" &&
                    (auditData?.source === "preset" || auditData?.mode === "preset" || !auditData)
                      ? []
                      : auditData?.rooms || []
                  }
                  violations={
                    inputTab === "upload" &&
                    (auditData?.source === "preset" || auditData?.mode === "preset" || !auditData)
                      ? []
                      : auditData?.audit_report?.violations || []
                  }
                  hoveredIndex={hoveredRoomIndex}
                  selectedIndex={selectedRoomIndex}
                  onHoverIndex={setHoveredRoomIndex}
                  onSelectIndex={setSelectedRoomIndex}
                  kajaBearing={kajaData.bearing_degrees}
                  kajaDirection={kajaData.cardinal_direction}
                  className="flex-1 min-h-0"
                />

                {isAuditing && (
                  <div className="absolute inset-0 bg-ink-950/75 z-30 flex flex-col items-center justify-center p-6 rounded-xl border border-bone-100/20 overflow-hidden">
                    <div className="absolute left-0 right-0 h-[2px] bg-bone-100/40 animate-laser pointer-events-none" />
                    <div className="bg-ink-900 border border-ink-800 p-5 rounded-xl text-center shadow-2xl max-w-sm">
                      <RefreshCw size={26} className="animate-spin text-bone-100 mx-auto mb-3" />
                      <h4 className="text-[15px] font-bold text-bone-100">
                        {inputTab === "upload"
                          ? "AI Vision Memindai Ruangan..."
                          : "Mengevaluasi Sanga Mandala..."}
                      </h4>
                      <p className="text-[12px] text-bone-400 mt-1 font-mono">
                        Memetakan koordinat ruang terhadap sumbu Kaja
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* STEP 3: HASIL EVALUASI & REKOMENDASI (100VH DASHBOARD)     */
            /* ========================================================== */
            <div className="flex-1 min-h-0 flex flex-col gap-3.5">
              {auditData && (
                <>
                  {/* Baris Kesimpulan Ringkas */}
                  <Verdict
                    report={auditData.audit_report}
                    onPrintReport={() => setIsReportOpen(true)}
                    onEditPlan={() => handleStepChange(2, "backward")}
                    className="shrink-0"
                  />

                  {/* Area Inspeksi 2 Kolom Full-Height */}
                  <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Kolom Kiri (7 Kolom): Kanvas Denah Interaktif (Bisa Zoom In/Out & Pan) */}
                    <div className="lg:col-span-7 flex flex-col h-[400px] sm:h-[460px] lg:h-auto lg:min-h-0">
                      <PlanCanvas
                        imageSrc={inputTab === "upload" ? uploadedImageSrc : null}
                        gridLayout={auditData.grid_layout || null}
                        rooms={auditData.rooms || []}
                        violations={auditData.audit_report.violations || []}
                        hoveredIndex={hoveredRoomIndex}
                        selectedIndex={selectedRoomIndex}
                        onHoverIndex={setHoveredRoomIndex}
                        onSelectIndex={setSelectedRoomIndex}
                        kajaBearing={kajaData.bearing_degrees}
                        kajaDirection={kajaData.cardinal_direction}
                        className="flex-1 min-h-0"
                      />
                    </div>

                    {/* Kolom Kanan (5 Kolom): Panel Tab Terpadu (Scroll Internal) */}
                    <div className="lg:col-span-5 flex flex-col min-h-0 bg-ink-900 border border-ink-800 rounded-xl p-4 overflow-hidden">
                      <div className="shrink-0 pb-3">
                        <Tabs
                          tabs={[
                            {
                              id: "temuan",
                              label: `Evaluasi (${auditData.audit_report.violations.length})`,
                            },
                            {
                              id: "ruangan",
                              label: `Ruang (${auditData.rooms.length})`,
                            },
                            {
                              id: "hukum",
                              label: "Rumus & Perda",
                            },
                          ]}
                          activeTab={resultTab}
                          onChange={setResultTab}
                          className="w-full"
                        />
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
                        {resultTab === "temuan" ? (
                          <div className="space-y-3">
                            {auditData.audit_report.violations.length === 0 ? (
                              <div className="p-5 text-center bg-ink-950/60 rounded-xl border border-ink-800 space-y-1.5">
                                <CheckCircle2 size={26} className="text-emerald-500 mx-auto" />
                                <h3 className="text-[14px] font-semibold text-bone-100">
                                  Nir-Pelanggaran Tata Ruang
                                </h3>
                                <p className="text-[12px] text-bone-400 leading-relaxed">
                                  Seluruh ruangan telah ditempatkan sesuai dengan nilai kesucian Sanga Mandala dan memenuhi batas KDB maksimal 60%.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {auditData.audit_report.violations.map((violation, i) => (
                                  <IssueCard
                                    key={violation.id || i}
                                    violation={violation}
                                    index={i}
                                    onFocusRoom={() => {
                                      const idx = auditData.rooms.findIndex(
                                        (r) =>
                                          r.name.toLowerCase() ===
                                            violation.room_name.toLowerCase() ||
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

                            {auditData.audit_report.compliances.length > 0 && (
                              <div className="pt-2.5 border-t border-ink-800 space-y-1.5">
                                <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider block">
                                  Ruangan Sesuai Pakem ({auditData.audit_report.compliances.length})
                                </span>
                                <div className="space-y-1.5">
                                  {auditData.audit_report.compliances.map((c, idx) => (
                                    <div
                                      key={idx}
                                      className="px-3 py-2 bg-ink-950/50 rounded-lg border border-ink-800/80 flex items-center justify-between gap-2 text-[12px]"
                                    >
                                      <span className="font-medium text-bone-100 truncate">
                                        {c.room_name}
                                      </span>
                                      <span className="text-[11px] font-mono text-bone-400 shrink-0">
                                        {c.zone_name.split(" (")[0]}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : resultTab === "ruangan" ? (
                          <RoomList
                            rooms={auditData.rooms || []}
                            violations={auditData.audit_report.violations || []}
                            hoveredIndex={hoveredRoomIndex}
                            selectedIndex={selectedRoomIndex}
                            onHoverRoom={setHoveredRoomIndex}
                            onSelectRoom={setSelectedRoomIndex}
                            onOpenGlossaryDrawer={handleOpenGlossaryWithTerm}
                          />
                        ) : (
                          <AuditTransparency
                            kajaVector={auditData.kaja_vector}
                            report={auditData.audit_report}
                            rooms={auditData.rooms}
                            planNorthDeg={planNorthDeg}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Drawer Glosarium Slide-over */}
      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTermId={glossaryTermId}
      />

      {/* Modal Laporan Resmi Siap Cetak (PDF) */}
      <Report
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={auditData}
        planNorthDeg={planNorthDeg}
      />
    </div>
  );
}
