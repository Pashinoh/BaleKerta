"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MOUNT_AGUNG,
  isInBali,
} from "@/lib/geo";
import { AlertCircle, Moon, Sun } from "lucide-react";

export interface KajaMapProps {
  lat: number;
  lon: number;
  bearing?: number;
  cardinalDirection: string;
  distanceKm?: number;
  onChangeLocation: (lat: number, lon: number) => void;
  className?: string;
}

// Custom SVG DivIcon for Draggable Plot Pin (Terracotta & Bone Architectural Needle)
const createPlotIcon = () =>
  L.divIcon({
    className: "custom-plot-pin",
    html: `
      <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center; pointer-events: auto; cursor: grab;">
        <!-- Glowing Pulse Ring anchored at tip -->
        <div style="
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 6px;
          background: rgba(210, 96, 63, 0.45);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(210, 96, 63, 0.7);
        "></div>
        <!-- Architectural Pin Needle -->
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.65));">
          <!-- Teardrop Pin Body (Clay Accent with Ink Outline) -->
          <path d="M17 1C8.71573 1 2 7.71573 2 16C2 26.5 15.1 41.3 16.3 42.6C16.7 43.1 17.3 43.1 17.7 42.6C18.9 41.3 32 26.5 32 16C32 7.71573 25.2843 1 17 1Z"
                fill="#D2603F" stroke="#0E0D0C" stroke-width="2" stroke-linejoin="round"/>
          <!-- Inner Concentric Ring (Bone) -->
          <circle cx="17" cy="16" r="7.5" fill="#EDE7DA" stroke="#0E0D0C" stroke-width="1.5"/>
          <!-- Core Target Dot (Ink) -->
          <circle cx="17" cy="16" r="3.5" fill="#0E0D0C"/>
        </svg>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 43], // Needle tip touches coordinate exactly
    tooltipAnchor: [0, 4],
  });

// Custom SVG DivIcon for Mount Agung Summit (Sacred Peak Landmark)
const createAgungIcon = () =>
  L.divIcon({
    className: "custom-agung-pin",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <!-- Sacred Peak Badge -->
        <div style="
          width: 32px;
          height: 32px;
          background-color: #1A1815;
          border: 2px solid #EDE7DA;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.75);
        ">
          <!-- Mountain Peak Icon -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDE7DA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    tooltipAnchor: [0, -18],
  });

// Map Controller to handle clicks & pan
function MapEventHandler({
  onLocationSelect,
  onError,
}: {
  onLocationSelect: (lat: number, lon: number) => void;
  onError: (msg: string | null) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (!isInBali(lat, lng)) {
        onError(
          "Batas Wilayah Bali: Pilihan dibatasi hanya di dalam wilayah Pulau Bali. Silakan klik area daratan di dalam Pulau Bali."
        );
        return;
      }
      onError(null);
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Controller to smoothly pan when the location (lat/lon) changes
function MapPanController({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lon], { animate: true, duration: 0.4 });
  }, [lat, lon, map]);
  return null;
}

export default function KajaMap({
  lat,
  lon,
  cardinalDirection,
  onChangeLocation,
  className = "",
}: KajaMapProps) {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [scrollActive, setScrollActive] = useState(false);
  const markerRef = useRef<L.Marker>(null);

  // Map theme state: "dark" (default) or "light" (parchment - non glaring)
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("balekerta_map_theme");
      if (saved === "light" || saved === "dark") {
        setMapTheme(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleThemeToggle = (theme: "dark" | "light") => {
    setMapTheme(theme);
    try {
      localStorage.setItem("balekerta_map_theme", theme);
    } catch {
      // ignore
    }
  };

  // Midpoint between Plot and Mount Agung for the bearing tooltip
  const midpoint = useMemo(() => {
    return [(lat + MOUNT_AGUNG.lat) / 2, (lon + MOUNT_AGUNG.lon) / 2] as [number, number];
  }, [lat, lon]);

  // Sync marker position if lat / lon props change externally (dropdown / GPS)
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    }
  }, [lat, lon]);

  // Handle pin drag
  const onDragEnd = useMemo(
    () => () => {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        if (!isInBali(newPos.lat, newPos.lng)) {
          marker.setLatLng([lat, lon]);
          setGeoError(
            "Batas Wilayah Bali: Pin tidak dapat ditempatkan di luar wilayah Pulau Bali. Posisi pin dikembalikan ke titik sebelumnya."
          );
          return;
        }
        setGeoError(null);
        onChangeLocation(newPos.lat, newPos.lng);
      }
    },
    [lat, lon, onChangeLocation]
  );

  return (
    <div className={`flex flex-col space-y-2.5 ${className}`}>
      {/* Out of Bali warning alert */}
      {geoError && (
        <div className="flex items-center justify-between p-3 bg-ink-900 border border-clay text-clay rounded-md text-[13px]">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-clay" />
            <span>{geoError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeoError(null)}
            className="text-bone-400 hover:text-bone-100 text-xs px-2 py-0.5 rounded border border-ink-700 hover:bg-ink-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 
        Interactive Leaflet Map Canvas
        Isolate stacking context to NEVER bleed through sticky Header (z-[100]) or dock 
      */}
      <div
        className={`relative w-full h-[400px] sm:h-[460px] lg:h-[490px] rounded-lg overflow-hidden border border-ink-700 isolate z-0 shadow-sm transition-colors ${
          mapTheme === "light" ? "bg-[#F8F9FA] light-map-theme" : "bg-ink-950 dark-map-theme"
        }`}
        style={{ isolation: "isolate" }}
        onClick={() => setScrollActive(true)}
      >
        {/* Floating Theme Switcher Toggle (Gelap / Terang Lembut) */}
        <div className="absolute top-3 right-3 z-[500] flex items-center bg-ink-950/95 backdrop-blur-md border border-ink-700 rounded-lg p-1 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleThemeToggle("dark");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono rounded-md transition-all cursor-pointer ${
              mapTheme === "dark"
                ? "bg-ink-800 text-bone-100 border border-ink-500 shadow-sm font-semibold"
                : "text-bone-400 hover:text-bone-100 hover:bg-ink-900"
            }`}
            title="Mode Peta Gelap (Ink Dark)"
          >
            <Moon size={13} className={mapTheme === "dark" ? "text-bone-100" : "text-bone-400"} />
            <span>Gelap</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleThemeToggle("light");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono rounded-md transition-all cursor-pointer ${
              mapTheme === "light"
                ? "bg-bone-100 text-ink-950 border border-bone-300 font-bold shadow-sm"
                : "text-bone-400 hover:text-bone-100 hover:bg-ink-900"
            }`}
            title="Mode Peta Terang Lembut (Parchment - Muted Warm, Bebas Silau)"
          >
            <Sun size={13} className={mapTheme === "light" ? "text-ink-950" : "text-bone-400"} />
            <span>Terang</span>
          </button>
        </div>

        <MapContainer
          center={[lat, lon]}
          zoom={10}
          minZoom={9}
          maxZoom={16}
          scrollWheelZoom={scrollActive}
          maxBounds={[
            [-9.50, 113.50],
            [-7.50, 116.60],
          ]}
          className="w-full h-full"
        >
          {/* OpenStreetMap Layer (Filter dikontrol penuh oleh tema parent) */}
          <TileLayer
            key={mapTheme}
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          />

          <MapPanController lat={lat} lon={lon} />
          <MapEventHandler
            onLocationSelect={(newLat, newLon) => {
              setGeoError(null);
              onChangeLocation(newLat, newLon);
            }}
            onError={(err) => setGeoError(err)}
          />

          {/* Mount Agung Summit Marker */}
          <Marker
            position={[MOUNT_AGUNG.lat, MOUNT_AGUNG.lon]}
            icon={createAgungIcon()}
          >
            <Tooltip
              direction="top"
              offset={[0, -16]}
              opacity={1}
              permanent
              className="text-[11px] font-sans font-medium px-2 py-0.5"
            >
              Gunung Agung (Titik Suci Kaja)
            </Tooltip>
          </Marker>

          {/* User Land Plot Pin (Draggable) */}
          <Marker
            position={[lat, lon]}
            draggable={true}
            eventHandlers={{ dragend: onDragEnd }}
            ref={markerRef}
            icon={createPlotIcon()}
          >
            <Tooltip
              direction="bottom"
              offset={[0, 8]}
              opacity={1}
              permanent
              className="text-[11px] font-sans font-medium px-2 py-0.5"
            >
              Tanah Anda (Geser pin)
            </Tooltip>
          </Marker>

          {/* Azimuth Ray to Mount Agung */}
          <Polyline
            positions={[
              [lat, lon],
              [MOUNT_AGUNG.lat, MOUNT_AGUNG.lon],
            ]}
            pathOptions={{
              color: mapTheme === "light" ? "#C85A38" : "#EDE7DA",
              weight: 2.5,
              dashArray: "6, 6",
              opacity: 0.95,
            }}
          >
            <Tooltip
              position={midpoint}
              direction="center"
              permanent
              className="px-2.5 py-0.5 text-[12px] font-mono shadow-md"
            >
              Kaja: {cardinalDirection}
            </Tooltip>
          </Polyline>
        </MapContainer>

        {/* Floating Instruction overlay */}
        <div className="absolute bottom-3 left-3 z-[400] pointer-events-none">
          <div className="bg-ink-950/90 backdrop-blur-sm border border-ink-700 rounded px-3 py-1 text-[11px] font-mono text-bone-400 shadow-sm">
            Klik peta atau geser pin untuk menetapkan titik koordinat
          </div>
        </div>
      </div>
    </div>
  );
}
