"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/layout/Header";
import { Stepper } from "@/components/layout/Stepper";
import { StickyControlDock } from "@/components/layout/StickyControlDock";
import { GlossaryDrawer } from "@/components/glossary/GlossaryDrawer";
import { MiniZoneGrid, sacredCornerLabel } from "@/components/map/MiniZoneGrid";
import { SampleList, PRESET_OPTIONS } from "@/components/plan/SampleList";
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
import { animateStepTransition } from "@/lib/animations";
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Locate,
  AlertCircle,
  X,
  Compass,
  Landmark,
  Printer,
  Sparkles,
  Layers,
  MapPin,
} from "lucide-react";

// Dynamic import untuk Leaflet map — hindari SSR
const KajaMap = dynamic(() => import("@/components/map/KajaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] bg-ink-900 border border-ink-700 rounded-xl flex items-center justify-center text-bone-400 font-mono text-[13px]">
      Memuat peta interaktif Bali...
    </div>
  ),
});

// Helper: arah kardinal ke bentuk tunggal bahasa Indonesia
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

// Helper: label sudut ke kapitalisasi bahasa Indonesia
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

  // State sinkronisasi canvas & room list
  const [hoveredRoomIndex, setHoveredRoomIndex] = useState<number | null>(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null);

  // State modals & drawers
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossaryTermId, setGlossaryTermId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [apiOnline, setApiOnline] = useState<boolean>(true);

  // Animasi transisi step menggunakan Anime.js
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

  // 2. Ambil vektor Kaja setiap kali koordinat berubah
  const handleLocationChange = useCallback(
    async (newLat: number, newLon: number) => {
      setLat(newLat);
      setLon(newLon);
      try {
        const kaja = await getKaja(newLat, newLon);
        setKajaData(kaja);

        // Jika di step hasil dan menggunakan preset, hitung ulang secara live
        if (inputTab === "sample" && selectedPresetId && auditData) {
          const updated = await runPresetAudit(selectedPresetId, newLat, newLon, planNorthDeg);
          setAuditData(updated);
        }
      } catch {
        // Pertahankan state sebelumnya
      }
    },
    [inputTab, selectedPresetId, planNorthDeg, auditData]
  );

  // 2b. Handler lokasi GPS
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

  // 3. Handle pemilihan berkas
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

  // 4. Eksekusi audit
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

  // Buka drawer glosarium dengan fokus istilah tertentu
  const handleOpenGlossaryWithTerm = (termId: string) => {
    setGlossaryTermId(termId);
    setIsGlossaryOpen(true);
  };

  const currentPresetName =
    PRESET_OPTIONS.find((p) => p.id === selectedPresetId)?.title || "Denah Terpilih";

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

      {/* Kontainer Utama */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
        {/* Stepper */}
        <div className="space-y-4">
          <Stepper
            currentStep={step}
            maxStepReached={maxStepReached}
            onSelectStep={(targetStep) =>
              handleStepChange(targetStep, targetStep > step ? "forward" : "backward")
            }
          />
        </div>

        {/* Pembungkus Konten Step dengan Target Anime.js */}
        <div ref={stepContainerRef} className="space-y-6">
          {step === 1 ? (
            /* ========================================================== */
            /* STEP 1: LOKASI TANAH & SUDUT GEODESIK KAJA                 */
            /* ========================================================== */
            <div className="space-y-6">
              {/* Atas: Peta Interaktif Kaja */}
              <div className="bg-ink-900 border border-ink-700 rounded-xl p-4 sm:p-5 shadow-card space-y-4">
                {/* Kontrol lokasi cepat */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-ink-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label
                      htmlFor="quick-location-select"
                      className="text-[13px] text-bone-400 font-mono font-medium"
                    >
                      Pilih Cepat Wilayah:
                    </label>
                    <select
                      id="quick-location-select"
                      className="bg-ink-950 border border-ink-700 text-bone-100 rounded-lg px-3 py-1.5 text-[13px] focus-visible:outline-2 focus-visible:outline-bone-100"
                      onChange={(e) => {
                        const selected = BALI_QUICK_LOCATIONS.find(
                          (loc) => loc.id === e.target.value
                        );
                        if (selected) {
                          handleLocationChange(selected.lat, selected.lon);
                        }
                      }}
                    >
                      <option value="">Pilih Kabupaten / Kota</option>
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

                  <div className="text-[12px] font-mono text-bone-400 flex items-center gap-1.5">
                    <MapPin size={14} className="text-bone-400" />
                    <span>{kajaData.location_label || "Wilayah Bali"}</span>
                  </div>
                </div>

                {geoError && (
                  <div className="flex items-center justify-between p-3.5 bg-ink-950 border border-clay/60 text-clay rounded-xl text-[13px]">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{geoError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGeoError(null)}
                      aria-label="Tutup pesan"
                      className="text-bone-400 hover:text-bone-100 transition-colors"
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

              {/* Bawah: Analisis Geodesik & Grid Sanga Mandala */}
              <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 lg:p-6 shadow-card space-y-6">
                <header className="flex items-center justify-between border-b border-ink-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-bone-100" />
                    <h3 className="text-[16px] font-bold text-bone-100">
                      Orientasi Kosmologis Tapak (Sanga Mandala)
                    </h3>
                  </div>
                  <span className="text-[12px] font-mono text-bone-400">
                    Asta Bumi Geodesic Engine
                  </span>
                </header>

                {/* Badge ringkasan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3.5 bg-ink-950 border border-ink-700 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center text-bone-100 shrink-0">
                      <Compass size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-bone-400 block">
                        Arah Kaja (Ke Gn. Agung)
                      </span>
                      <span className="text-[15px] font-bold text-bone-100">
                        {cardinalSingular(kajaData.cardinal_direction)} ({kajaData.bearing_degrees.toFixed(1)}°)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-ink-950 border border-ink-700 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center text-bone-100 shrink-0">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-bone-400 block">
                        Area Suci (Sanggah / Pemerajan)
                      </span>
                      <span className="text-[15px] font-bold text-bone-100">
                        {cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid 3×3 dan Penjelasan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div>
                    <MiniZoneGrid kajaQuadrant={kajaData.kaja_quadrant} />
                  </div>
                  <div className="space-y-4 bg-ink-950 p-5 rounded-xl border border-ink-700">
                    <h4 className="text-[14px] font-semibold text-bone-100 flex items-center gap-2">
                      <Compass size={16} />
                      <span>Penjelasan Kaidah Tata Ruang Adat:</span>
                    </h4>
                    <p className="text-[13px] text-bone-300 leading-relaxed">
                      Sumbu suci Kaja pada lokasi tanah Anda mengarah ke{" "}
                      <strong className="text-bone-100">
                        {cardinalSingular(kajaData.cardinal_direction)}
                      </strong>. Berdasarkan hukum kosmologis Sanga Mandala, zona paling suci (*Utamaning Utama*) wajib ditempatkan di{" "}
                      <strong className="text-bone-100">
                        {cornerCapitalized(sacredCornerLabel(kajaData.kaja_quadrant))}
                      </strong>.
                    </p>
                    <p className="text-[12px] text-bone-400 leading-relaxed">
                      Sistem ini otomatis mengunci orientasi tersebut agar evaluasi denah bangunan pada Langkah 2 dievaluasi secara presisi dan objektif.
                    </p>
                  </div>
                </div>

                {/* Disclosure Parameter Teknis */}
                <Disclosure
                  title="Lihat Parameter Teknis & Koordinat Geodesik"
                  defaultOpen={false}
                  className="border-ink-700 bg-ink-950"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-ink-900 border border-ink-700 rounded-lg">
                      <span className="text-[11px] text-bone-400 font-mono block mb-1">
                        Koordinat Geografis
                      </span>
                      <span className="text-[14px] font-mono font-semibold text-bone-100 block">
                        {lat.toFixed(4)}°, {lon.toFixed(4)}°
                      </span>
                      <span className="text-[11px] text-bone-400 mt-1 block">
                        Datum WGS84
                      </span>
                    </div>

                    <div className="p-3 bg-ink-900 border border-ink-700 rounded-lg">
                      <span className="text-[11px] text-bone-400 font-mono block mb-1">
                        Azimuth Akurat
                      </span>
                      <span className="text-[14px] font-mono font-semibold text-bone-100 block">
                        {kajaData.bearing_degrees.toFixed(1)}°
                      </span>
                      <span className="text-[11px] text-bone-400 mt-1 block">
                        Kuadran: {kajaData.kaja_quadrant}
                      </span>
                    </div>

                    <div className="p-3 bg-ink-900 border border-ink-700 rounded-lg">
                      <span className="text-[11px] text-bone-400 font-mono block mb-1">
                        Jarak ke Puncak Gn. Agung
                      </span>
                      <span className="text-[14px] font-mono font-semibold text-bone-100 block">
                        {kajaData.distance_km ? `${kajaData.distance_km.toFixed(1)} km` : "-"}
                      </span>
                      <span className="text-[11px] text-bone-400 mt-1 block">
                        Elevasi 3.142 mdpl
                      </span>
                    </div>
                  </div>
                </Disclosure>

                {/* Aksi Langsung */}
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
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
            /* STEP 2: MASUKKAN DENAH BANGUNAN (CONTOH ATAU UPLOAD)       */
            /* ========================================================== */
            <div className="space-y-6">
              {/* 1. HERO: Kanvas Denah Full-Width */}
              <div className="relative">
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

                {/* Overlay animasi laser saat sedang audit */}
                {isAuditing && (
                  <div className="absolute inset-0 bg-ink-950/75 backdrop-blur-none z-30 flex flex-col items-center justify-center p-6 rounded-xl border border-bone-100/20 overflow-hidden">
                    <div className="absolute left-0 right-0 h-[2px] bg-bone-100/40 animate-laser pointer-events-none" />
                    <div className="bg-ink-900 border border-ink-700 p-5 rounded-xl text-center shadow-2xl max-w-sm">
                      <RefreshCw size={28} className="animate-spin text-bone-100 mx-auto mb-3" />
                      <h4 className="text-[15px] font-bold text-bone-100">
                        {inputTab === "upload"
                          ? "AI Vision Sedang Memindai Denah..."
                          : "Memverifikasi Tata Ruang Sanga Mandala..."}
                      </h4>
                      <p className="text-[12px] text-bone-400 mt-1.5 font-mono">
                        Memetakan poligon ruangan & menghitung keselarasan arah Kaja
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Form Konfigurasi Denah */}
              <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 lg:p-6 shadow-card space-y-6">
                <header className="flex items-center justify-between border-b border-ink-700 pb-4">
                  <div>
                    <h2 className="text-[17px] font-bold text-bone-100">
                      Pilih atau Unggah Denah Bangunan
                    </h2>
                    <p className="text-[12px] font-mono text-bone-400">
                      Langkah 2 dari 3 · Verifikasi Tata Ruang
                    </p>
                  </div>
                </header>

                {/* Tab Pemilih Mode */}
                <Tabs
                  tabs={[
                    { id: "sample", label: "Pilih Denah Contoh" },
                    { id: "upload", label: "Unggah Denah Sendiri (AI Vision)" },
                  ]}
                  activeTab={inputTab}
                  onChange={(id) => {
                    setInputTab(id);
                    setAuditError(null);
                  }}
                  className="w-full"
                />

                {/* Daftar Contoh atau Upload Box */}
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

                {/* Pemilih Orientasi */}
                <div className="p-4 bg-ink-950 border border-ink-700 rounded-xl space-y-3">
                  <OrientationPicker
                    planNorthDeg={planNorthDeg}
                    onChange={setPlanNorthDeg}
                  />
                </div>

                {/* Banner Error jika ada */}
                {auditError && (
                  <SourceBanner
                    error={auditError.message}
                    retryAfterS={auditError.retryAfterS}
                    onRetry={handleExecuteAudit}
                  />
                )}

                {/* Baris Aksi */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-ink-700">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleStepChange(1, "backward")}
                    icon={<ArrowLeft size={15} />}
                  >
                    Kembali
                  </Button>

                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isAuditing || (inputTab === "upload" && !selectedFile)}
                    onClick={handleExecuteAudit}
                    icon={
                      isAuditing ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )
                    }
                  >
                    {isAuditing
                      ? inputTab === "upload"
                        ? "AI Sedang Membaca Denah..."
                        : "Memeriksa Tata Ruang..."
                      : "Jalankan Pemeriksaan Sanga Mandala"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* STEP 3: HASIL PEMERIKSAAN DUAL-PANE (INSPEKSI INTERAKTIF)  */
            /* ========================================================== */
            <div className="space-y-6">
              {auditData && (
                <>
                  {/* Judul Status & Verdict Atas */}
                  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[20px] font-bold text-bone-100 tracking-tight">
                        Hasil Pra-Pemeriksaan Tata Ruang
                      </h2>
                      <p className="text-[12px] font-mono text-bone-400">
                        Evaluasi Kepatuhan Perda Prov. Bali No. 5/2005 & Asta Bumi
                      </p>
                    </div>
                    <SourceBanner
                      source={auditData.source}
                      model={auditData.model}
                      compact
                    />
                  </header>

                  {/* Kartu Verdict Ringkasan */}
                  <Verdict
                    report={auditData.audit_report}
                    onPrintReport={() => setIsReportOpen(true)}
                  />

                  {/* Layout Dual-Pane: Kiri PlanCanvas, Kanan Temuan & Ruangan */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Kolom Kiri: Kanvas Interaktif */}
                    <div className="lg:col-span-7 xl:col-span-7 sticky top-20 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[13px] font-semibold text-bone-100 flex items-center gap-1.5">
                          <Layers size={16} className="text-bone-400" />
                          <span>Kanvas Denah & Sanga Mandala Grid</span>
                        </span>
                        <span className="text-[11px] font-mono text-bone-400">
                          Arah Kaja: {kajaData.bearing_degrees.toFixed(1)}°
                        </span>
                      </div>

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
                    </div>

                    {/* Kolom Kanan: Temuan, Ruangan, dan Rekomendasi */}
                    <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                      {/* Widget Ruangan Terdeteksi */}
                      <div className="bg-ink-900 border border-ink-700 rounded-xl p-4 shadow-card">
                        <RoomList
                          rooms={auditData.rooms || []}
                          violations={auditData.audit_report.violations || []}
                          hoveredIndex={hoveredRoomIndex}
                          selectedIndex={selectedRoomIndex}
                          onHoverRoom={setHoveredRoomIndex}
                          onSelectRoom={setSelectedRoomIndex}
                          onOpenGlossaryDrawer={handleOpenGlossaryWithTerm}
                        />
                      </div>

                      {/* Daftar Pelanggaran / Temuan */}
                      <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 shadow-card space-y-4">
                        <header className="flex items-center justify-between border-b border-ink-700 pb-3">
                          <span className="text-[15px] font-bold text-bone-100 flex items-center gap-2">
                            <AlertCircle size={17} className="text-clay" />
                            <span>Perbaikan Tata Ruang Diperlukan</span>
                          </span>
                          <span className="text-[11px] font-mono text-bone-400">
                            {auditData.audit_report.violations.length} Temuan
                          </span>
                        </header>

                        {auditData.audit_report.violations.length === 0 ? (
                          <div className="p-6 text-center text-bone-300 bg-ink-950 rounded-xl border border-ink-700 space-y-2">
                            <CheckCircle2 size={32} className="text-bone-100 mx-auto" />
                            <p className="text-[14px] font-semibold text-bone-100">
                              Semua ruangan mematuhi pakem Asta Bumi & Perda Bali No. 5/2005.
                            </p>
                            <p className="text-[12px] text-bone-400">
                              Denah ini layak diajukan untuk proses perizinan PBG.
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
                      </div>

                      {/* Daftar Kepatuhan */}
                      {auditData.audit_report.compliances.length > 0 && (
                        <Disclosure
                          title={
                            <span className="text-[14px] font-semibold text-bone-100 flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-bone-400" />
                              <span>
                                Ruangan yang Sudah Sesuai ({auditData.audit_report.compliances.length})
                              </span>
                            </span>
                          }
                          subtitle="Daftar zona yang telah mematuhi aturan kesucian"
                          className="border-ink-700 bg-ink-900"
                        >
                          <ul className="space-y-2 pt-2 text-[13px]">
                            {auditData.audit_report.compliances.map((c, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 p-2.5 bg-ink-950 rounded-lg border border-ink-700"
                              >
                                <CheckCircle2 size={15} className="text-bone-400 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-bone-100 block">
                                    {c.room_name} · <span className="text-bone-300">{c.zone_name}</span>
                                  </span>
                                  <span className="text-bone-400 text-[12px] block">
                                    {c.detail}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </Disclosure>
                      )}

                      {/* Navigasi Aksi */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => handleStepChange(2, "backward")}
                          icon={<ArrowLeft size={15} />}
                        >
                          Ubah Denah
                        </Button>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setIsReportOpen(true)}
                          icon={<Printer size={16} />}
                        >
                          Cetak Dokumen Resmi
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Seksi Transparansi Sistem & Dasar Hukum */}
                  <div className="mt-8 pt-6 border-t border-ink-700" id="transparansi-sistem">
                    <AuditTransparency
                      kajaVector={auditData.kaja_vector}
                      report={auditData.audit_report}
                      rooms={auditData.rooms}
                      planNorthDeg={planNorthDeg}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Dock Kontrol Bawah Sticky untuk Alur Kerja yang Ramah Pengguna */}
      <StickyControlDock
        step={step}
        onPrev={() => handleStepChange(Math.max(1, step - 1), "backward")}
        onNext={() => handleStepChange(Math.min(3, step + 1), "forward")}
        onRunAudit={handleExecuteAudit}
        isAuditing={isAuditing}
        locationLabel={kajaData.location_label}
        kajaBearing={kajaData.bearing_degrees}
        kajaDirection={kajaData.cardinal_direction}
        presetName={inputTab === "upload" && selectedFile ? selectedFile.name : currentPresetName}
        hasFileOrPreset={inputTab === "sample" ? !!selectedPresetId : !!selectedFile}
      />

      {/* Drawer Glosarium Slide-over */}
      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTermId={glossaryTermId}
      />

      {/* Modal Laporan Resmi Siap Cetak */}
      <Report
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={auditData}
      />
    </div>
  );
}
