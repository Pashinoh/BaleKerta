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
import { AlertCircle } from "lucide-react";

export interface KajaMapProps {
  lat: number;
  lon: number;
  bearing?: number;
  cardinalDirection: string;
  distanceKm?: number;
  onChangeLocation: (lat: number, lon: number) => void;
  className?: string;
}

// Custom SVG DivIcon for Draggable Plot Pin (Architectural Bone & Ink) — straight-down teardrop
const createPlotIcon = () =>
  L.divIcon({
    className: "custom-plot-pin",
    html: `
      <div role="button" aria-label="Tanah Anda (Geser pin)" style="
        display: flex; flex-direction: column; align-items: center;
      ">
        <svg width="36" height="44" viewBox="0 0 36 44" style="filter: drop-shadow(0 4px 14px rgba(0,0,0,0.7));">
          <!-- Teardrop body: Bone fill, Ink stroke -->
          <path d="M18 0 C8 0 0 18 0 18 C0 36 18 44 18 44 S36 36 36 18 C36 0 28 0 18 0 Z"
                fill="#EDE7DA" stroke="#0E0D0C" stroke-width="2"/>
          <!-- Center dot: Ink -->
          <circle cx="18" cy="18" r="6" fill="#0E0D0C"/>
        </svg>
        <!-- Shadow ellipse -->
        <div style="width:12px;height:4px;background:rgba(0,0,0,0.6);border-radius:50%;margin-top:2px;"></div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],  // tip = coordinate
  });

// Custom SVG DivIcon for Mount Agung Summit (Architectural Landmark)
const createAgungIcon = () =>
  L.divIcon({
    className: "custom-agung-pin",
    html: `
      <div role="button" aria-label="Gunung Agung (Titik Suci Kaja)" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -50%);
      ">
        <div style="
          width: 30px;
          height: 30px;
          background-color: #1D1A17;
          border: 1.5px solid #EDE7DA;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.8);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EDE7DA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
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

  // Midpoint between Plot and Mount Agung for the bearing tooltip
  const midpoint = useMemo(() => {
    return [(lat + MOUNT_AGUNG.lat) / 2, (lon + MOUNT_AGUNG.lon) / 2] as [number, number];
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
        className="relative w-full h-[400px] sm:h-[460px] lg:h-[490px] rounded-lg overflow-hidden border border-ink-700 bg-ink-950 isolate z-0 shadow-sm"
        style={{ isolation: "isolate" }}
        onClick={() => setScrollActive(true)}
      >
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
          className="w-full h-full dark-map-tiles"
        >
          {/* OpenStreetMap with Dark Theme Filter */}
          <TileLayer
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
              className="bg-ink-950 text-bone-100 border border-ink-700 rounded text-[11px] font-sans font-medium px-2 py-0.5"
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
              className="bg-ink-950 text-bone-100 border border-ink-700 rounded text-[11px] font-sans font-medium px-2 py-0.5"
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
              color: "#EDE7DA",
              weight: 2,
              dashArray: "5, 6",
              opacity: 0.9,
            }}
          >
            <Tooltip
              position={midpoint}
              direction="center"
              permanent
              className="bg-ink-950/95 text-bone-100 border border-ink-700 rounded px-2.5 py-0.5 text-[12px] font-mono shadow-md"
            >
              Kaja: {cardinalDirection}
            </Tooltip>
          </Polyline>
        </MapContainer>

        {/* Floating Instruction overlay */}
        <div className="absolute bottom-3 left-3 z-[10] pointer-events-none">
          <div className="bg-ink-950/90 border border-ink-700 rounded px-3 py-1 text-[11px] font-mono text-bone-400">
            Klik peta atau geser pin untuk menetapkan titik koordinat
          </div>
        </div>
      </div>
    </div>
  );
}
