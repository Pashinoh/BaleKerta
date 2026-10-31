import {
  AuditResponse,
  PresetSummary,
  KajaGeoResponse,
} from "@/types/audit";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export class ApiError extends Error {
  statusCode: number;
  errorType?: string;
  retryAfterS?: number;

  constructor(message: string, statusCode: number, errorType?: string, retryAfterS?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.retryAfterS = retryAfterS;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getKaja(lat: number, lon: number): Promise<KajaGeoResponse> {
  const url = `${BACKEND_URL}/api/kaja?lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError("Gagal menghitung arah Kaja", res.status);
  }
  return await res.json();
}

export async function getPresets(): Promise<PresetSummary[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/presets`);
    if (!res.ok) throw new Error("Gagal mengambil daftar denah preset");
    return await res.json();
  } catch (error) {
    console.error("Presets fetch error:", error);
    return [];
  }
}

export async function runPresetAudit(
  presetId: string,
  lat?: number,
  lon?: number,
  planNorthDeg: number = 0
): Promise<AuditResponse> {
  let url = `${BACKEND_URL}/api/presets/${presetId}?plan_north_deg=${planNorthDeg}`;
  if (typeof lat === "number" && typeof lon === "number") {
    url += `&lat=${lat}&lon=${lon}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new ApiError(
      errData.detail || errData.message || "Gagal memproses audit denah preset",
      res.status
    );
  }
  return await res.json();
}

export async function auditUploadedFloorPlan(
  file: File,
  regencyOrOptions?:
    | string
    | {
        lat?: number;
        lon?: number;
        planNorthDeg?: number;
        regency?: string;
      },
  legacyHastaCm?: number
): Promise<AuditResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (typeof regencyOrOptions === "string") {
    formData.append("regency", regencyOrOptions);
    if (typeof legacyHastaCm === "number") {
      formData.append("hasta_cm", legacyHastaCm.toString());
    }
  } else if (regencyOrOptions && typeof regencyOrOptions === "object") {
    if (regencyOrOptions.regency) formData.append("regency", regencyOrOptions.regency);
    if (typeof regencyOrOptions.lat === "number") formData.append("lat", regencyOrOptions.lat.toString());
    if (typeof regencyOrOptions.lon === "number") formData.append("lon", regencyOrOptions.lon.toString());
    if (typeof regencyOrOptions.planNorthDeg === "number") {
      formData.append("plan_north_deg", regencyOrOptions.planNorthDeg.toString());
    }
  }

  const res = await fetch(`${BACKEND_URL}/api/audit`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message =
      errData.message ||
      errData.detail ||
      `Audit gagal: Layanan mengembalikan status ${res.status}`;
    throw new ApiError(message, res.status, errData.error, errData.retry_after_s);
  }

  return await res.json();
}
