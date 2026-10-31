import { AuditResponse, PresetSummary, KajaVector } from "@/types/audit";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getRegencies(): Promise<Record<string, KajaVector>> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/regencies`);
    if (!res.ok) throw new Error("Gagal mengambil data wilayah kabupaten");
    return await res.json();
  } catch (error) {
    console.error("Regencies fetch error:", error);
    return {};
  }
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

export async function runPresetAudit(presetId: string): Promise<AuditResponse> {
  const res = await fetch(`${BACKEND_URL}/api/presets/${presetId}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Gagal memproses audit denah preset");
  }
  return await res.json();
}

export async function auditUploadedFloorPlan(
  file: File,
  regency: string = "denpasar",
  hastaCm: number = 45.0
): Promise<AuditResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("regency", regency);
  formData.append("hasta_cm", hastaCm.toString());

  const res = await fetch(`${BACKEND_URL}/api/audit`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Audit gagal: Server mengembalikan kode ${res.status}`);
  }

  return await res.json();
}
