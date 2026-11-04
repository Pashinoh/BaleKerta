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
  bearing: number;
  cardinalDirection: string;
  distanceKm?: number;
  onChangeLocation: (lat: number, lon: number) => void;
  className?: string;
}

// Custom SVG DivIcon for Draggable Plot Pin
const createPlotIcon = () =>
  L.divIcon({
    className: "custom-plot-pin",
    html: `
      <div role="button" aria-label="Tanah Anda (Geser pin)" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 40px;
          height: 40px;
          background-color: #EDE7DA;
          border: 2px solid #0E0D0C;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          ring: 4px;
          box-shadow: 0 0 0 4px rgba(237, 231, 218, 0.4), 0 4px 12px rgba(0,0,0,0.6);
        ">
          <div style="
            width: 12px;
            height: 12px;
            background-color: #0E0D0C;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          width: 12px;
          height: 5px;
          background-color: rgba(0,0,0,0.5);
          border-radius: 50%;
          margin-top: 2px;
        "></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });

// Custom SVG DivIcon for Mount Agung Summit
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
          width: 32px;
          height: 32px;
          background-color: #151311;
          border: 2px solid #EDE7DA;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.7);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDE7DA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
    map.panTo([lat, lon], { animate: true, duration: 0.5 });
  }, [lat, lon, map]);
  return null;
}

export default function KajaMap({
  lat,
  lon,
  bearing,
  cardinalDirection,
  distanceKm,
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
          // Snap back to previous valid position
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
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Out of Bali warning alert */}
      {geoError && (
        <div className="flex items-center justify-between p-3 bg-ink-900 border border-clay text-clay rounded-md text-[13px] animate-fadeIn">
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

      {/* Interactive Leaflet Map Canvas */}
      <div
        className="relative w-full h-[420px] sm:h-[480px] lg:h-[520px] rounded-lg overflow-hidden border border-ink-700 bg-ink-950"
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
              offset={[0, -18]}
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
              offset={[0, 10]}
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
              dashArray: "6, 8",
              opacity: 0.85,
            }}
          >
            <Tooltip
              position={midpoint}
              direction="center"
              permanent
              className="bg-ink-950/95 text-bone-100 border border-ink-700 rounded px-2.5 py-1 text-[12px] font-mono shadow-lg"
            >
              Kaja: {cardinalDirection} · {bearing.toFixed(1)}°
              {distanceKm ? ` (${distanceKm.toFixed(1)} km)` : ""}
            </Tooltip>
          </Polyline>
        </MapContainer>

        {/* Floating Instruction overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
          <div className="bg-ink-950/90 border border-ink-700 rounded px-3 py-1.5 text-[12px] text-bone-400">
            Klik peta atau seret pin untuk menentukan lokasi tanah
          </div>
        </div>
      </div>
    </div>
  );
}
