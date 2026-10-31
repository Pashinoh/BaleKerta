"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { GridLayout, Room, Violation } from "@/types/audit";
import { Grid3X3, Layers, Maximize2, Minimize2 } from "lucide-react";

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

const ZONE_LABELS: Record<string, string> = {
  UTAMANING_UTAMA: "Utamaning Utama · Paling Suci",
  MADYANING_UTAMA: "Madyaning Utama",
  NISTANING_UTAMA: "Nistaning Utama",
  UTAMANING_MADYA: "Utamaning Madya",
  MADYANING_MADYA: "Madyaning Madya · Natah",
  NISTANING_MADYA: "Nistaning Madya",
  UTAMANING_NISTA: "Utamaning Nista",
  MADYANING_NISTA: "Madyaning Nista",
  NISTANING_NISTA: "Nistaning Nista · Teba",
};

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

    // 1. Calculate aspect-fit geometry (Fix F3 Alignment)
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

      // Subtle architectural grid lines
      ctx.strokeStyle = "#1D1A17"; // Ink-800
      ctx.lineWidth = 1;
      const step = 40;
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
    }

    renderAreaRef.current = renderArea;

    // Coordinate conversion functions tied strictly to image render rectangle
    const toPxX = (normX: number) => renderArea.x + (normX / 1000) * renderArea.w;
    const toPxY = (normY: number) => renderArea.y + (normY / 1000) * renderArea.h;

    // 2. Draw 9 Sanga Mandala Grid
    if (showGrid && gridLayout && gridLayout.cells) {
      gridLayout.cells.forEach((cell) => {
        const [ymin, xmin, ymax, xmax] = cell.box;
        const cx = toPxX(xmin);
        const cy = toPxY(ymin);
        const cw = toPxX(xmax) - cx;
        const ch = toPxY(ymax) - cy;

        const isUtama = cell.zone_id === "UTAMANING_UTAMA";

        if (isUtama) {
          // Sacred Zone: Dashed Bone border + subtle Bone fill
          ctx.fillStyle = "rgba(237, 231, 218, 0.05)";
          ctx.fillRect(cx, cy, cw, ch);

          ctx.strokeStyle = "#EDE7DA"; // Bone-100
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(cx, cy, cw, ch);
          ctx.setLineDash([]);

          // Sacred Zone Label
          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = "#EDE7DA";
          ctx.textAlign = "center";
          ctx.fillText("Utamaning Utama (Paling Suci)", cx + cw / 2, cy + 22);
        } else {
          // Standard Zone: Subtle Ink-600 line
          ctx.strokeStyle = "#3A352F"; // Ink-600
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, cw, ch);

          // Subtle zone name
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "#A39B8B"; // Bone-400
          ctx.textAlign = "center";
          const label = ZONE_LABELS[cell.zone_id] || cell.zone_id;
          ctx.fillText(label, cx + cw / 2, cy + 20);
        }
      });
    }

    // 3. Draw Room Bounding Boxes
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

        if (isViolated) {
          // Violation: Clay (#D2603F)
          ctx.fillStyle = isHighlighted
            ? "rgba(210, 96, 63, 0.24)"
            : "rgba(210, 96, 63, 0.14)";
          ctx.strokeStyle = "#D2603F";
          ctx.lineWidth = isHighlighted ? 3 : 2;
        } else {
          // Compliant: Bone-100 (#EDE7DA)
          ctx.fillStyle = isHighlighted
            ? "rgba(237, 231, 218, 0.14)"
            : "rgba(237, 231, 218, 0.06)";
          ctx.strokeStyle = "#EDE7DA";
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
        }

        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);

        // Highlight extra indicator border
        if (isHighlighted) {
          ctx.save();
          ctx.strokeStyle = isViolated ? "#D2603F" : "#EDE7DA";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(rx - 3, ry - 3, rw + 6, rh + 6);
          ctx.restore();
        }

        // Clean Room Label
        ctx.font = isHighlighted ? "bold 12px sans-serif" : "11px sans-serif";
        const labelText = room.name;
        const textWidth = ctx.measureText(labelText).width;
        const tagW = textWidth + 14;
        const tagH = 22;
        const tagX = rx + 4;
        const tagY = ry + 4;

        // Label pill background
        ctx.fillStyle = isViolated ? "#D2603F" : "#1D1A17";
        ctx.beginPath();
        ctx.rect(tagX, tagY, tagW, tagH);
        ctx.fill();

        ctx.strokeStyle = isViolated ? "#B84E30" : "#2A2622";
        ctx.lineWidth = 1;
        ctx.strokeRect(tagX, tagY, tagW, tagH);

        // Text color
        ctx.fillStyle = isViolated ? "#0E0D0C" : "#EDE7DA";
        ctx.textAlign = "left";
        ctx.fillText(labelText, tagX + 7, tagY + 15);
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
  ]);

  // Redraw on updates or window resize
  useEffect(() => {
    renderCanvas();
    const handleResize = () => renderCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCanvas]);

  // Mouse hover & click detection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onHoverIndex) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const renderArea = renderAreaRef.current;
    if (renderArea.w <= 0 || renderArea.h <= 0) return;

    const normX = ((mouseX - renderArea.x) / renderArea.w) * 1000;
    const normY = ((mouseY - renderArea.y) / renderArea.h) * 1000;

    const hitIdx = rooms.findIndex((r) => {
      const [ymin, xmin, ymax, xmax] = r.box;
      return normY >= ymin && normY <= ymax && normX >= xmin && normX <= xmax;
    });

    onHoverIndex(hitIdx >= 0 ? hitIdx : null);
    canvas.style.cursor = hitIdx >= 0 ? "pointer" : "default";
  };

  const handleCanvasClick = () => {
    if (typeof hoveredIndex === "number" && hoveredIndex >= 0) {
      if (onSelectIndex) {
        onSelectIndex(hoveredIndex === selectedIndex ? null : hoveredIndex);
      }
      if (onSelectRoom) {
        onSelectRoom(rooms[hoveredIndex] || null);
      }
    }
  };

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
          <span className="font-semibold text-bone-100">
            Kanvas Tata Ruang
          </span>
          <span className="text-[12px] font-mono px-2 py-0.5 bg-ink-900 border border-ink-700 text-bone-400 rounded">
            {rooms.length} Ruangan
          </span>
          <span className="hidden sm:inline-block text-[12px] font-mono text-bone-400 pl-2 border-l border-ink-700">
            Kaja: {kajaDirection} ({kajaBearing.toFixed(1)}°)
          </span>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5">
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

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-bone-400 hover:text-bone-100 hover:bg-ink-800 rounded border border-ink-700 transition-colors ml-1"
            title={isFullscreen ? "Kecilkan kanvas" : "Perbesar penuh layar"}
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
          onMouseLeave={() => onHoverIndex?.(null)}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Bottom Legend Bar adhering strictly to 3 colors */}
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
            {typeof hoveredIndex === "number" && hoveredIndex >= 0 && rooms[hoveredIndex]
              ? `Sorotan: ${rooms[hoveredIndex].name}`
              : "Arahkan kursor ke ruangan"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanCanvas;
