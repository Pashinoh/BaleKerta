"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  BALI_QUICK_LOCATIONS,
  parseCoordinateInput,
  isInBali,
} from "@/lib/geo";
import { Search, MapPin, Navigation, ChevronDown, X, AlertCircle } from "lucide-react";

export interface LocationSearchBoxProps {
  lat: number;
  lon: number;
  hasPin: boolean;
  onSelectLocation: (lat: number, lon: number) => void;
  className?: string;
}

export const LocationSearchBox: React.FC<LocationSearchBoxProps> = ({
  lat,
  lon,
  hasPin,
  onSelectLocation,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matchedPreset = useMemo(() => {
    if (!hasPin) return null;
    return BALI_QUICK_LOCATIONS.find(
      (loc) => Math.abs(loc.lat - lat) < 0.02 && Math.abs(loc.lon - lon) < 0.02
    );
  }, [lat, lon, hasPin]);

  const parsedCoord = useMemo(() => parseCoordinateInput(query), [query]);
  const isCoordValidBali = useMemo(
    () => (parsedCoord ? isInBali(parsedCoord.lat, parsedCoord.lon) : false),
    [parsedCoord]
  );

  const filteredLocations = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return BALI_QUICK_LOCATIONS;
    return BALI_QUICK_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.regency.toLowerCase().includes(q) ||
        loc.desc.toLowerCase().includes(q) ||
        `${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}`.includes(q)
    );
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleApplyCoord = () => {
    if (parsedCoord && isCoordValidBali) {
      onSelectLocation(parsedCoord.lat, parsedCoord.lon);
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="min-h-[36px] w-full sm:w-[290px] px-3 py-1.5 rounded-lg bg-ink-950 border border-ink-700 hover:border-bone-400 text-left flex items-center justify-between gap-2 text-[12.5px] transition-colors"
      >
        <span className="flex items-center gap-2 truncate">
          <Search size={13.5} className="text-bone-400 shrink-0" />
          <span className={hasPin ? "text-bone-100 font-medium truncate" : "text-bone-400 truncate"}>
            {hasPin
              ? matchedPreset
                ? matchedPreset.name
                : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
              : "Cari Wilayah / Ketik Koordinat..."}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-bone-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-[330px] sm:w-[370px] bg-ink-900 border border-ink-700 rounded-xl shadow-2xl z-40 overflow-hidden">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-ink-800 bg-ink-950">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-bone-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (parsedCoord && isCoordValidBali) {
                      handleApplyCoord();
                    } else if (filteredLocations.length > 0) {
                      onSelectLocation(filteredLocations[0].lat, filteredLocations[0].lon);
                      setIsOpen(false);
                      setQuery("");
                    }
                  }
                }}
                placeholder="Cari kabupaten/daerah atau -8.5069, 115.2625"
                className="w-full min-h-[36px] pl-8 pr-8 py-1.5 rounded-lg bg-ink-900 border border-ink-700 text-[12.5px] text-bone-100 placeholder:text-bone-400/70 focus:outline-none focus:border-bone-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2 text-bone-400 hover:text-bone-100"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <span className="text-[10.5px] font-mono text-bone-400 mt-1.5 block px-0.5">
              Ketik nama wilayah (Ubud, Canggu, Denpasar) atau koordinat (Lat, Lon)
            </span>
          </div>

          {/* Direct Coordinate Option if user typed lat, lon */}
          {parsedCoord && (
            <div className="p-2 border-b border-ink-800 bg-ink-950/60">
              {isCoordValidBali ? (
                <button
                  type="button"
                  onClick={handleApplyCoord}
                  className="w-full p-2.5 rounded-lg bg-bone-100 text-ink-950 hover:bg-bone-200 flex items-center justify-between gap-2 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Navigation size={14} className="shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[12px] font-bold block">
                        Gunakan Koordinat Ini
                      </span>
                      <span className="text-[11px] font-mono block">
                        {parsedCoord.lat.toFixed(4)}° LS, {parsedCoord.lon.toFixed(4)}° BT
                      </span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-ink-950 text-bone-100 shrink-0">
                    Enter ↵
                  </span>
                </button>
              ) : (
                <div className="p-2.5 rounded-lg bg-clay/10 border border-clay/40 text-clay text-[11.5px] flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Koordinat ({parsedCoord.lat.toFixed(3)}, {parsedCoord.lon.toFixed(3)}) berada di luar batas wilayah Pulau Bali.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Scrollable List of Bali Regions */}
          <div className="max-h-[260px] overflow-y-auto divide-y divide-ink-800/70" role="listbox">
            {filteredLocations.length === 0 ? (
              <div className="p-4 text-center text-[12px] text-bone-400">
                Tidak ditemukan wilayah untuk &quot;{query}&quot;. Coba ketik koordinat seperti{" "}
                <span className="font-mono text-bone-200">-8.5069, 115.2625</span>.
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected =
                  hasPin &&
                  Math.abs(loc.lat - lat) < 0.01 &&
                  Math.abs(loc.lon - lon) < 0.01;

                return (
                  <button
                    key={loc.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectLocation(loc.lat, loc.lon);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? "bg-ink-800 text-bone-100"
                        : "hover:bg-ink-850 text-bone-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12.5} className="text-bone-400 shrink-0" />
                        <span className="text-[12.5px] font-semibold text-bone-100 truncate">
                          {loc.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-bone-400 block pl-4 truncate">
                        {loc.desc}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-950 border border-ink-800 text-bone-300 block">
                        {loc.regency}
                      </span>
                      <span className="text-[9.5px] font-mono text-bone-400 mt-0.5 block">
                        {loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
