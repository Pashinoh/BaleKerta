"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/layout/Header";
import { Stepper } from "@/components/layout/Stepper";
import { GlossaryDrawer } from "@/components/glossary/GlossaryDrawer";
import { MiniZoneGrid, sacredCornerLabel, type SangaMandalaGrid } from "@/components/map/MiniZoneGrid";
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
import { DEFAULT_LOCATION, BALI_QUICK_LOCATIONS, isInBali } from "@/lib/geo";
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

const KajaMap = dynamic(() => import("@/components/map/KajaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] bg-ink-900 border border-ink-800 rounded-xl flex items-center justify-center text-bone-400 font-mono text-[13px]">
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

  // State geo & lokasi
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

  // 1. Health check awal & muat Kaja / Preset default
  useEffect(() => {
    async function init() {
      const isOnline = await checkBackendHealth();
      setApiOnline(isOnline);

      try {
        const kaja = await getKaja(lat, lon);
        setKajaData(kaja);
      } catch {
        // Fallback ke default
      }

      try {
        const initialAudit = await runPresetAudit("preset_1_pass", lat, lon, 0);
        setAuditData(initialAudit);
      } catch {
        // Tangani diam-diam
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 3. Ambil vektor Kaja setiap kali koordinat berubah
  const handleLocationChange = useCallback(async (newLat: number, newLon: number) => {
    setLat(newLat);
    setLon(newLon);
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
    <div className="min-h-screen flex flex-col bg-ink-950 text-bone-100 font-sans selection:bg-bone-100/20 selection:text-bone-100">
      {/* Header */}
      <Header
        onOpenGlossary={() => {
          setGlossaryTermId(null);
          setIsGlossaryOpen(true);
        }}
        apiOnline={apiOnline}
      />

      {/* Kontainer Utama yang Lega & Rapi */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-7 space-y-7">
        {/* Stepper Bar */}
        <Stepper
          currentStep={step}
          maxStepReached={maxStepReached}
          onSelectStep={(targetStep) =>
            handleStepChange(targetStep, targetStep > step ? "forward" : "backward")
          }
        />

        {/* Konten Tahapan */}
        <div ref={stepContainerRef}>
          {step === 1 ? (
            /* ========================================================== */
            /* STEP 1: LOKASI TAPAK & ORIENTASI KAJA (2 KOLOM BERSIH)     */
            /* ========================================================== */
            <div className="space-y-6">
              {/* Baris Judul & Pilih Cepat Wilayah */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-[20px] sm:text-[22px] font-bold text-bone-100 tracking-tight">
                    Tentukan Titik Lokasi Tapak Tanah
                  </h1>
                  <p className="text-[13px] text-bone-400 mt-0.5">
                    Klik pada peta Bali untuk menghitung sudut suci Kaja ke puncak Gunung Agung secara presisi.
                  </p>
                </div>

                {/* Filter Wilayah Cepat */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <select
                    id="quick-location-select"
                    aria-label="Pilih Cepat Kabupaten atau Kota di Bali"
                    value={
                      BALI_QUICK_LOCATIONS.find(
                        (loc) =>
                          Math.abs(loc.lat - lat) < 0.03 &&
                          Math.abs(loc.lon - lon) < 0.03
                      )?.id || ""
                    }
                    className="min-h-[38px] bg-ink-900 border border-ink-800 text-bone-100 rounded-lg px-3 py-1.5 text-[13px] focus-visible:outline-2 focus-visible:outline-bone-100"
                    onChange={(e) => {
                      const selected = BALI_QUICK_LOCATIONS.find(
                        (loc) => loc.id === e.target.value
                      );
                      if (selected) {
                        handleLocationChange(selected.lat, selected.lon);
                      }
                    }}
                  >
                    <option value="">Pilih Kabupaten / Kota...</option>
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
                    icon={<Locate size={14} className="text-bone-400" />}
                  >
                    Lokasi Saya
                  </Button>
                </div>
              </div>

              {geoError && (
                <div className="flex items-center justify-between p-3.5 bg-ink-900 border border-clay/60 text-clay rounded-xl text-[13px]">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{geoError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeoError(null)}
                    aria-label="Tutup pesan"
                    className="min-w-[32px] min-h-[32px] flex items-center justify-center text-bone-400 hover:text-bone-100"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Grid 2 Kolom: Kiri Peta (7 col), Kanan Panel Sanga Mandala (5 col) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* Kiri: Peta Interaktif */}
                <div className="lg:col-span-7 space-y-2.5">
                  <KajaMap
                    lat={lat}
                    lon={lon}
                    bearing={kajaData.bearing_degrees}
                    cardinalDirection={kajaData.cardinal_direction}
                    distanceKm={kajaData.distance_km}
                    onChangeLocation={handleLocationChange}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-[12px] font-mono text-bone-400 px-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} />
                      <span>{kajaData.location_label || "Wilayah Bali"}</span>
                    </span>
                    <span>
                      {lat.toFixed(4)}° LS, {lon.toFixed(4)}° BT · {kajaData.distance_km?.toFixed(1) || "-"} km ke Gn. Agung
                    </span>
                  </div>
                </div>

                {/* Kanan: Panel Ringkasan Sanga Mandala */}
                <div className="lg:col-span-5 bg-ink-900 border border-ink-800 rounded-xl p-5 sm:p-6 space-y-5">
                  {/* 2 Metrik Kunci */}
                  <div className="grid grid-cols-2 gap-3 pb-4 border-b border-ink-800">
                    <div>
                      <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider block">
                        Arah Suci Kaja
                      </span>
                      <span className="text-[17px] font-bold text-bone-100 mt-0.5 block">
                        {cardinalSingular(kajaData.cardinal_direction)}
                      </span>
                      <span className="text-[12px] font-mono text-bone-400">
                        Azimuth {kajaData.bearing_degrees.toFixed(1)}°
                      </span>
                    </div>

                    <div className="border-l border-ink-800 pl-3.5">
                      <span className="text-[11px] font-mono text-bone-400 uppercase tracking-wider block">
                        Posisi Sanggah
                      </span>
                      <span className="text-[17px] font-bold text-bone-100 mt-0.5 block">
                        {cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant)).replace("Sudut ", "")}
                      </span>
                      <span className="text-[12px] font-mono text-bone-400">
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

                  {/* Keterangan Singkat */}
                  <p className="text-[12.5px] text-bone-400 leading-relaxed">
                    Di titik koordinat ini, poros suci menghadap ke{" "}
                    <strong className="text-bone-200">{cardinalSingular(kajaData.cardinal_direction)}</strong>. Area suci keluarga (Sanggah) dikunci pada{" "}
                    <strong className="text-bone-200">{cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant))}</strong> dan utilitas sanitasi (Teba) di sudut seberangnya.
                  </p>

                  {/* Tombol Lanjut */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => handleStepChange(2, "forward")}
                    icon={<ArrowRight size={16} />}
                  >
                    Lanjut ke Denah Bangunan
                  </Button>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            /* ========================================================== */
            /* STEP 2: KONFIGURASI DENAH & PRATINJAU (2 KOLOM BERSIH)     */
            /* ========================================================== */
            <div className="space-y-6">
              {/* Baris Judul */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[20px] sm:text-[22px] font-bold text-bone-100 tracking-tight">
                    Pilih atau Unggah Denah Bangunan
                  </h1>
                  <p className="text-[13px] text-bone-400 mt-0.5">
                    Uji menggunakan contoh denah standar atau unggah gambar denah Anda untuk dipindai AI Vision.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStepChange(1, "backward")}
                  icon={<ArrowLeft size={14} />}
                >
                  Ubah Lokasi Tapak
                </Button>
              </div>

              {/* Grid 2 Kolom: Kiri Konfigurasi (5 col), Kanan Kanvas (7 col) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* Kiri: Panel Kontrol */}
                <div className="lg:col-span-5 bg-ink-900 border border-ink-800 rounded-xl p-5 sm:p-6 space-y-5">
                  <Tabs
                    tabs={[
                      { id: "sample", label: "Denah Contoh" },
                      { id: "upload", label: "Unggah Denah (AI)" },
                    ]}
                    activeTab={inputTab}
                    onChange={(id) => {
                      setInputTab(id);
                      setAuditError(null);
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

                  <div className="pt-4 border-t border-ink-800">
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

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
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

                {/* Kanan: Pratinjau Kanvas Langsung */}
                <div className="lg:col-span-7 lg:sticky lg:top-20">
                  <div className="relative">
                    <PlanCanvas
                      imageSrc={inputTab === "upload" ? uploadedImageSrc : null}
                      gridLayout={auditData?.grid_layout || null}
                      rooms={inputTab === "upload" && !auditData ? [] : auditData?.rooms || []}
                      violations={inputTab === "upload" && !auditData ? [] : auditData?.audit_report?.violations || []}
                      hoveredIndex={hoveredRoomIndex}
                      selectedIndex={selectedRoomIndex}
                      onHoverIndex={setHoveredRoomIndex}
                      onSelectIndex={setSelectedRoomIndex}
                      kajaBearing={kajaData.bearing_degrees}
                      kajaDirection={kajaData.cardinal_direction}
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
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* STEP 3: HASIL EVALUASI & REKOMENDASI (DASHBOARD BERSIH)    */
            /* ========================================================== */
            <div className="space-y-6">
              {auditData && (
                <>
                  {/* Kartu Kesimpulan Eksekutif */}
                  <Verdict
                    report={auditData.audit_report}
                    onPrintReport={() => setIsReportOpen(true)}
                    onEditPlan={() => handleStepChange(2, "backward")}
                  />

                  {/* Area Inspeksi 2 Kolom: Kiri Kanvas (7 col), Kanan Panel Tab (5 col) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                    {/* Kolom Kiri: Kanvas Denah Interaktif */}
                    <div className="lg:col-span-7 lg:sticky lg:top-20 space-y-2.5">
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
                      />
                      <SourceBanner
                        source={auditData.source}
                        model={auditData.model}
                        compact
                      />
                    </div>

                    {/* Kolom Kanan: Panel Tab Terpadu (Temuan, Ruangan, Dasar Hukum) */}
                    <div className="lg:col-span-5 bg-ink-900 border border-ink-800 rounded-xl p-5 space-y-4">
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

                      {resultTab === "temuan" ? (
                        <div className="space-y-4">
                          {auditData.audit_report.violations.length === 0 ? (
                            <div className="p-6 text-center bg-ink-950/60 rounded-xl border border-ink-800 space-y-2">
                              <CheckCircle2 size={28} className="text-emerald-500 mx-auto" />
                              <h3 className="text-[14px] font-semibold text-bone-100">
                                Nir-Pelanggaran Tata Ruang
                              </h3>
                              <p className="text-[12.5px] text-bone-400 leading-relaxed">
                                Seluruh ruangan telah ditempatkan sesuai dengan nilai kesucian Sanga Mandala dan memenuhi batas KDB maksimal 60%.
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

                          {/* Ringkasan Ruangan yang Sudah Sesuai */}
                          {auditData.audit_report.compliances.length > 0 && (
                            <div className="pt-3 border-t border-ink-800 space-y-2">
                              <span className="text-[12px] font-mono text-bone-400 uppercase tracking-wider block">
                                Ruangan Sesuai Pakem ({auditData.audit_report.compliances.length})
                              </span>
                              <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                                {auditData.audit_report.compliances.map((c, idx) => (
                                  <div
                                    key={idx}
                                    className="px-3 py-2 bg-ink-950/50 rounded-lg border border-ink-800/80 flex items-center justify-between gap-2 text-[12.5px]"
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
