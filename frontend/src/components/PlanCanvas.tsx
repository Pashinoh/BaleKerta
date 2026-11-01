"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { GridLayout, Room, Violation } from "@/types/audit";
import {
  Grid3X3,
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

export interface PlanCanvasProps {
  imageSrc?: string | null;
  gridLayout?: GridLayout | null;
  rooms: Room[];
  violations: Violation[];
  hoveredIndex?: number | null;
  selectedIndex?: number | null;
  selectedRoom?: Room | null;
  onSelectRoom?: (room: Room | null) => void;
  onHoverIndex?: (index: number | null) => void;
  onSelectIndex?: (index: number | null) => void;
  kajaBearing?: number;
  kajaDirection?: string;
  regencyName?: string;
  className?: string;
}

const ZONE_INFO: Record<
  string,
  { label: string; sub: string; isSacred?: boolean; isCenter?: boolean }
> = {
  UTAMANING_UTAMA: {
    label: "Utamaning Utama",
    sub: "Kaja-Kangin · Suci",
    isSacred: true,
  },
  MADYANING_UTAMA: {
    label: "Madyaning Utama",
    sub: "Kaja",
  },
  NISTANING_UTAMA: {
    label: "Nistaning Utama",
    sub: "Kaja-Kauh",
  },
  UTAMANING_MADYA: {
    label: "Utamaning Madya",
    sub: "Kangin",
  },
  MADYANING_MADYA: {
    label: "Madyaning Madya",
    sub: "Pusat · Natah",
    isCenter: true,
  },
  NISTANING_MADYA: {
    label: "Nistaning Madya",
    sub: "Kauh",
  },
  UTAMANING_NISTA: {
    label: "Utamaning Nista",
    sub: "Kelod-Kangin",
  },
  MADYANING_NISTA: {
    label: "Madyaning Nista",
    sub: "Kelod",
  },
  NISTANING_NISTA: {
    label: "Nistaning Nista",
    sub: "Kelod-Kauh · Teba",
  },
};

function parseRoomName(fullName: string): { primary: string; secondary: string } {
  if (!fullName) return { primary: "", secondary: "" };

  // 1. Match "Name (Secondary)"
  const parenMatch = fullName.match(/^([^(]+)\s*\(([^)]+)\)/);
  if (parenMatch) {
    return {
      primary: parenMatch[1].trim(),
      secondary: parenMatch[2].trim(),
    };
  }

  // 2. Match "Name / Secondary"
  const slashMatch = fullName.match(/^([^/]+)\s*\/\s*(.+)/);
  if (slashMatch) {
    return {
      primary: slashMatch[1].trim(),
      secondary: slashMatch[2].trim(),
    };
  }

  // 3. Match "Name & Secondary" (e.g. Kamar Mandi & Toilet Teba, Angkul-angkul & Aling-aling)
  const ampMatch = fullName.match(/^([^&]+)\s*&\s*(.+)/);
  if (ampMatch) {
    return {
      primary: ampMatch[1].trim(),
      secondary: ampMatch[2].trim(),
    };
  }

  // 4. Special 3-word Balinese titles (e.g. "Taman Suci Pemerajan" -> "Taman Suci", "Pemerajan")
  const words = fullName.trim().split(/\s+/);
  if (words.length >= 3) {
    return {
      primary: words.slice(0, 2).join(" "),
      secondary: words.slice(2).join(" "),
    };
  }

  return {
    primary: fullName.trim(),
    secondary: "",
  };
}

function fitTextWithEllipsis(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (maxWidth <= 8) return "";
  if (ctx.measureText(text).width <= maxWidth) return text;

  let str = text;
  while (str.length > 1 && ctx.measureText(str + "…").width > maxWidth) {
    str = str.slice(0, -1);
  }
  return str.length > 0 ? str + "…" : "";
}

export const PlanCanvas: React.FC<PlanCanvasProps> = ({
  imageSrc,
  gridLayout,
  rooms,
  violations,
  hoveredIndex = null,
  selectedIndex = null,
  selectedRoom = null,
  onSelectRoom,
  onHoverIndex,
  onSelectIndex,
  kajaBearing = 41.7,
  kajaDirection = "Timur Laut (NE)",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderAreaRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // View toggles
  const [showGrid, setShowGrid] = useState(true);
  const [showRooms, setShowRooms] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image object
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

  // Main canvas render loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    // Apply zoom and pan relative to canvas center
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);

    // 1. Calculate aspect-fit geometry for floor plan area
    let renderArea = { x: 0, y: 0, w: width, h: height };
    if (imageObj) {
      const hRatio = width / imageObj.width;
      const vRatio = height / imageObj.height;
      const ratio = Math.min(hRatio, vRatio);
      const renderW = imageObj.width * ratio;
      const renderH = imageObj.height * ratio;
      const centerShiftX = (width - renderW) / 2;
      const centerShiftY = (height - renderH) / 2;
      renderArea = { x: centerShiftX, y: centerShiftY, w: renderW, h: renderH };

      ctx.drawImage(
        imageObj,
        0, 0, imageObj.width, imageObj.height,
        centerShiftX, centerShiftY, renderW, renderH
      );
    } else {
      // Schematic dark canvas when no image is loaded
      ctx.fillStyle = "#0E0D0C"; // Ink-950
      ctx.fillRect(0, 0, width, height);

      // Subtle architectural grid background
      ctx.strokeStyle = "#1A1715"; // Ink-900 subtle
      ctx.lineWidth = 1;
      const step = 36;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Border of the land plot
      renderArea = {
        x: Math.max(20, width * 0.04),
        y: Math.max(20, height * 0.04),
        w: width - Math.max(40, width * 0.08),
        h: height - Math.max(40, height * 0.08),
      };

      ctx.strokeStyle = "#2E2A25"; // Ink-700
      ctx.lineWidth = 1.5;
      ctx.strokeRect(renderArea.x, renderArea.y, renderArea.w, renderArea.h);
    }

    renderAreaRef.current = renderArea;

    // Coordinate conversion functions tied strictly to image/lot render rectangle
    const toPxX = (normX: number) => renderArea.x + (normX / 1000) * renderArea.w;
    const toPxY = (normY: number) => renderArea.y + (normY / 1000) * renderArea.h;

    // 2. Draw 9 Sanga Mandala Grid (Zero collision with rooms)
    if (showGrid && gridLayout && gridLayout.cells) {
      gridLayout.cells.forEach((cell) => {
        const [ymin, xmin, ymax, xmax] = cell.box;
        const cx = toPxX(xmin);
        const cy = toPxY(ymin);
        const cw = toPxX(xmax) - cx;
        const ch = toPxY(ymax) - cy;

        const info = ZONE_INFO[cell.zone_id] || {
          label: cell.zone_id.replace(/_/g, " "),
          sub: "",
        };

        if (info.isSacred) {
          // Sacred Zone: Utamaning Utama (Kaja-Kangin)
          ctx.fillStyle = "rgba(237, 231, 218, 0.04)";
          ctx.fillRect(cx, cy, cw, ch);

          ctx.strokeStyle = "rgba(237, 231, 218, 0.75)"; // Bone-100 dashed
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(cx, cy, cw, ch);
          ctx.setLineDash([]);

          // Compact architectural chip in top-left corner
          const chipW = Math.min(cw - 12, 140);
          const chipH = 18;
          ctx.fillStyle = "rgba(237, 231, 218, 0.12)";
          ctx.fillRect(cx + 6, cy + 6, chipW, chipH);
          ctx.strokeStyle = "rgba(237, 231, 218, 0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx + 6, cy + 6, chipW, chipH);

          ctx.font = "bold 9px sans-serif";
          ctx.fillStyle = "#EDE7DA";
          ctx.textAlign = "left";
          ctx.fillText("✦ " + fitTextWithEllipsis(ctx, "UTAMANING UTAMA (SUCI)", chipW - 10), cx + 11, cy + 18);
        } else {
          // Standard Zone: Crisp architectural boundary
          ctx.strokeStyle = "rgba(58, 53, 47, 0.55)"; // Ink-600
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, cw, ch);

          // Subtle corner label
          ctx.font = "8.5px sans-serif";
          ctx.fillStyle = "rgba(163, 155, 139, 0.5)"; // Bone-400 subtle
          ctx.textAlign = "left";
          const labelText = info.sub ? `${info.label} (${info.sub})` : info.label;
          const fittedLabel = fitTextWithEllipsis(ctx, labelText, cw - 16);
          ctx.fillText(fittedLabel, cx + 8, cy + 16);
        }

        // Center marker for Natah
        if (info.isCenter) {
          const midX = cx + cw / 2;
          const midY = cy + ch / 2;
          ctx.strokeStyle = "rgba(163, 155, 139, 0.25)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(midX - 7, midY);
          ctx.lineTo(midX + 7, midY);
          ctx.moveTo(midX, midY - 7);
          ctx.lineTo(midX, midY + 7);
          ctx.stroke();
        }
      });
    }

    // 3. Draw Room Bounding Boxes (Zero Cross-Room Overlap!)
    if (showRooms && rooms) {
      rooms.forEach((room, idx) => {
        const [ymin, xmin, ymax, xmax] = room.box;
        const rx = toPxX(xmin);
        const ry = toPxY(ymin);
        const rw = toPxX(xmax) - rx;
        const rh = toPxY(ymax) - ry;

        // Check violation status
        const violation = violations.find(
          (v) =>
            v.room_name.toLowerCase() === room.name.toLowerCase() ||
            (v.box &&
              v.box[0] === room.box[0] &&
              v.box[1] === room.box[1] &&
              v.box[2] === room.box[2] &&
              v.box[3] === room.box[3])
        );

        const isViolated = !!violation;
        const isHovered = hoveredIndex === idx;
        const isSelected = selectedIndex === idx || (selectedRoom != null && selectedRoom.name === room.name);
        const isHighlighted = isHovered || isSelected;
        const isNatah = room.type === "natah_open_space" || room.name.toLowerCase().includes("natah");

        // Background Fill & Border
        if (isViolated) {
          // Violation: Deep rich clay background
          ctx.fillStyle = isHighlighted ? "rgba(75, 26, 19, 0.94)" : "rgba(52, 20, 15, 0.86)";
          ctx.strokeStyle = "#D2603F"; // Clay
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
        } else if (isNatah) {
          // Open Natah: Gentle transparent tone
          ctx.fillStyle = isHighlighted ? "rgba(237, 231, 218, 0.12)" : "rgba(237, 231, 218, 0.04)";
          ctx.strokeStyle = isHighlighted ? "#EDE7DA" : "rgba(237, 231, 218, 0.55)";
          ctx.lineWidth = isHighlighted ? 2 : 1.5;
        } else {
          // Compliant Room: Solid deep charcoal with clean bone outline
          ctx.fillStyle = isHighlighted ? "rgba(36, 33, 29, 0.96)" : "rgba(24, 22, 20, 0.88)";
          ctx.strokeStyle = isHighlighted ? "#EDE7DA" : "rgba(237, 231, 218, 0.65)";
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
        }

        ctx.fillRect(rx, ry, rw, rh);

        if (isNatah && !isHighlighted) {
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(rx, ry, rw, rh);
          ctx.setLineDash([]);
        } else {
          ctx.strokeRect(rx, ry, rw, rh);
        }

        // Highlight extra indicator border
        if (isHighlighted) {
          ctx.save();
          ctx.strokeStyle = isViolated ? "#D2603F" : "#EDE7DA";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(rx - 3, ry - 3, rw + 6, rh + 6);
          ctx.restore();
        }

        // 4. Render Room Typography WITH STRICT CLIPPING (Never spills out!)
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();

        const { primary, secondary } = parseRoomName(room.name);
        const headerH = Math.min(22, Math.max(16, rh * 0.32));

        // Integrated Header Strip
        if (isViolated) {
          ctx.fillStyle = isHighlighted ? "#D2603F" : "#B84E30";
          ctx.fillRect(rx, ry, rw, headerH);
        } else {
          ctx.fillStyle = isHighlighted ? "rgba(237, 231, 218, 0.22)" : "rgba(237, 231, 218, 0.12)";
          ctx.fillRect(rx, ry, rw, headerH);
        }

        // Primary Room Title
        const titleFontSize = Math.min(11, Math.max(8.5, Math.floor(rw / 9.5)));
        ctx.font = `bold ${titleFontSize}px sans-serif`;
        ctx.fillStyle = isViolated ? "#FFFFFF" : isHighlighted ? "#FFFFFF" : "#EDE7DA";
        ctx.textAlign = "left";

        const maxTitleW = rw - (isViolated ? 22 : 12);
        const fittedTitle = fitTextWithEllipsis(ctx, primary, maxTitleW);
        ctx.fillText(fittedTitle, rx + 6, ry + headerH - 5);

        // Warning indicator mark for violated room
        if (isViolated) {
          ctx.font = "bold 9px sans-serif";
          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "right";
          ctx.fillText("!", rx + rw - 5, ry + headerH - 5);
        }

        // Subtitle / Zone Label if room box has adequate height
        if (rh >= 46 && rw >= 55) {
          const subFontSize = Math.min(9, Math.max(7.5, titleFontSize - 1.5));
          ctx.font = `${subFontSize}px sans-serif`;
          ctx.fillStyle = isViolated ? "#F5B895" : "#A39B8B"; // Bone-400
          ctx.textAlign = "left";

          const subText = secondary || (room.zone ? room.zone.zone_name : "");
          if (subText) {
            const fittedSub = fitTextWithEllipsis(ctx, subText, rw - 12);
            ctx.fillText(fittedSub, rx + 6, ry + headerH + 13);
          }

          // Full Zone Classification tag if room is tall enough
          if (rh >= 72 && room.zone) {
            ctx.font = "7.5px font-mono";
            ctx.fillStyle = "rgba(163, 155, 139, 0.65)";
            const zoneBadge = room.zone.zone_id ? room.zone.zone_id.replace(/_/g, " ") : "";
            const fittedZone = fitTextWithEllipsis(ctx, zoneBadge, rw - 12);
            ctx.fillText(fittedZone, rx + 6, ry + headerH + 26);
          }
        }

        ctx.restore();
      });
    }

    ctx.restore();
  }, [
    imageObj,
    gridLayout,
    rooms,
    violations,
    hoveredIndex,
    selectedIndex,
    selectedRoom,
    showGrid,
    showRooms,
    zoom,
    pan,
  ]);

  // Redraw on updates or window resize
  useEffect(() => {
    renderCanvas();
    const handleResize = () => renderCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCanvas]);

  // Mouse hover detection (accounting for zoom and pan)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    if (!onHoverIndex) return;

    const rect = canvas.getBoundingClientRect();
    const rawMouseX = e.clientX - rect.left;
    const rawMouseY = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const mouseX = (rawMouseX - centerX - pan.x) / zoom + centerX;
    const mouseY = (rawMouseY - centerY - pan.y) / zoom + centerY;

    const renderArea = renderAreaRef.current;
    if (renderArea.w <= 0 || renderArea.h <= 0) return;

    const normX = ((mouseX - renderArea.x) / renderArea.w) * 1000;
    const normY = ((mouseY - renderArea.y) / renderArea.h) * 1000;

    const hitIdx = rooms.findIndex((r) => {
      const [ymin, xmin, ymax, xmax] = r.box;
      return normY >= ymin && normY <= ymax && normX >= xmin && normX <= xmax;
    });

    onHoverIndex(hitIdx >= 0 ? hitIdx : null);
    canvas.style.cursor = isDragging ? "grabbing" : hitIdx >= 0 ? "pointer" : zoom > 1.0 ? "grab" : "default";
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (zoom > 1.0 || e.shiftKey) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    if (isDragging) return;
    if (typeof hoveredIndex === "number" && hoveredIndex >= 0) {
      if (onSelectIndex) {
        onSelectIndex(hoveredIndex === selectedIndex ? null : hoveredIndex);
      }
      if (onSelectRoom) {
        onSelectRoom(rooms[hoveredIndex] || null);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1.0, +(prev - 0.25).toFixed(2));
      if (next === 1.0) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Determine active highlighted room for top HUD inspector
  const activeRoomIndex =
    typeof hoveredIndex === "number" && hoveredIndex >= 0
      ? hoveredIndex
      : typeof selectedIndex === "number" && selectedIndex >= 0
      ? selectedIndex
      : null;

  const activeRoom = activeRoomIndex !== null ? rooms[activeRoomIndex] : null;
  const activeViolation = activeRoom
    ? violations.find(
        (v) =>
          v.room_name.toLowerCase() === activeRoom.name.toLowerCase() ||
          (v.box &&
            v.box[0] === activeRoom.box[0] &&
            v.box[1] === activeRoom.box[1] &&
            v.box[2] === activeRoom.box[2] &&
            v.box[3] === activeRoom.box[3])
      )
    : null;

  return (
    <div
      ref={containerRef}
      className={`border border-ink-700 bg-ink-900 rounded-lg overflow-hidden flex flex-col ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""
      } ${className}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 border-b border-ink-700 bg-ink-950 text-[13px] gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-bone-100 flex items-center gap-1.5">
            <Compass size={15} className="text-bone-400" />
            <span>Kanvas Tata Ruang</span>
          </span>
          <span className="text-[12px] font-mono px-2 py-0.5 bg-ink-900 border border-ink-700 text-bone-400 rounded">
            {rooms.length} Ruangan
          </span>
          <span className="hidden sm:inline-block text-[12px] font-mono text-bone-400 pl-2 border-l border-ink-700">
            Kaja: {kajaDirection} ({kajaBearing.toFixed(1)}°)
          </span>
        </div>

        {/* Action Toggles & Zoom Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 text-[12px] font-medium rounded border transition-colors flex items-center gap-1 ${
              showGrid
                ? "bg-bone-100 text-ink-950 border-bone-100"
                : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100 hover:bg-ink-800"
            }`}
          >
            <Grid3X3 size={13} />
            <span>Kisi 9 Zona</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRooms(!showRooms)}
            className={`px-2.5 py-1 text-[12px] font-medium rounded border transition-colors flex items-center gap-1 ${
              showRooms
                ? "bg-bone-100 text-ink-950 border-bone-100"
                : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100 hover:bg-ink-800"
            }`}
          >
            <Layers size={13} />
            <span>Kotak Ruangan</span>
          </button>

          {/* Zoom In, Out, Reset */}
          <div className="flex items-center bg-ink-900 border border-ink-700 rounded p-0.5 ml-1">
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 2.5}
              className="p-1 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded disabled:opacity-30 transition-colors"
              title="Perbesar kanvas (Zoom In)"
              aria-label="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <span className="text-[10px] font-mono text-bone-400 px-1.5 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1.0}
              className="p-1 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded disabled:opacity-30 transition-colors"
              title="Perkecil kanvas (Zoom Out)"
              aria-label="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            {zoom > 1.0 && (
              <button
                type="button"
                onClick={handleResetView}
                className="p-1 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded transition-colors ml-0.5"
                title="Kembalikan ukuran normal"
                aria-label="Reset zoom"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded border border-ink-700 transition-colors ml-1"
            title={isFullscreen ? "Kecilkan kanvas" : "Perbesar penuh layar"}
            aria-label={isFullscreen ? "Kecilkan kanvas" : "Perbesar penuh layar"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] bg-ink-950 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            onHoverIndex?.(null);
          }}
          onClick={handleCanvasClick}
          className="w-full h-full block select-none"
        />

        {/* Dynamic Interactive Inspector HUD Bar on Hover / Select */}
        {activeRoom ? (
          <div className="absolute top-2.5 left-2.5 right-2.5 p-2 sm:p-2.5 bg-ink-950/95 backdrop-blur-md border border-ink-700 rounded-lg shadow-2xl text-[12px] flex items-center justify-between gap-3 pointer-events-none transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded shrink-0 ${
                  activeViolation
                    ? "bg-clay/20 text-clay border border-clay/40"
                    : "bg-bone-100/10 text-bone-100 border border-bone-100/30"
                }`}
              >
                {activeViolation ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-bone-100 text-[13px] truncate">
                    {activeRoom.name}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-ink-900 border border-ink-800 text-bone-400">
                    {activeRoom.type}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      activeViolation
                        ? "bg-clay/20 text-clay border border-clay"
                        : "bg-bone-100/10 text-bone-100 border border-bone-100/30"
                    }`}
                  >
                    {activeViolation ? "Perlu Penyesuaian Ruang" : "Sesuai Adat Bali"}
                  </span>
                </div>
                <p className="text-[11px] text-bone-400 truncate mt-0.5">
                  Zona:{" "}
                  <strong className="text-bone-200">
                    {activeRoom.zone?.zone_name || activeRoom.zone?.zone_id?.replace(/_/g, " ") || "Terpetakan"}
                  </strong>
                  {activeViolation
                    ? ` • ${activeViolation.issue}`
                    : " • Posisi memenuhi hierarki kesucian Sanga Mandala"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 right-2.5 px-3 py-1.5 bg-ink-950/80 backdrop-blur-sm border border-ink-800/80 rounded-md text-[11px] text-bone-400 flex items-center justify-between pointer-events-none">
            <span className="flex items-center gap-1.5">
              <Info size={13} className="text-bone-400 shrink-0" />
              <span>Arahkan kursor atau klik kotak ruangan pada kanvas untuk melihat rincian hierarki adat</span>
            </span>
            <span className="font-mono text-[10px] text-bone-400/80 hidden sm:inline">
              Geser kanvas saat diperbesar
            </span>
          </div>
        )}

        {/* Bottom Legend Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-3 px-3 py-1.5 bg-ink-950/95 border border-ink-700 rounded-md text-[12px] pointer-events-none">
          <div className="flex items-center gap-4">
            {/* Compliant: Bone-100 */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-bone-100 bg-bone-100/10 inline-block" />
              <span className="text-bone-100">Sesuai Adat</span>
            </div>
            {/* Violation: Clay */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border-2 border-clay bg-clay/20 inline-block" />
              <span className="text-clay font-medium">Perlu Perbaikan</span>
            </div>
            {/* Sacred: Dashed Bone */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-dashed border-bone-100 inline-block" />
              <span className="text-bone-400">Utamaning Utama</span>
            </div>
          </div>

          <span className="hidden sm:inline text-bone-400 font-mono text-[11px]">
            {activeRoom ? `Sorotan: ${activeRoom.name}` : "Peta Geometri Adat Bali"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanCanvas;
