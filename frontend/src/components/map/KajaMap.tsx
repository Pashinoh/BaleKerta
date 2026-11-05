"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MOUNT_AGUNG, isInBali } from "@/lib/geo";
import { AlertCircle, X } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

export interface KajaMapProps {
  lat: number;
  lon: number;
  bearing: number;
  cardinalDirection: string;
  distanceKm?: number;
  onChangeLocation: (lat: number, lon: number) => void;
  className?: string;
}

const BALI_BOUNDS: L.LatLngBoundsExpression = [
  [-8.95, 114.35],
  [-7.95, 115.80],
];

const getUserPinIcon = (isLight: boolean) =>
  new L.DivIcon({
    className: "balekerta-custom-marker",
    html: `<div style="width: 30px; height: 40px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,${isLight ? "0.22" : "0.5"}));">
      <svg width="30" height="40" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1.5C8.00883 1.5 1.5 8.00883 1.5 16C1.5 26.25 16 40.5 16 40.5C16 40.5 30.5 26.25 30.5 16C30.5 8.00883 23.9912 1.5 16 1.5Z" fill="#D9532F" stroke="${isLight ? "#FAF6EE" : "#181512"}" stroke-width="2.5"/>
        <circle cx="16" cy="15.5" r="5.5" fill="#FAF6EE" stroke="#181512" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });

const getGunungAgungIcon = (isLight: boolean) =>
  new L.DivIcon({
    className: "balekerta-custom-marker",
    html: `<div style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,${isLight ? "0.18" : "0.5"}));">
      <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="32" height="32" rx="8" fill="${isLight ? "#FAF6EE" : "#181512"}" stroke="${isLight ? "#1C1916" : "#EFECE6"}" stroke-width="2"/>
        <path d="M18 8L28 26H8L18 8Z" fill="${isLight ? "#1C1916" : "#EFECE6"}"/>
        <path d="M18 13L22.5 21H13.5L18 13Z" fill="#D9532F"/>
      </svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

function MapEvents({
  onSelect,
  onOutOfBounds,
}: {
  onSelect: (lat: number, lon: number) => void;
  onOutOfBounds: () => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (isInBali(lat, lng)) {
        onSelect(lat, lng);
      } else {
        onOutOfBounds();
      }
    },
  });
  return null;
}

function MapFlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lon], { animate: true, duration: 0.4 });
  }, [lat, lon, map]);
  return null;
}

export const KajaMap: React.FC<KajaMapProps> = ({
  lat,
  lon,
  cardinalDirection,
  onChangeLocation,
  className = "",
}) => {
  const { theme } = useTheme();
  const [outOfBoundsNotice, setOutOfBoundsNotice] = useState(false);

  const isLight = theme === "light";

  useEffect(() => {
    if (!outOfBoundsNotice) return;
    const t = setTimeout(() => setOutOfBoundsNotice(false), 4000);
    return () => clearTimeout(t);
  }, [outOfBoundsNotice]);

  const userPosition: [number, number] = [lat, lon];
  const agungPosition: [number, number] = [MOUNT_AGUNG.lat, MOUNT_AGUNG.lon];
  const midLat = (lat + MOUNT_AGUNG.lat) / 2;
  const midLon = (lon + MOUNT_AGUNG.lon) / 2;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {outOfBoundsNotice && (
        <div
          role="alert"
          className="flex items-center justify-between p-3 bg-ink-900 border border-clay/60 text-clay rounded-lg text-[13px]"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>
              <strong>Batas Wilayah Bali:</strong> Silakan klik area daratan di dalam wilayah Pulau Bali.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOutOfBoundsNotice(false)}
            className="min-w-[32px] min-h-[32px] flex items-center justify-center text-bone-400 hover:text-bone-100 rounded transition-colors"
            aria-label="Tutup peringatan batas wilayah"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Map Frame */}
      <div
        className={`relative w-full h-[420px] sm:h-[450px] rounded-xl overflow-hidden border border-ink-800 ${
          isLight
            ? "light-map-theme bg-[#CFC8B8]"
            : "dark-map-theme bg-[#1A1C1E]"
        }`}
      >
        <MapContainer
          center={[-8.48, 115.22]}
          zoom={10}
          minZoom={9}
          maxZoom={18}
          maxBounds={BALI_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          className="w-full h-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents
            onSelect={(newLat, newLon) => {
              setOutOfBoundsNotice(false);
              onChangeLocation(newLat, newLon);
            }}
            onOutOfBounds={() => setOutOfBoundsNotice(true)}
          />
          <MapFlyTo lat={lat} lon={lon} />

          {/* User Site Marker */}
          <Marker
            position={userPosition}
            icon={getUserPinIcon(isLight)}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                if (isInBali(pos.lat, pos.lng)) {
                  setOutOfBoundsNotice(false);
                  onChangeLocation(pos.lat, pos.lng);
                } else {
                  setOutOfBoundsNotice(true);
                  marker.setLatLng(userPosition);
                }
              },
            }}
          >
            <Tooltip
              direction="bottom"
              offset={[0, 8]}
              opacity={1}
              permanent
              className="balekerta-map-tooltip"
            >
              Tapak Anda
            </Tooltip>
          </Marker>

          {/* Gunung Agung Marker */}
          <Marker position={agungPosition} icon={getGunungAgungIcon(isLight)}>
            <Tooltip
              direction="top"
              offset={[0, -18]}
              opacity={1}
              permanent
              className="balekerta-map-tooltip"
            >
              Gunung Agung (Kaja)
            </Tooltip>
          </Marker>

          {/* Kaja Vector Line */}
          <Polyline
            positions={[userPosition, agungPosition]}
            pathOptions={{
              color: isLight ? "#B84322" : "#EFECE6",
              weight: 2.5,
              dashArray: "6, 6",
              opacity: 0.9,
            }}
          />

          {/* Midpoint Bearing Label */}
          <Marker
            position={[midLat, midLon]}
            icon={
              new L.DivIcon({
                className: "balekerta-custom-marker",
                html: `<div style="width:1px;height:1px;"></div>`,
              })
            }
          >
            <Tooltip
              direction="center"
              permanent
              opacity={1}
              className="balekerta-map-tooltip balekerta-bearing-tooltip"
            >
              Kaja: {cardinalDirection}
            </Tooltip>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default KajaMap;
