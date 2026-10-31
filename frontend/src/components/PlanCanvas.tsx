"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { GridLayout, Room, Violation } from "@/types/audit";
import { Compass, Eye, Grid3X3, Layers } from "lucide-react";

interface PlanCanvasProps {
  imageSrc?: string | null;
  gridLayout?: GridLayout | null;
  rooms: Room[];
  violations: Violation[];
  selectedRoom?: Room | null;
  onSelectRoom?: (room: Room | null) => void;
  kajaBearing?: number;
  kajaDirection?: string;
  regencyName?: string;
}

const ZONE_HUMAN_NAMES: Record<string, string> = {
  UTAMANING_UTAMA: "Utamaning Utama (Suci)",
  MADYANING_UTAMA: "Madyaning Utama",
  NISTANING_UTAMA: "Nistaning Utama",
  UTAMANING_MADYA: "Utamaning Madya",
  MADYANING_MADYA: "Madyaning Madya (Natah)",
  NISTANING_MADYA: "Nistaning Madya",
  UTAMANING_NISTA: "Utamaning Nista",
  MADYANING_NISTA: "Madyaning Nista",
  NISTANING_NISTA: "Nistaning Nista (Teba)"
};

export default function PlanCanvas({
  imageSrc,
  gridLayout,
  rooms,
  violations,
  selectedRoom,
  onSelectRoom,
  kajaBearing = 55.95,
  kajaDirection = "Timur Laut (NE)",
  regencyName = "Gianyar"
}: PlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  
  // Controls
  const [showGrid, setShowGrid] = useState(true);
  const [showRooms, setShowRooms] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      setImageObj(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImageObj(img);
    img.src = imageSrc;
  }, [imageSrc]);

  // Main Draw Function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle HiDPI / Retina displays
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background / Base Floor Plan
    if (imageObj) {
      // Calculate aspect ratio containment
      const hRatio = width / imageObj.width;
      const vRatio = height / imageObj.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (width - imageObj.width * ratio) / 2;
      const centerShiftY = (height - imageObj.height * ratio) / 2;
      ctx.drawImage(
        imageObj,
        0, 0, imageObj.width, imageObj.height,
        centerShiftX, centerShiftY, imageObj.width * ratio, imageObj.height * ratio
      );
    } else {
      // Sleek Architectural Blueprint Grid when no image
      ctx.fillStyle = "#0f172a"; // dark slate
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Blueprint Label
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("[ AREA BIDANG AUDIT TATA RUANG BALI (1000 x 1000) ]", width / 2, height / 2);
    }

    // Helper: Map Normalized (0-1000) coordinates to Canvas Pixel Space
    const toPxX = (normX: number) => (normX / 1000) * width;
    const toPxY = (normY: number) => (normY / 1000) * height;

    // 2. Draw 9 Sanga Mandala Grid Overlay
    if (showGrid && gridLayout && gridLayout.cells) {
      gridLayout.cells.forEach((cell) => {
        const [ymin, xmin, ymax, xmax] = cell.box;
        const cx = toPxX(xmin);
        const cy = toPxY(ymin);
        const cw = toPxX(xmax) - cx;
        const ch = toPxY(ymax) - cy;

        const isUtama = cell.zone_id === "UTAMANING_UTAMA";
        const isNatah = cell.zone_id === "MADYANING_MADYA";
        const isTeba = cell.zone_id === "NISTANING_NISTA";

        // Zone Cell Tint
        if (isUtama) {
          ctx.fillStyle = "rgba(251, 191, 36, 0.08)"; // Soft Amber/Gold
        } else if (isNatah) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.06)"; // Soft Sky/Ether
        } else if (isTeba) {
          ctx.fillStyle = "rgba(148, 163, 184, 0.06)"; // Soft Gray/Slate
        } else {
          ctx.fillStyle = "rgba(241, 245, 249, 0.02)";
        }
        ctx.fillRect(cx, cy, cw, ch);

        // Dashed Grid Lines
        ctx.strokeStyle = isUtama ? "rgba(245, 158, 11, 0.6)" : "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = isUtama ? 2 : 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(cx, cy, cw, ch);
        ctx.setLineDash([]);

        // Zone Title Badge
        ctx.font = isUtama ? "bold 11px sans-serif" : "10px sans-serif";
        ctx.fillStyle = isUtama ? "#f59e0b" : "#94a3b8";
        ctx.textAlign = "center";
        const zoneTitle = ZONE_HUMAN_NAMES[cell.zone_id] || cell.zone_id;
        ctx.fillText(zoneTitle, cx + cw / 2, cy + 22);
      });
    }

    // 3. Draw Detected Rooms and Bounding Boxes
    if (showRooms && rooms) {
      rooms.forEach((room) => {
        const [ymin, xmin, ymax, xmax] = room.box;
        const rx = toPxX(xmin);
        const ry = toPxY(ymin);
        const rw = toPxX(xmax) - rx;
        const rh = toPxY(ymax) - ry;

        // Check if this room has a violation
        const violation = violations.find(
          (v) => v.room_name.toLowerCase() === room.name.toLowerCase() ||
                 (v.box[0] === room.box[0] && v.box[1] === room.box[1])
        );

        const isViolated = !!violation;
        const isHovered = hoveredRoom?.name === room.name;
        const isSelected = selectedRoom?.name === room.name;

        // Fill color
        if (isViolated) {
          ctx.fillStyle = isHovered || isSelected ? "rgba(239, 68, 68, 0.35)" : "rgba(239, 68, 68, 0.18)";
          ctx.strokeStyle = "#ef4444"; // Vivid Red
          ctx.lineWidth = isHovered || isSelected ? 3 : 2;
        } else {
          ctx.fillStyle = isHovered || isSelected ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.12)";
          ctx.strokeStyle = "#10b981"; // Emerald Green
          ctx.lineWidth = isHovered || isSelected ? 3 : 1.5;
        }

        // Draw Room Box
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);

        // Highlight Glow for Selected/Hovered Room
        if (isSelected || isHovered) {
          ctx.save();
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          ctx.strokeRect(rx - 2, ry - 2, rw + 4, rh + 4);
          ctx.restore();
        }

        // Draw Room Label Tag
        if (showLabels) {
          ctx.font = "bold 11px sans-serif";
          const labelText = room.name;
          const textWidth = ctx.measureText(labelText).width;
          const tagW = textWidth + 14;
          const tagH = 20;
          const tagX = rx + 4;
          const tagY = ry + 4;

          // Tag background
          ctx.fillStyle = isViolated ? "rgba(185, 28, 28, 0.9)" : "rgba(6, 78, 59, 0.85)";
          ctx.beginPath();
          ctx.roundRect(tagX, tagY, tagW, tagH, 4);
          ctx.fill();

          // Tag text
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "left";
          ctx.fillText(labelText, tagX + 7, tagY + 14);

          // Danger exclamation pill on violated room
          if (isViolated) {
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText("⚠️", rx + rw - 24, ry + 16);
          }
        }
      });
    }

    ctx.restore();
  }, [imageObj, gridLayout, rooms, violations, selectedRoom, hoveredRoom, showGrid, showRooms, showLabels]);

  // Redraw whenever canvas resizes or dependencies update
  useEffect(() => {
    renderCanvas();
    const handleResize = () => renderCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCanvas]);

  // Click & Hover Detection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normX = (mouseX / canvas.clientWidth) * 1000;
    const normY = (mouseY / canvas.clientHeight) * 1000;

    const hit = rooms.find((r) => {
      const [ymin, xmin, ymax, xmax] = r.box;
      return normY >= ymin && normY <= ymax && normX >= xmin && normX <= xmax;
    });

    setHoveredRoom(hit || null);
    canvas.style.cursor = hit ? "pointer" : "crosshair";
  };

  const handleCanvasClick = () => {
    if (onSelectRoom) {
      onSelectRoom(hoveredRoom);
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold text-slate-200">
            Kanvas Inspeksi Tata Ruang Adat
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {rooms.length} Ruangan Terdeteksi
          </span>
        </div>

        {/* Compass & Mount Agung Azimuth Pill */}
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
          <Compass className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-amber-300">
            Kaja (Gn. Agung): <strong className="text-white">{kajaBearing.toFixed(1)}° {kajaDirection}</strong> ({regencyName})
          </span>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              showGrid
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Grid 9 Sanga Mandala"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            Grid 9 Zona
          </button>

          <button
            onClick={() => setShowRooms(!showRooms)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              showRooms
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Tampilan Ruangan"
          >
            <Layers className="w-3.5 h-3.5" />
            Ruangan
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              showLabels
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Label Nama Ruangan"
          >
            <Eye className="w-3.5 h-3.5" />
            Label
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square md:aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredRoom(null)}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800/80 rounded-xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500 inline-block" />
              <span className="text-slate-300">Sesuai Adat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500/40 border border-red-500 inline-block animate-pulse" />
              <span className="text-red-300 font-semibold">Melanggar Perda</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-dashed border-amber-400 inline-block" />
              <span className="text-amber-300">Utamaning Utama (Suci)</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            {hoveredRoom ? `Hover: ${hoveredRoom.name}` : "Arahkan kursor / klik ruangan untuk detail"}
          </span>
        </div>
      </div>
    </div>
  );
}
