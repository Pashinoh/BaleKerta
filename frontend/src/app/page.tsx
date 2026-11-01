"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/layout/Header";
import { Stepper } from "@/components/layout/Stepper";
import { GlossaryDrawer } from "@/components/glossary/GlossaryDrawer";
import { MiniZoneGrid } from "@/components/map/MiniZoneGrid";
import { SampleList } from "@/components/plan/SampleList";
import { UploadBox } from "@/components/plan/UploadBox";
import { OrientationPicker } from "@/components/plan/OrientationPicker";
import { PlanCanvas } from "@/components/PlanCanvas";
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
import { DEFAULT_LOCATION } from "@/lib/geo";
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

// Dynamic import for Leaflet map to disable SSR
const KajaMap = dynamic(() => import("@/components/map/KajaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-ink-900 border border-ink-700 rounded-lg flex items-center justify-center text-bone-400 font-mono text-[13px]">
      Memuat peta interaktif Bali...
    </div>
  ),
});

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
        {/* Intro Tagline & Stepper */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-[20px] font-semibold text-bone-100 tracking-tight">
                Pemeriksaan Tata Ruang Adat Bali
              </h1>
              <p className="text-[14px] text-bone-400">
                Verifikasi kepatuhan orientasi Asta Kosala-Kosali dan Asta Bumi sebelum pengajuan PBG.
              </p>
            </div>
          </div>

          {/* 3-Step Stepper */}
          <Stepper
            currentStep={step}
            maxStepReached={maxStepReached}
            onSelectStep={(targetStep) => setStep(targetStep)}
          />
        </div>

        {step === 1 ? (
          /* ========================================================== */
          /* STEP 1: HERO MAP ON TOP, DASHBOARD & CONTROLS BELOW        */
          /* ========================================================== */
          <div className="space-y-6">
            {/* 1. TOP HERO: Full-Width Interactive Map */}
            <div className="bg-ink-900 border border-ink-700 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-ink-800">
                <div>
                  <h2 className="text-[17px] font-semibold text-bone-100 flex items-center gap-2">
                    <span>1. Peta Interaktif Penentuan Titik Tapak & Arah Kaja</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ink-800 border border-ink-700 text-bone-300">
                      Batas Wilayah Bali
                    </span>
                  </h2>
                  <p className="text-[13px] text-bone-400 mt-0.5">
                    Klik pada daratan Bali atau geser pin untuk menentukan koordinat tapak tanah Anda. Arah suci (<em>Kaja</em>) dihitung instan mengarah lurus ke puncak Gunung Agung.
                  </p>
                </div>
              </div>

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

            {/* 2. BOTTOM DASHBOARD: MiniZoneGrid on Left, Geodesic Details & Next Action on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* MiniZoneGrid Card (5 cols) */}
              <div className="lg:col-span-5 bg-ink-900 border border-ink-700 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                    <h3 className="text-[15px] font-semibold text-bone-100">
                      Orientasi 9 Zona Sanga Mandala
                    </h3>
                    <span className="text-[12px] font-mono text-clay">
                      {kajaData.cardinal_direction}
                    </span>
                  </div>
                  <p className="text-[12px] text-bone-400 leading-relaxed">
                    Zona suci teratas (<em>Utamaning Utama</em>) berputar otomatis menyesuaikan sudut geodesik tanah Anda menuju Gunung Agung.
                  </p>
                  <MiniZoneGrid
                    bearing={kajaData.bearing_degrees}
                    cardinalDirection={kajaData.cardinal_direction}
                    kajaQuadrant={kajaData.kaja_quadrant}
                    locationLabel={kajaData.location_label}
                  />
                </div>
              </div>

              {/* Geodesic Parameters & Next Step Card (7 cols) */}
              <div className="lg:col-span-7 bg-ink-900 border border-ink-700 rounded-xl p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                    <h3 className="text-[15px] font-semibold text-bone-100">
                      Parameter Spasial Adat Tapak
                    </h3>
                    <span className="text-[11px] font-mono text-bone-400 bg-ink-950 px-2 py-0.5 rounded border border-ink-800">
                      Asta Bumi Geodesic Engine
                    </span>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-ink-950 border border-ink-800 rounded-lg">
                      <span className="text-[11px] text-bone-400 block mb-1">Koordinat Tanah</span>
                      <span className="text-[13px] font-mono font-medium text-bone-100 block">
                        {lat.toFixed(4)}°, {lon.toFixed(4)}°
                      </span>
                      <span className="text-[11px] text-bone-400 mt-1 block truncate">
                        {kajaData.location_label || "Wilayah Bali"}
                      </span>
                    </div>

                    <div className="p-3 bg-ink-950 border border-ink-800 rounded-lg">
                      <span className="text-[11px] text-bone-400 block mb-1">Sudut Geodesik Kaja</span>
                      <span className="text-[15px] font-mono font-semibold text-bone-100 block">
                        {kajaData.bearing_degrees.toFixed(1)}°
                      </span>
                      <span className="text-[11px] text-clay font-medium mt-1 block">
                        Arah {kajaData.cardinal_direction}
                      </span>
                    </div>

                    <div className="p-3 bg-ink-950 border border-ink-800 rounded-lg">
                      <span className="text-[11px] text-bone-400 block mb-1">Jarak ke Gn. Agung</span>
                      <span className="text-[15px] font-mono font-semibold text-bone-100 block">
                        {kajaData.distance_km ? `${kajaData.distance_km.toFixed(1)} km` : "-"}
                      </span>
                      <span className="text-[11px] text-bone-400 mt-1 block">
                        Puncak 3.142 mdpl
                      </span>
                    </div>
                  </div>

                  {/* Cultural rule note */}
                  <div className="p-3.5 bg-ink-950/70 border border-ink-800 rounded-lg text-[13px] text-bone-300 space-y-1">
                    <p className="leading-relaxed">
                      <strong>Ketentuan Tata Ruang Adat:</strong> Posisi suci Kaja bersifat relatif terhadap Gunung Agung. Di Bali Selatan (Denpasar, Badung, Gianyar), Kaja mengarah ke Timur Laut. Di Bali Utara (Buleleng), Kaja mengarah ke Selatan.
                    </p>
                    <p className="text-[12px] text-bone-400">
                      Sistem kami mengunci orientasi ini agar denah bangunan yang diaudit pada Langkah 2 dievaluasi secara akurat.
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
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
                    <span>Lanjut ke Masukkan Denah (Langkah 2)</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* STEP 2 & 3: 2-COLUMN RESPONSIVE WORKSPACE                  */
          /* ========================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL: Plan Canvas (+ Room List on Step 3) */}
            <div className="lg:col-span-7 space-y-4">
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

              {/* On Step 3: Interactive Room List underneath Canvas */}
              {step === 3 && auditData && (
                <div className="p-4 bg-ink-900 border border-ink-700 rounded-lg">
                  <RoomList
                    rooms={auditData.rooms}
                    violations={auditData.audit_report.violations}
                    hoveredIndex={hoveredRoomIndex}
                    selectedIndex={selectedRoomIndex}
                    onHoverRoom={setHoveredRoomIndex}
                    onSelectRoom={setSelectedRoomIndex}
                    onOpenGlossaryDrawer={handleOpenGlossaryWithTerm}
                  />
                </div>
              )}
            </div>

            {/* RIGHT PANEL: ACTIVE STEP CONTROLS (Step 2 or Step 3) */}
            <div className="lg:col-span-5 space-y-5">

            {/* -------------------------------------------------------- */}
            {/* STEP 2: MASUKKAN DENAH CONTROLS                          */}
            {/* -------------------------------------------------------- */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-[17px] font-semibold text-bone-100">
                    2. Masukkan Denah Bangunan
                  </h2>
                  <p className="text-[13px] text-bone-400 leading-relaxed">
                    Gunakan denah contoh terkalibrasi untuk pengujian instan, atau unggah
                    gambar denah arsitektur Anda untuk dibaca oleh model AI.
                  </p>
                </div>

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
                  className="w-full justify-center"
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

                {/* Orientation Picker */}
                <div className="p-3.5 bg-ink-900 border border-ink-700 rounded-lg">
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

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
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
            )}

            {/* -------------------------------------------------------- */}
            {/* STEP 3: HASIL AUDIT KEPATUHAN                            */}
            {/* -------------------------------------------------------- */}
            {step === 3 && auditData && (
              <div className="space-y-5">
                {/* Source Data Provenance Banner */}
                <SourceBanner
                  source={auditData.source}
                  model={auditData.model}
                />

                {/* Verdict Summary Card */}
                <Verdict
                  report={auditData.audit_report}
                  onPrintReport={() => setIsReportOpen(true)}
                />

                {/* Issues List (Violations) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-ink-700">
                    <span className="text-[14px] font-semibold text-bone-100">
                      Catatan Perbaikan Ruang ({auditData.audit_report.violations.length})
                    </span>
                    <span className="text-[12px] text-bone-400 font-mono">
                      Asta Kosala-Kosali
                    </span>
                  </div>

                  {auditData.audit_report.violations.length === 0 ? (
                    <div className="p-6 text-center text-bone-400 border border-ink-700 rounded-lg bg-ink-900 space-y-1">
                      <CheckCircle2 size={24} className="text-bone-100 mx-auto mb-1" />
                      <p className="text-[14px] font-medium text-bone-100">
                        Tidak ditemukan pelanggaran tata letak.
                      </p>
                      <p className="text-[12px] text-bone-400">
                        Seluruh ruangan memenuhi hierarki kesucian zona Sanga Mandala.
                      </p>
                    </div>
                  ) : (
                    auditData.audit_report.violations.map((violation, i) => (
                      <IssueCard
                        key={violation.id || i}
                        violation={violation}
                        index={i}
                        onFocusRoom={() => {
                          // Find room index in rooms array to highlight
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
                    ))
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
                          className="flex items-start gap-2 p-2 bg-ink-950 rounded border border-ink-700/60"
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

                {/* Footer Navigation Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setStep(2)}
                    icon={<ArrowLeft size={15} />}
                  >
                    Ganti Denah
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setStep(1)}
                  >
                    Ubah Lokasi Tanah
                  </Button>
                </div>
              </div>
            )}
          </div>
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
