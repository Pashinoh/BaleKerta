export interface ZoneCell {
  row: number;
  col: number;
  zone_id: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  center: [number, number];
}

export interface GridLayout {
  kaja_quadrant: string;
  plan_north_deg?: number;
  sacred_row_col?: [number, number];
  grid_matrix: string[][];
  cells: ZoneCell[];
}

export interface KajaVector {
  location: string;
  latitude: number;
  longitude: number;
  in_bali?: boolean;
  distance_km?: number;
  mount_agung_target: {
    lat: number;
    lon: number;
  };
  bearing_degrees: number;
  cardinal_direction: string;
  kaja_quadrant: string;
  kaja_side?: string;
  note?: string;
}

export interface KajaGeoResponse {
  latitude: number;
  longitude: number;
  in_bali: boolean;
  bearing_degrees: number;
  cardinal_direction: string;
  kaja_quadrant: string;
  distance_km: number;
  location_label: string;
  target: {
    lat: number;
    lon: number;
    label?: string;
  };
  message: string;
}

export interface RoomZoneInfo {
  zone_id: string;
  zone_name?: string;
  row?: number;
  col?: number;
  grid_row?: number;
  grid_col?: number;
  box?: [number, number, number, number];
  center?: [number, number];
  centroid?: [number, number];
}

export interface Room {
  name: string;
  type: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
  zone?: RoomZoneInfo;
}

export interface Violation {
  id: string;
  rule_id?: string;
  verified?: boolean;
  room_name: string;
  room_type: string;
  box: [number, number, number, number];
  zone_id: string;
  zone_name: string;
  severity: "CRITICAL" | "WARNING" | "ADVISORY";
  issue: string;
  recommendation: string;
  legal_reference: string;
}

export interface Compliance {
  rule_id?: string;
  verified?: boolean;
  room_name: string;
  zone_name: string;
  detail: string;
}

export interface AuditReport {
  compliance_score: number;
  status_label: string;
  status_color: "green" | "yellow" | "red";
  kdb_percentage: number;
  kdb_status: string;
  violations_count: number;
  violations: Violation[];
  compliances: Compliance[];
}

export interface AuditResponse {
  status: string;
  source?: string;
  model?: string;
  image_hash?: string;
  mode?: string;
  preset_id?: string;
  title?: string;
  kaja_vector: KajaVector;
  grid_layout: GridLayout;
  rooms: Room[];
  audit_report: AuditReport;
}

export interface PresetSummary {
  id: string;
  title: string;
  regency: string;
  description: string;
  expected_status: string;
}
