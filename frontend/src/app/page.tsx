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

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================== */}
          {/* LEFT PANEL: VISUAL (Map on Step 1, Plan Canvas on Step 2 & 3) */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 space-y-4">
            {step === 1 ? (
              /* Step 1 Visual: Leaflet Map */
              <div className="space-y-3">
                <KajaMap
                  lat={lat}
                  lon={lon}
                  bearing={kajaData.bearing_degrees}
                  cardinalDirection={kajaData.cardinal_direction}
                  distanceKm={kajaData.distance_km}
                  onChangeLocation={handleLocationChange}
                />
              </div>
            ) : (
              /* Step 2 & 3 Visual: Plan Canvas + Room List (on Step 3) */
              <div className="space-y-4">
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
            )}
          </div>

          {/* ========================================================== */}
          {/* RIGHT PANEL: ACTIVE STEP CONTROLS                          */}
          {/* ========================================================== */}
          <div className="lg:col-span-5 space-y-5">
            {/* -------------------------------------------------------- */}
            {/* STEP 1: LOKASI TANAH CONTROLS                            */}
            {/* -------------------------------------------------------- */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-[17px] font-semibold text-bone-100">
                    1. Tentukan Titik Lokasi Tanah
                  </h2>
                  <p className="text-[13px] text-bone-400 leading-relaxed">
                    Arah suci (<em>Kaja</em>) dihitung langsung dari koordinat tanah
                    Anda menuju puncak Gunung Agung. Geser pin pada peta atau pilih kabupaten.
                  </p>
                </div>

                {/* Mini 9-Zone Sanga Mandala Compass Grid */}
                <MiniZoneGrid
                  bearing={kajaData.bearing_degrees}
                  cardinalDirection={kajaData.cardinal_direction}
                  kajaQuadrant={kajaData.kaja_quadrant}
                  locationLabel={kajaData.location_label}
                />

                {/* Step 1 Actions */}
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
                    <span>Lanjut ke Masukkan Denah</span>
                  </Button>
                </div>
              </div>
            )}

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
