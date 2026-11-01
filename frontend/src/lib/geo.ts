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
  lat: number;
  lon: number;
  desc: string;
}

export const BALI_QUICK_LOCATIONS: QuickLocation[] = [
  { id: "denpasar", name: "Denpasar", lat: -8.6705, lon: 115.2126, desc: "Bali Selatan · Kaja Timur Laut" },
  { id: "badung", name: "Badung (Canggu/Kuta)", lat: -8.5833, lon: 115.1667, desc: "Bali Selatan · Kaja Timur Laut" },
  { id: "gianyar", name: "Gianyar (Ubud)", lat: -8.5069, lon: 115.2625, desc: "Bali Tengah · Kaja Timur Laut" },
  { id: "buleleng", name: "Singaraja (Buleleng)", lat: -8.1120, lon: 115.0882, desc: "Bali Utara · Kaja Tenggara" },
  { id: "tabanan", name: "Tabanan", lat: -8.5414, lon: 115.1252, desc: "Bali Barat-Tengah · Kaja Timur Laut" },
  { id: "karangasem", name: "Karangasem", lat: -8.4619, lon: 115.6122, desc: "Lereng Timur · Kaja Barat Laut" },
  { id: "jembrana", name: "Jembrana (Negara)", lat: -8.3585, lon: 114.6176, desc: "Bali Barat · Kaja Timur" },
  { id: "bangli", name: "Bangli (Kintamani)", lat: -8.4539, lon: 115.3547, desc: "Ketinggian · Kaja Timur" },
  { id: "klungkung", name: "Klungkung", lat: -8.5350, lon: 115.4039, desc: "Bali Timur-Selatan · Kaja Utara" },
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
