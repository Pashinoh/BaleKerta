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
  Sun,
  Moon,
  Eye,
  EyeOff,
  Box,
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

  const parenMatch = fullName.match(/^([^(]+)\s*\(([^)]+)\)/);
  if (parenMatch) {
    return {
      primary: parenMatch[1].trim(),
      secondary: parenMatch[2].trim(),
    };
  }

  const slashMatch = fullName.match(/^([^/]+)\s*\/\s*(.+)/);
  if (slashMatch) {
    return {
      primary: slashMatch[1].trim(),
      secondary: slashMatch[2].trim(),
    };
  }

  const ampMatch = fullName.match(/^([^&]+)\s*&\s*(.+)/);
  if (ampMatch) {
    return {
      primary: ampMatch[1].trim(),
      secondary: ampMatch[2].trim(),
    };
  }

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

  // View state: Theme (Dark vs Soft Architectural Paper)
  const [theme, setTheme] = useState<"dark" | "paper">("dark");

  // View state: Overlay Mode (Wireframe / Blueprint X-Ray vs Shaded)
  // When an image is loaded, default to wireframe so the drawing underneath is 100% visible
  const [overlayMode, setOverlayMode] = useState<"wireframe" | "shaded">(
    imageSrc ? "wireframe" : "shaded"
  );

  // Layer toggles
  const [showImage, setShowImage] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showRooms, setShowRooms] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interactive Pan & Zoom
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistanceRef = useRef<number>(0);

  // Load image object
  useEffect(() => {
    if (!imageSrc) {
      setImageObj(null);
      setOverlayMode("shaded");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageObj(img);
      // Auto-set to wireframe so users can see the blueprint details immediately
      setOverlayMode("wireframe");
    };
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

    const isPaper = theme === "paper";

    // 1. Calculate aspect-fit geometry for floor plan area
    let renderArea = { x: 0, y: 0, w: width, h: height };
    if (imageObj && showImage) {
      const hRatio = width / imageObj.width;
      const vRatio = height / imageObj.height;
      const ratio = Math.min(hRatio, vRatio) * 0.94; // slight padding
      const renderW = imageObj.width * ratio;
      const renderH = imageObj.height * ratio;
      const centerShiftX = (width - renderW) / 2;
      const centerShiftY = (height - renderH) / 2;
      renderArea = { x: centerShiftX, y: centerShiftY, w: renderW, h: renderH };

      // Background fill behind drawing
      ctx.fillStyle = isPaper ? "#F4F0E6" : "#0E0D0C";
      ctx.fillRect(0, 0, width, height);

      // Subtle drop shadow behind drawing
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(centerShiftX, centerShiftY, renderW, renderH);
      ctx.restore();

      ctx.drawImage(
        imageObj,
        0, 0, imageObj.width, imageObj.height,
        centerShiftX, centerShiftY, renderW, renderH
      );

      // Frame around drawing
      ctx.strokeStyle = isPaper ? "rgba(160, 150, 135, 0.6)" : "rgba(80, 75, 70, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(centerShiftX, centerShiftY, renderW, renderH);
    } else {
      // Schematic canvas when no image is loaded
      ctx.fillStyle = isPaper ? "#F4F0E6" : "#0E0D0C";
      ctx.fillRect(0, 0, width, height);

      // Subtle architectural grid background
      ctx.strokeStyle = isPaper ? "#E6E1D2" : "#1A1715";
      ctx.lineWidth = 1;
      const step = 38;
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
        x: Math.max(24, width * 0.05),
        y: Math.max(24, height * 0.05),
        w: width - Math.max(48, width * 0.1),
        h: height - Math.max(48, height * 0.1),
      };

      ctx.strokeStyle = isPaper ? "#C8C0AF" : "#2E2A25";
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
          ctx.fillStyle = isPaper ? "rgba(202, 165, 78, 0.08)" : "rgba(237, 231, 218, 0.04)";
          ctx.fillRect(cx, cy, cw, ch);

          ctx.strokeStyle = isPaper ? "rgba(160, 125, 38, 0.85)" : "rgba(237, 231, 218, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(cx, cy, cw, ch);
          ctx.setLineDash([]);

          // Compact architectural chip in top-left corner
          const chipW = Math.min(cw - 12, 145);
          const chipH = 18;
          ctx.fillStyle = isPaper ? "rgba(202, 165, 78, 0.22)" : "rgba(237, 231, 218, 0.14)";
          ctx.fillRect(cx + 6, cy + 6, chipW, chipH);
          ctx.strokeStyle = isPaper ? "rgba(160, 125, 38, 0.6)" : "rgba(237, 231, 218, 0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx + 6, cy + 6, chipW, chipH);

          ctx.font = "bold 9px sans-serif";
          ctx.fillStyle = isPaper ? "#6B5012" : "#EDE7DA";
          ctx.textAlign = "left";
          ctx.fillText("✦ " + fitTextWithEllipsis(ctx, "UTAMANING UTAMA (SUCI)", chipW - 10), cx + 11, cy + 18);
        } else {
          // Standard Zone: Crisp architectural boundary
          ctx.strokeStyle = isPaper ? "rgba(168, 160, 144, 0.65)" : "rgba(58, 53, 47, 0.55)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, cw, ch);

          // Subtle corner label
          ctx.font = "8.5px sans-serif";
          ctx.fillStyle = isPaper ? "rgba(90, 82, 70, 0.65)" : "rgba(163, 155, 139, 0.5)";
          ctx.textAlign = "left";
          const labelText = info.sub ? `${info.label} (${info.sub})` : info.label;
          const fittedLabel = fitTextWithEllipsis(ctx, labelText, cw - 16);
          ctx.fillText(fittedLabel, cx + 8, cy + 16);
        }

        // Center marker for Natah
        if (info.isCenter) {
          const midX = cx + cw / 2;
          const midY = cy + ch / 2;
          ctx.strokeStyle = isPaper ? "rgba(140, 130, 115, 0.4)" : "rgba(163, 155, 139, 0.25)";
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

        // Background Fill & Border (Controlled by Wireframe vs Shaded mode)
        const isWireframe = overlayMode === "wireframe";

        if (isViolated) {
          // Violation Room: Terracotta / Clay
          if (isWireframe) {
            ctx.fillStyle = isHighlighted
              ? isPaper ? "rgba(210, 96, 63, 0.16)" : "rgba(210, 96, 63, 0.22)"
              : "rgba(0, 0, 0, 0)"; // 100% transparent in wireframe
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted ? "rgba(253, 239, 235, 0.94)" : "rgba(253, 239, 235, 0.88)"
              : isHighlighted ? "rgba(75, 26, 19, 0.94)" : "rgba(52, 20, 15, 0.86)";
          }
          ctx.strokeStyle = isPaper ? "#C04523" : "#D2603F";
          ctx.lineWidth = isHighlighted ? 2.5 : 1.8;
        } else if (isNatah) {
          // Open Natah: Gentle transparent tone
          if (isWireframe) {
            ctx.fillStyle = isHighlighted
              ? isPaper ? "rgba(200, 190, 175, 0.18)" : "rgba(237, 231, 218, 0.15)"
              : "rgba(0, 0, 0, 0)";
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted ? "rgba(235, 230, 218, 0.35)" : "rgba(235, 230, 218, 0.15)"
              : isHighlighted ? "rgba(237, 231, 218, 0.12)" : "rgba(237, 231, 218, 0.04)";
          }
          ctx.strokeStyle = isPaper
            ? isHighlighted ? "#2E2A24" : "rgba(120, 110, 95, 0.7)"
            : isHighlighted ? "#EDE7DA" : "rgba(237, 231, 218, 0.55)";
          ctx.lineWidth = isHighlighted ? 2 : 1.5;
        } else {
          // Compliant Room
          if (isWireframe) {
            ctx.fillStyle = isHighlighted
              ? isPaper ? "rgba(200, 190, 175, 0.2)" : "rgba(237, 231, 218, 0.18)"
              : "rgba(0, 0, 0, 0)"; // Transparent to see user blueprint underneath!
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted ? "rgba(255, 255, 255, 0.96)" : "rgba(255, 255, 255, 0.9)"
              : isHighlighted ? "rgba(36, 33, 29, 0.96)" : "rgba(24, 22, 20, 0.88)";
          }
          ctx.strokeStyle = isPaper
            ? isHighlighted ? "#0E0D0C" : "#2E2A24"
            : isHighlighted ? "#EDE7DA" : "rgba(237, 231, 218, 0.65)";
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
          ctx.strokeStyle = isViolated
            ? isPaper ? "#C04523" : "#D2603F"
            : isPaper ? "#0E0D0C" : "#EDE7DA";
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
          ctx.fillStyle = isPaper
            ? isHighlighted ? "#D2603F" : "#C04523"
            : isHighlighted ? "#D2603F" : "#B84E30";
          ctx.fillRect(rx, ry, rw, headerH);
        } else {
          if (isWireframe) {
            ctx.fillStyle = isPaper
              ? isHighlighted ? "rgba(46, 42, 36, 0.85)" : "rgba(46, 42, 36, 0.72)"
              : isHighlighted ? "rgba(24, 22, 20, 0.88)" : "rgba(24, 22, 20, 0.75)";
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted ? "rgba(224, 216, 202, 0.98)" : "rgba(235, 230, 220, 0.95)"
              : isHighlighted ? "rgba(237, 231, 218, 0.22)" : "rgba(237, 231, 218, 0.12)";
          }
          ctx.fillRect(rx, ry, rw, headerH);
        }

        // Primary Room Title
        const titleFontSize = Math.min(11, Math.max(8.5, Math.floor(rw / 9.5)));
        ctx.font = `bold ${titleFontSize}px sans-serif`;
        ctx.fillStyle = isViolated
          ? "#FFFFFF"
          : isWireframe
          ? "#FFFFFF"
          : isPaper
          ? "#1C1917"
          : isHighlighted
          ? "#FFFFFF"
          : "#EDE7DA";
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

          if (isViolated) {
            ctx.fillStyle = isPaper ? "#8A2B10" : "#F5B895";
          } else if (isWireframe) {
            ctx.fillStyle = isPaper ? "#2E2A24" : "#EDE7DA";
          } else {
            ctx.fillStyle = isPaper ? "#575249" : "#A39B8B";
          }
          ctx.textAlign = "left";

          const subText = secondary || (room.zone ? room.zone.zone_name : "");
          if (subText) {
            const fittedSub = fitTextWithEllipsis(ctx, subText, rw - 12);
            ctx.fillText(fittedSub, rx + 6, ry + headerH + 13);
          }

          // Full Zone Classification tag if room is tall enough
          if (rh >= 72 && room.zone) {
            ctx.font = "7.5px font-mono";
            ctx.fillStyle = isPaper ? "rgba(90, 82, 70, 0.7)" : "rgba(163, 155, 139, 0.65)";
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
    showImage,
    showGrid,
    showRooms,
    theme,
    overlayMode,
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

  // Non-passive wheel listener for smooth wheel zooming without scrolling the whole page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(3.5, Math.max(0.8, +(prevZoom * zoomFactor).toFixed(2)));
        if (nextZoom === 1.0) setPan({ x: 0, y: 0 });
        return nextZoom;
      });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Mouse hover detection (accounting for zoom and pan)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
      setPan({ x: dx, y: dy });
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
    canvas.style.cursor = isDragging ? "grabbing" : hitIdx >= 0 ? "pointer" : "grab";
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragDistanceRef.current = 0;
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    // Only register click selection if not a significant drag movement
    if (dragDistanceRef.current > 8) return;

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
    setZoom((prev) => Math.min(3.5, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(0.8, +(prev - 0.25).toFixed(2));
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

  const isPaper = theme === "paper";

  return (
    <div
      ref={containerRef}
      className={`border rounded-xl overflow-hidden flex flex-col transition-colors shadow-sm ${
        isPaper
          ? "bg-[#F4F0E6] border-[#D4CDBC]"
          : "bg-ink-900 border-ink-700"
      } ${
        isFullscreen ? "fixed inset-3 sm:inset-6 z-50 shadow-2xl" : ""
      } ${className}`}
    >
      {/* Top Architectural Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between px-4 py-2.5 border-b text-[13px] gap-2 transition-colors ${
          isPaper
            ? "bg-[#EAE4D5] border-[#D4CDBC] text-[#1C1917]"
            : "bg-ink-950 border-ink-700 text-bone-100"
        }`}
      >
        {/* Left: Title, Stats & Kaja Bearing */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold flex items-center gap-1.5">
            <Compass size={16} className={isPaper ? "text-[#5A5040]" : "text-bone-400"} />
            <span>Kanvas Tata Ruang</span>
          </span>
          <span
            className={`text-[12px] font-mono px-2 py-0.5 rounded border ${
              isPaper
                ? "bg-[#F4F0E6] border-[#D4CDBC] text-[#5A5040]"
                : "bg-ink-900 border-ink-700 text-bone-400"
            }`}
          >
            {rooms.length} Ruangan
          </span>
          <span
            className={`hidden sm:inline-block text-[12px] font-mono pl-2 border-l ${
              isPaper
                ? "text-[#5A5040] border-[#D4CDBC]"
                : "text-bone-400 border-ink-700"
            }`}
          >
            Arah Kaja: {kajaDirection} ({kajaBearing.toFixed(1)}°)
          </span>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Theme Toggle: Dark vs Non-glaring Architectural Paper */}
          <div
            className={`flex items-center p-0.5 rounded border ${
              isPaper
                ? "bg-[#F4F0E6] border-[#D4CDBC]"
                : "bg-ink-900 border-ink-700"
            }`}
          >
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-1.5 text-[11px] font-medium rounded flex items-center gap-1 transition-all ${
                theme === "dark"
                  ? "bg-ink-950 text-bone-100 shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Gelap (Kontras Tinggi)"
            >
              <Moon size={13} />
              <span className="hidden md:inline">Gelap</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("paper")}
              className={`p-1.5 text-[11px] font-medium rounded flex items-center gap-1 transition-all ${
                theme === "paper"
                  ? "bg-[#FFFFFF] text-[#1C1917] shadow-sm font-semibold"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Mode Kertas Arsitektur (Bebas Silau)"
            >
              <Sun size={13} />
              <span className="hidden md:inline">Kertas</span>
            </button>
          </div>

          {/* Overlay Mode Toggle: Wireframe vs Shaded (Crucial for seeing uploaded blueprints) */}
          {imageSrc && (
            <button
              type="button"
              onClick={() => setOverlayMode(overlayMode === "wireframe" ? "shaded" : "wireframe")}
              className={`px-2.5 py-1 text-[12px] font-medium rounded border transition-colors flex items-center gap-1.5 ${
                overlayMode === "wireframe"
                  ? isPaper
                    ? "bg-[#1C1917] text-white border-[#1C1917]"
                    : "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                  : isPaper
                  ? "bg-[#F4F0E6] border-[#D4CDBC] text-[#5A5040] hover:bg-[#FFFFFF]"
                  : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100"
              }`}
              title="Ganti mode kotak ruangan tembus pandang atau warna blok"
            >
              <Box size={13} />
              <span>{overlayMode === "wireframe" ? "Tembus Pandang (Blueprint)" : "Blok Warna"}</span>
            </button>
          )}

          {/* Toggle Image Visibility if image is present */}
          {imageSrc && (
            <button
              type="button"
              onClick={() => setShowImage(!showImage)}
              className={`p-1.5 text-[12px] font-medium rounded border transition-colors flex items-center gap-1 ${
                showImage
                  ? isPaper
                    ? "bg-[#1C1917] text-white border-[#1C1917]"
                    : "bg-bone-100 text-ink-950 border-bone-100"
                  : isPaper
                  ? "bg-[#F4F0E6] border-[#D4CDBC] text-[#5A5040]"
                  : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100"
              }`}
              title={showImage ? "Sembunyikan gambar denah asli" : "Tampilkan gambar denah asli"}
            >
              {showImage ? <Eye size={13} /> : <EyeOff size={13} />}
              <span className="hidden lg:inline">{showImage ? "Gambar Asli" : "Denah Sembunyi"}</span>
            </button>
          )}

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 text-[12px] font-medium rounded border transition-colors flex items-center gap-1 ${
              showGrid
                ? isPaper
                  ? "bg-[#1C1917] text-white border-[#1C1917]"
                  : "bg-bone-100 text-ink-950 border-bone-100"
                : isPaper
                ? "bg-[#F4F0E6] border-[#D4CDBC] text-[#5A5040]"
                : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100 hover:bg-ink-800"
            }`}
          >
            <Grid3X3 size={13} />
            <span className="hidden sm:inline">Kisi 9 Zona</span>
          </button>

          {/* Rooms Toggle */}
          <button
            type="button"
            onClick={() => setShowRooms(!showRooms)}
            className={`px-2.5 py-1 text-[12px] font-medium rounded border transition-colors flex items-center gap-1 ${
              showRooms
                ? isPaper
                  ? "bg-[#1C1917] text-white border-[#1C1917]"
                  : "bg-bone-100 text-ink-950 border-bone-100"
                : isPaper
                ? "bg-[#F4F0E6] border-[#D4CDBC] text-[#5A5040]"
                : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100 hover:bg-ink-800"
            }`}
          >
            <Layers size={13} />
            <span className="hidden sm:inline">Kotak Ruang</span>
          </button>

          {/* Zoom In, Out, Reset */}
          <div
            className={`flex items-center rounded border p-0.5 ml-0.5 ${
              isPaper
                ? "bg-[#F4F0E6] border-[#D4CDBC]"
                : "bg-ink-900 border-ink-700"
            }`}
          >
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3.5}
              className={`p-1.5 rounded disabled:opacity-30 transition-colors ${
                isPaper
                  ? "text-[#5A5040] hover:text-[#1C1917] hover:bg-[#FFFFFF]"
                  : "text-bone-400 hover:text-bone-100 hover:bg-ink-800"
              }`}
              title="Perbesar (Scroll roda mouse ke atas)"
              aria-label="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <span
              className={`text-[11px] font-mono px-1.5 select-none font-semibold ${
                isPaper ? "text-[#1C1917]" : "text-bone-300"
              }`}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.8}
              className={`p-1.5 rounded disabled:opacity-30 transition-colors ${
                isPaper
                  ? "text-[#5A5040] hover:text-[#1C1917] hover:bg-[#FFFFFF]"
                  : "text-bone-400 hover:text-bone-100 hover:bg-ink-800"
              }`}
              title="Perkecil (Scroll roda mouse ke bawah)"
              aria-label="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            {(zoom !== 1.0 || pan.x !== 0 || pan.y !== 0) && (
              <button
                type="button"
                onClick={handleResetView}
                className={`p-1.5 rounded transition-colors ml-0.5 ${
                  isPaper
                    ? "text-[#5A5040] hover:text-[#1C1917] hover:bg-[#FFFFFF]"
                    : "text-bone-400 hover:text-bone-100 hover:bg-ink-800"
                }`}
                title="Pusatkan dan kembalikan ke ukuran 100%"
                aria-label="Reset zoom and pan"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded border transition-colors ml-0.5 ${
              isPaper
                ? "border-[#D4CDBC] text-[#5A5040] hover:text-[#1C1917] hover:bg-[#FFFFFF]"
                : "border-ink-700 text-bone-400 hover:text-bone-100 hover:bg-ink-800"
            }`}
            title={isFullscreen ? "Kecilkan kanvas" : "Perbesar penuh layar"}
            aria-label={isFullscreen ? "Kecilkan kanvas" : "Perbesar penuh layar"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport (Generous Full-Width Height) */}
      <div
        className={`relative w-full flex items-center justify-center overflow-hidden select-none ${
          isFullscreen
            ? "flex-1 min-h-[500px]"
            : "h-[480px] sm:h-[560px] lg:h-[620px]"
        } ${isPaper ? "bg-[#F4F0E6]" : "bg-ink-950"}`}
      >
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
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Dynamic Interactive Inspector HUD Bar on Hover / Select */}
        {activeRoom ? (
          <div
            className={`absolute top-3 left-3 right-3 p-3 backdrop-blur-md rounded-lg shadow-2xl text-[12px] flex items-center justify-between gap-3 pointer-events-none transition-all border ${
              isPaper
                ? "bg-[#FFFFFF]/95 border-[#D4CDBC] text-[#1C1917]"
                : "bg-ink-950/95 border-ink-700 text-bone-100"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-md shrink-0 ${
                  activeViolation
                    ? isPaper
                      ? "bg-[#FBE8E3] text-[#C04523] border border-[#F2BDB0]"
                      : "bg-clay/20 text-clay border border-clay/40"
                    : isPaper
                    ? "bg-[#EAE4D5] text-[#1C1917] border border-[#D4CDBC]"
                    : "bg-bone-100/10 text-bone-100 border border-bone-100/30"
                }`}
              >
                {activeViolation ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-bold text-[14px] truncate ${
                      isPaper ? "text-[#1C1917]" : "text-bone-100"
                    }`}
                  >
                    {activeRoom.name}
                  </span>
                  <span
                    className={`font-mono text-[10.5px] px-2 py-0.5 rounded border uppercase ${
                      isPaper
                        ? "bg-[#F4F0E6] border-[#D4CDBC] text-[#5A5040]"
                        : "bg-ink-900 border-ink-800 text-bone-400"
                    }`}
                  >
                    {activeRoom.type}
                  </span>
                  <span
                    className={`text-[10.5px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      activeViolation
                        ? isPaper
                          ? "bg-[#FBE8E3] text-[#C04523] border border-[#C04523]"
                          : "bg-clay/20 text-clay border border-clay"
                        : isPaper
                        ? "bg-[#E6E0D0] text-[#1C1917] border border-[#C8C0AF]"
                        : "bg-bone-100/10 text-bone-100 border border-bone-100/30"
                    }`}
                  >
                    {activeViolation ? "Perlu Penyesuaian Ruang" : "Sesuai Adat Bali"}
                  </span>
                </div>
                <p
                  className={`text-[12px] truncate mt-0.5 ${
                    isPaper ? "text-[#575249]" : "text-bone-400"
                  }`}
                >
                  Zona:{" "}
                  <strong className={isPaper ? "text-[#1C1917]" : "text-bone-200"}>
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
          <div
            className={`absolute top-3 left-3 right-3 px-3.5 py-2 backdrop-blur-sm rounded-md text-[11.5px] flex items-center justify-between pointer-events-none border ${
              isPaper
                ? "bg-[#F4F0E6]/90 border-[#D4CDBC] text-[#575249]"
                : "bg-ink-950/85 border-ink-800/80 text-bone-400"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Info size={14} className={isPaper ? "text-[#5A5040]" : "text-bone-400"} />
              <span>
                <strong>Panduan Interaktif:</strong> Klik dan geser (drag) untuk memindahkan denah, scroll mouse untuk zoom, atau arahkan kursor ke ruangan
              </span>
            </span>
            <span className="font-mono text-[10.5px] hidden sm:inline opacity-80">
              Scroll: Zoom | Drag: Pan
            </span>
          </div>
        )}

        {/* Bottom Legend Bar */}
        <div
          className={`absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg text-[12px] pointer-events-none border shadow-md ${
            isPaper
              ? "bg-[#FFFFFF]/95 border-[#D4CDBC] text-[#1C1917]"
              : "bg-ink-950/95 border-ink-700 text-bone-100"
          }`}
        >
          <div className="flex items-center gap-4 flex-wrap">
            {/* Compliant: Bone-100 / Deep Ink */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3.5 h-3.5 rounded-sm border inline-block ${
                  isPaper
                    ? "border-[#2E2A24] bg-[#FFFFFF]"
                    : "border-bone-100 bg-bone-100/10"
                }`}
              />
              <span className="font-medium">Sesuai Adat</span>
            </div>
            {/* Violation: Terracotta / Clay */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3.5 h-3.5 rounded-sm border-2 inline-block ${
                  isPaper
                    ? "border-[#C04523] bg-[#FBE8E3]"
                    : "border-clay bg-clay/20"
                }`}
              />
              <span className={isPaper ? "text-[#C04523] font-semibold" : "text-clay font-medium"}>
                Perlu Perbaikan
              </span>
            </div>
            {/* Sacred: Utamaning Utama */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3.5 h-3.5 border border-dashed inline-block ${
                  isPaper
                    ? "border-[#9C7824] bg-[#F6EED8]"
                    : "border-bone-100 bg-bone-100/5"
                }`}
              />
              <span className={isPaper ? "text-[#6B5012]" : "text-bone-400"}>
                Utamaning Utama (Kaja-Kangin)
              </span>
            </div>
          </div>

          <span
            className={`hidden md:inline font-mono text-[11px] ${
              isPaper ? "text-[#6B6356]" : "text-bone-400"
            }`}
          >
            {activeRoom ? `Sorotan: ${activeRoom.name}` : "Peta Spasial Adat Bali"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanCanvas;
