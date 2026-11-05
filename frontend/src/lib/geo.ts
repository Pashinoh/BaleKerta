export interface LatLon {
  lat: number;
  lon: number;
}

export const BALI_BOUNDS = {
  minLat: -8.95,
  maxLat: -8.05,
  minLon: 114.40,
  maxLon: 115.75,
};

export const MOUNT_AGUNG = {
  lat: -8.3433,
  lon: 115.5071,
  name: "Puncak Gunung Agung (Titik Suci Kaja)",
};

export const DEFAULT_LOCATION = {
  lat: -8.6705,
  lon: 115.2126,
  name: "Kota Denpasar",
};

export interface QuickLocation {
  id: string;
  name: string;
  regency: string;
  lat: number;
  lon: number;
  desc: string;
}

export const BALI_QUICK_LOCATIONS: QuickLocation[] = [
  { id: "denpasar-pusat", name: "Kota Denpasar (Renon / Pusat)", regency: "Kota Denpasar", lat: -8.6705, lon: 115.2126, desc: "Bali Selatan · Kaja Timur Laut" },
  { id: "denpasar-sanur", name: "Sanur (Denpasar Selatan)", regency: "Kota Denpasar", lat: -8.6913, lon: 115.2626, desc: "Pesisir Tenggara · Kaja Utara-Timur Laut" },
  { id: "badung-mangupura", name: "Mangupura / Sempidi (Badung)", regency: "Kab. Badung", lat: -8.6005, lon: 115.1764, desc: "Pusat Pemerintahan Badung" },
  { id: "badung-canggu", name: "Canggu / Kuta Utara (Badung)", regency: "Kab. Badung", lat: -8.6478, lon: 115.1385, desc: "Bali Selatan · Kaja Timur Laut" },
  { id: "badung-kuta", name: "Kuta / Seminyak / Legian (Badung)", regency: "Kab. Badung", lat: -8.7180, lon: 115.1690, desc: "Bali Selatan · Kaja Timur Laut" },
  { id: "badung-jimbaran", name: "Jimbaran / Nusa Dua / Uluwatu (Kuta Selatan)", regency: "Kab. Badung", lat: -8.7908, lon: 115.1628, desc: "Semenanjung Bukit · Kaja Timur Laut" },
  { id: "gianyar-ubud", name: "Ubud / Sukawati (Gianyar)", regency: "Kab. Gianyar", lat: -8.5069, lon: 115.2625, desc: "Bali Tengah · Kaja Timur Laut" },
  { id: "gianyar-kota", name: "Kota Gianyar / Blahbatuh", regency: "Kab. Gianyar", lat: -8.5444, lon: 115.3253, desc: "Bali Tengah · Kaja Utara-Timur Laut" },
  { id: "tabanan-kota", name: "Kota Tabanan / Kediri", regency: "Kab. Tabanan", lat: -8.5414, lon: 115.1252, desc: "Bali Barat-Tengah · Kaja Timur Laut" },
  { id: "tabanan-bedugul", name: "Bedugul / Baturiti (Tabanan)", regency: "Kab. Tabanan", lat: -8.2755, lon: 115.1653, desc: "Dataran Tinggi · Kaja Timur" },
  { id: "buleleng-singaraja", name: "Singaraja / Sukasada (Buleleng)", regency: "Kab. Buleleng", lat: -8.1120, lon: 115.0882, desc: "Bali Utara · Kaja Tenggara" },
  { id: "buleleng-lovina", name: "Lovina / Seririt (Buleleng Barat)", regency: "Kab. Buleleng", lat: -8.1610, lon: 115.0250, desc: "Bali Utara · Kaja Tenggara" },
  { id: "bangli-kota", name: "Kota Bangli / Susut", regency: "Kab. Bangli", lat: -8.4542, lon: 115.3547, desc: "Bali Tengah · Kaja Timur Laut" },
  { id: "bangli-kintamani", name: "Kintamani / Batur (Bangli)", regency: "Kab. Bangli", lat: -8.2415, lon: 115.3260, desc: "Kaldera Kaldera · Kaja Tenggara" },
  { id: "klungkung-semarapura", name: "Semarapura / Dawan (Klungkung)", regency: "Kab. Klungkung", lat: -8.5350, lon: 115.4039, desc: "Bali Timur · Kaja Utara-Timur Laut" },
  { id: "karangasem-amlapura", name: "Amlapura / Candidasa (Karangasem)", regency: "Kab. Karangasem", lat: -8.4619, lon: 115.6122, desc: "Bali Timur · Kaja Barat Laut" },
  { id: "karangasem-rendang", name: "Rendang / Besakih (Karangasem)", regency: "Kab. Karangasem", lat: -8.3742, lon: 115.4508, desc: "Lereng Barat Daya Gn. Agung" },
  { id: "jembrana-negara", name: "Negara / Mendoyo (Jembrana)", regency: "Kab. Jembrana", lat: -8.3585, lon: 114.6176, desc: "Bali Barat · Kaja Timur" },
];

export function isInBali(lat: number, lon: number): boolean {
  return (
    lat >= BALI_BOUNDS.minLat &&
    lat <= BALI_BOUNDS.maxLat &&
    lon >= BALI_BOUNDS.minLon &&
    lon <= BALI_BOUNDS.maxLon
  );
}

export function formatBearing(degrees: number): string {
  const norm = ((degrees % 360) + 360) % 360;
  return `${norm.toFixed(1)}°`;
}

/**
 * Parses a user-entered coordinate string such as:
 * "-8.5069, 115.2625" or "-8.5069 115.2625" or "-8.5069,115.2625"
 */
export function parseCoordinateInput(raw: string): { lat: number; lon: number } | null {
  const cleaned = raw.trim().replace(/[°]/g, "");
  const match = cleaned.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

/**
 * Strips verbose prefix like "Lokasi Tanah (-8.3969, 115.1699) · dekat "
 * so reports and badges show a clean regional name.
 */
export function cleanLocationLabel(label?: string): string {
  if (!label) return "Wilayah Provinsi Bali";
  const DekatMatch = label.split(/dekat\s+/i);
  if (DekatMatch.length > 1 && DekatMatch[1].trim()) {
    return DekatMatch[1].trim();
  }
  return label.replace(/^Lokasi Tanah\s*\([^)]+\)\s*[·-]?\s*/i, "").trim() || label;
}
