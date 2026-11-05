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
import { useTheme } from "../layout/ThemeProvider";

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
  const { theme: globalTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderAreaRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Sync canvas theme with global theme ("dark" <-> "paper" soft warm lontar)
  const [theme, setTheme] = useState<"dark" | "paper">(
    globalTheme === "light" ? "paper" : "dark"
  );

  useEffect(() => {
    setTheme(globalTheme === "light" ? "paper" : "dark");
  }, [globalTheme]);

  // View state: Overlay Mode (Wireframe / Blueprint X-Ray vs Shaded)
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
      const ratio = Math.min(hRatio, vRatio) * 0.94;
      const renderW = imageObj.width * ratio;
      const renderH = imageObj.height * ratio;
      const centerShiftX = (width - renderW) / 2;
      const centerShiftY = (height - renderH) / 2;
      renderArea = { x: centerShiftX, y: centerShiftY, w: renderW, h: renderH };

      ctx.fillStyle = isPaper ? "#F2ECE1" : "#0E0D0C";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#FAF6EE";
      ctx.fillRect(centerShiftX, centerShiftY, renderW, renderH);
      ctx.restore();

      ctx.drawImage(
        imageObj,
        0,
        0,
        imageObj.width,
        imageObj.height,
        centerShiftX,
        centerShiftY,
        renderW,
        renderH
      );

      ctx.strokeStyle = isPaper ? "rgba(160, 150, 135, 0.6)" : "rgba(80, 75, 70, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(centerShiftX, centerShiftY, renderW, renderH);
    } else {
      ctx.fillStyle = isPaper ? "#F2ECE1" : "#0E0D0C";
      ctx.fillRect(0, 0, width, height);

      // Subtle drafting reference lines
      ctx.strokeStyle = isPaper ? "#E5DEC9" : "#181614";
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

        const info = ZONE_INFO[cell.zone_id] || {
          label: cell.zone_id.replace(/_/g, " "),
          sub: "",
        };

        if (info.isSacred) {
          ctx.fillStyle = isPaper ? "rgba(202, 165, 78, 0.10)" : "rgba(240, 234, 225, 0.04)";
          ctx.fillRect(cx, cy, cw, ch);

          ctx.strokeStyle = isPaper ? "rgba(140, 105, 25, 0.85)" : "rgba(240, 234, 225, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(cx, cy, cw, ch);
          ctx.setLineDash([]);

          const chipW = Math.min(cw - 12, 145);
          const chipH = 18;
          ctx.fillStyle = isPaper ? "rgba(202, 165, 78, 0.24)" : "rgba(240, 234, 225, 0.14)";
          ctx.fillRect(cx + 6, cy + 6, chipW, chipH);
          ctx.strokeStyle = isPaper ? "rgba(140, 105, 25, 0.65)" : "rgba(240, 234, 225, 0.4)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx + 6, cy + 6, chipW, chipH);

          ctx.font = "bold 9px sans-serif";
          ctx.fillStyle = isPaper ? "#5C430E" : "#F0EAE1";
          ctx.textAlign = "left";
          ctx.fillText(
            fitTextWithEllipsis(ctx, "UTAMANING UTAMA (SUCI)", chipW - 10),
            cx + 10,
            cy + 18
          );
        } else {
          ctx.strokeStyle = isPaper ? "rgba(168, 160, 144, 0.7)" : "rgba(58, 53, 47, 0.6)";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, cw, ch);

          ctx.font = "8.5px sans-serif";
          ctx.fillStyle = isPaper ? "rgba(90, 82, 70, 0.75)" : "rgba(168, 159, 141, 0.55)";
          ctx.textAlign = "left";
          const labelText = info.sub ? `${info.label} (${info.sub})` : info.label;
          const fittedLabel = fitTextWithEllipsis(ctx, labelText, cw - 16);
          ctx.fillText(fittedLabel, cx + 8, cy + 16);
        }

        if (info.isCenter) {
          const midX = cx + cw / 2;
          const midY = cy + ch / 2;
          ctx.strokeStyle = isPaper ? "rgba(140, 130, 115, 0.45)" : "rgba(168, 159, 141, 0.25)";
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

    // 3. Draw Room Bounding Boxes
    if (showRooms && rooms) {
      rooms.forEach((room, idx) => {
        const [ymin, xmin, ymax, xmax] = room.box;
        const rx = toPxX(xmin);
        const ry = toPxY(ymin);
        const rw = toPxX(xmax) - rx;
        const rh = toPxY(ymax) - ry;

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
        const isSelected =
          selectedIndex === idx || (selectedRoom != null && selectedRoom.name === room.name);
        const isHighlighted = isHovered || isSelected;
        const isNatah =
          room.type === "natah_open_space" || room.name.toLowerCase().includes("natah");
        const isWireframe = overlayMode === "wireframe";

        if (isViolated) {
          if (isWireframe) {
            ctx.fillStyle = isHighlighted
              ? isPaper
                ? "rgba(184, 67, 34, 0.16)"
                : "rgba(224, 109, 75, 0.22)"
              : "rgba(0, 0, 0, 0)";
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted
                ? "rgba(252, 235, 230, 0.96)"
                : "rgba(252, 235, 230, 0.90)"
              : isHighlighted
              ? "rgba(75, 26, 19, 0.94)"
              : "rgba(52, 20, 15, 0.86)";
          }
          ctx.strokeStyle = isPaper ? "#B84322" : "#E06D4B";
          ctx.lineWidth = isHighlighted ? 2.5 : 1.8;
        } else if (isNatah) {
          if (isWireframe) {
            ctx.fillStyle = isHighlighted
              ? isPaper
                ? "rgba(200, 190, 175, 0.2)"
                : "rgba(240, 234, 225, 0.15)"
              : "rgba(0, 0, 0, 0)";
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted
                ? "rgba(234, 226, 211, 0.45)"
                : "rgba(234, 226, 211, 0.20)"
              : isHighlighted
              ? "rgba(240, 234, 225, 0.12)"
              : "rgba(240, 234, 225, 0.04)";
          }
          ctx.strokeStyle = isPaper
            ? isHighlighted
              ? "#1C1916"
              : "rgba(110, 100, 89, 0.75)"
            : isHighlighted
            ? "#F0EAE1"
            : "rgba(240, 234, 225, 0.55)";
          ctx.lineWidth = isHighlighted ? 2 : 1.5;
        } else {
          if (isWireframe) {
            ctx.fillStyle = isHighlighted
              ? isPaper
                ? "rgba(200, 190, 175, 0.22)"
                : "rgba(240, 234, 225, 0.18)"
              : "rgba(0, 0, 0, 0)";
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted
                ? "rgba(250, 246, 238, 0.98)"
                : "rgba(250, 246, 238, 0.92)"
              : isHighlighted
              ? "rgba(38, 34, 30, 0.96)"
              : "rgba(24, 22, 20, 0.88)";
          }
          ctx.strokeStyle = isPaper
            ? isHighlighted
              ? "#1C1916"
              : "#423B34"
            : isHighlighted
            ? "#F0EAE1"
            : "rgba(240, 234, 225, 0.65)";
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

        if (isHighlighted) {
          ctx.save();
          ctx.strokeStyle = isViolated
            ? isPaper
              ? "#B84322"
              : "#E06D4B"
            : isPaper
            ? "#1C1916"
            : "#F0EAE1";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(rx - 3, ry - 3, rw + 6, rh + 6);
          ctx.restore();
        }

        // 4. Render Room Typography with strict clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();

        const { primary, secondary } = parseRoomName(room.name);
        const headerH = Math.min(22, Math.max(16, rh * 0.32));

        if (isViolated) {
          ctx.fillStyle = isPaper ? "#B84322" : "#C45335";
          ctx.fillRect(rx, ry, rw, headerH);
        } else {
          if (isWireframe) {
            ctx.fillStyle = isPaper
              ? isHighlighted
                ? "rgba(28, 25, 22, 0.88)"
                : "rgba(28, 25, 22, 0.76)"
              : isHighlighted
              ? "rgba(22, 20, 18, 0.90)"
              : "rgba(22, 20, 18, 0.78)";
          } else {
            ctx.fillStyle = isPaper
              ? isHighlighted
                ? "rgba(223, 213, 195, 0.98)"
                : "rgba(234, 226, 211, 0.95)"
              : isHighlighted
              ? "rgba(240, 234, 225, 0.22)"
              : "rgba(240, 234, 225, 0.12)";
          }
          ctx.fillRect(rx, ry, rw, headerH);
        }

        const titleFontSize = Math.min(11, Math.max(8.5, Math.floor(rw / 9.5)));
        ctx.font = `bold ${titleFontSize}px sans-serif`;
        ctx.fillStyle = isViolated
          ? "#FAF6EE"
          : isWireframe
          ? "#FAF6EE"
          : isPaper
          ? "#1C1916"
          : isHighlighted
          ? "#FAF6EE"
          : "#F0EAE1";
        ctx.textAlign = "left";

        const maxTitleW = rw - (isViolated ? 22 : 12);
        const fittedTitle = fitTextWithEllipsis(ctx, primary, maxTitleW);
        ctx.fillText(fittedTitle, rx + 6, ry + headerH - 5);

        if (isViolated) {
          ctx.font = "bold 9px sans-serif";
          ctx.fillStyle = "#FAF6EE";
          ctx.textAlign = "right";
          ctx.fillText("!", rx + rw - 5, ry + headerH - 5);
        }

        if (rh >= 46 && rw >= 55) {
          const subFontSize = Math.min(9, Math.max(7.5, titleFontSize - 1.5));
          ctx.font = `${subFontSize}px sans-serif`;

          if (isViolated) {
            ctx.fillStyle = isPaper ? "#8A2B10" : "#F5B895";
          } else if (isWireframe) {
            ctx.fillStyle = isPaper ? "#1C1916" : "#F0EAE1";
          } else {
            ctx.fillStyle = isPaper ? "#423B34" : "#A89F8D";
          }
          ctx.textAlign = "left";

          const subText = secondary || (room.zone ? room.zone.zone_name : "");
          if (subText) {
            const fittedSub = fitTextWithEllipsis(ctx, subText, rw - 12);
            ctx.fillText(fittedSub, rx + 6, ry + headerH + 13);
          }

          if (rh >= 72 && room.zone) {
            ctx.font = "7.5px font-mono";
            ctx.fillStyle = isPaper ? "rgba(92, 83, 73, 0.8)" : "rgba(168, 159, 141, 0.7)";
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

  useEffect(() => {
    renderCanvas();
    const handleResize = () => renderCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderCanvas]);

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
      className={`border rounded-xl overflow-hidden flex flex-col transition-colors shadow-card bg-ink-900 border-ink-700 ${
        isFullscreen ? "fixed inset-3 sm:inset-6 z-50 shadow-2xl" : ""
      } ${className}`}
    >
      {/* Top Architectural Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 sm:px-4 py-2.5 border-b border-ink-700 bg-ink-950 text-bone-100 text-[13px] gap-2">
        {/* Left: Title, Stats & Kaja Bearing */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold flex items-center gap-1.5 text-bone-100">
            <Compass size={16} className="text-bone-400" aria-hidden="true" />
            <span>Kanvas Tata Ruang</span>
          </span>
          <span className="text-[11.5px] font-mono px-2 py-0.5 rounded bg-ink-900 border border-ink-700 text-bone-300">
            {rooms.length} Ruangan
          </span>
          <span className="hidden sm:inline-block text-[11.5px] font-mono pl-2 border-l border-ink-700 text-bone-400">
            Kaja: {kajaDirection} ({kajaBearing.toFixed(1)}&deg;)
          </span>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Canvas Surface Theme Toggle */}
          <div
            role="group"
            aria-label="Tema latar kanvas"
            className="flex items-center p-0.5 rounded-lg bg-ink-900 border border-ink-700"
          >
            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              className={`min-h-[30px] px-2 py-1 text-[11.5px] font-mono rounded-md flex items-center gap-1 transition-all ${
                theme === "dark"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Latar Kanvas Gelap"
            >
              <Moon size={12} aria-hidden="true" />
              <span className="hidden md:inline">Gelap</span>
            </button>
            <button
              type="button"
              aria-pressed={theme === "paper"}
              onClick={() => setTheme("paper")}
              className={`min-h-[30px] px-2 py-1 text-[11.5px] font-mono rounded-md flex items-center gap-1 transition-all ${
                theme === "paper"
                  ? "bg-bone-100 text-ink-950 font-semibold shadow-sm"
                  : "text-bone-400 hover:text-bone-100"
              }`}
              title="Latar Kertas Lontar (Tidak Silau)"
            >
              <Sun size={12} aria-hidden="true" />
              <span className="hidden md:inline">Kertas</span>
            </button>
          </div>

          {/* Overlay Mode Toggle: Wireframe vs Shaded */}
          {imageSrc && (
            <button
              type="button"
              aria-pressed={overlayMode === "wireframe"}
              onClick={() => setOverlayMode(overlayMode === "wireframe" ? "shaded" : "wireframe")}
              className={`min-h-[32px] px-2.5 py-1 text-[12px] font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                overlayMode === "wireframe"
                  ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                  : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100"
              }`}
              title="Ganti mode kotak ruangan tembus pandang atau blok warna"
            >
              <Box size={13} aria-hidden="true" />
              <span>{overlayMode === "wireframe" ? "Tembus Pandang" : "Blok Warna"}</span>
            </button>
          )}

          {/* Toggle Image Visibility */}
          {imageSrc && (
            <button
              type="button"
              aria-pressed={showImage}
              onClick={() => setShowImage(!showImage)}
              className={`min-h-[32px] px-2.5 py-1 text-[12px] font-medium rounded-lg border transition-colors flex items-center gap-1 ${
                showImage
                  ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                  : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100"
              }`}
              title={showImage ? "Sembunyikan gambar denah asli" : "Tampilkan gambar denah asli"}
            >
              {showImage ? <Eye size={13} aria-hidden="true" /> : <EyeOff size={13} aria-hidden="true" />}
              <span className="hidden lg:inline">{showImage ? "Gambar Asli" : "Sembunyi"}</span>
            </button>
          )}

          {/* Grid Toggle */}
          <button
            type="button"
            aria-pressed={showGrid}
            onClick={() => setShowGrid(!showGrid)}
            className={`min-h-[32px] px-2.5 py-1 text-[12px] font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              showGrid
                ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100"
            }`}
          >
            <Grid3X3 size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Kisi 9 Zona</span>
          </button>

          {/* Rooms Toggle */}
          <button
            type="button"
            aria-pressed={showRooms}
            onClick={() => setShowRooms(!showRooms)}
            className={`min-h-[32px] px-2.5 py-1 text-[12px] font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              showRooms
                ? "bg-bone-100 text-ink-950 border-bone-100 font-semibold"
                : "bg-ink-900 border-ink-700 text-bone-400 hover:text-bone-100"
            }`}
          >
            <Layers size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Kotak Ruang</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center rounded-lg border border-ink-700 bg-ink-900 p-0.5">
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3.5}
              className="p-1.5 rounded text-bone-400 hover:text-bone-100 hover:bg-ink-800 disabled:opacity-40 transition-colors"
              title="Perbesar kanvas"
              aria-label="Perbesar kanvas"
            >
              <ZoomIn size={14} aria-hidden="true" />
            </button>
            <span className="text-[11px] font-mono px-1.5 select-none font-semibold text-bone-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.8}
              className="p-1.5 rounded text-bone-400 hover:text-bone-100 hover:bg-ink-800 disabled:opacity-40 transition-colors"
              title="Perkecil kanvas"
              aria-label="Perkecil kanvas"
            >
              <ZoomOut size={14} aria-hidden="true" />
            </button>
            {(zoom !== 1.0 || pan.x !== 0 || pan.y !== 0) && (
              <button
                type="button"
                onClick={handleResetView}
                className="p-1.5 rounded text-bone-400 hover:text-bone-100 hover:bg-ink-800 transition-colors"
                title="Kembalikan posisi kanvas ke 100%"
                aria-label="Reset posisi kanvas"
              >
                <RotateCcw size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg border border-ink-700 bg-ink-900 text-bone-400 hover:text-bone-100 hover:bg-ink-800 transition-colors"
            title={isFullscreen ? "Keluar layar penuh" : "Perbesar kanvas layar penuh"}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Perbesar kanvas layar penuh"}
          >
            {isFullscreen ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        className={`relative w-full flex items-center justify-center overflow-hidden select-none ${
          isFullscreen
            ? "flex-1 min-h-[500px]"
            : "h-[420px] sm:h-[500px] lg:h-[540px]"
        } ${isPaper ? "bg-[#F2ECE1]" : "bg-[#0E0D0C]"}`}
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
          <div className="absolute top-3 left-3 right-3 p-3 bg-ink-900/95 border border-ink-700 rounded-lg shadow-card text-[12px] flex items-center justify-between gap-3 pointer-events-none">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-md shrink-0 border ${
                  activeViolation
                    ? "bg-clay/15 text-clay border-clay"
                    : "bg-ink-850 text-bone-100 border-ink-600"
                }`}
              >
                {activeViolation ? (
                  <AlertCircle size={17} aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={17} aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[13.5px] text-bone-100 truncate">
                    {activeRoom.name}
                  </span>
                  <span className="font-mono text-[10.5px] px-2 py-0.5 rounded border bg-ink-950 border-ink-700 text-bone-300 uppercase">
                    {activeRoom.type.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-[10.5px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                      activeViolation
                        ? "bg-clay/15 text-clay border-clay"
                        : "bg-ink-850 text-bone-100 border-ink-600"
                    }`}
                  >
                    {activeViolation ? "Perlu Penyesuaian Ruang" : "Sesuai Adat Bali"}
                  </span>
                </div>
                <p className="text-[12px] text-bone-300 truncate mt-0.5">
                  Zona:{" "}
                  <strong className="text-bone-100">
                    {activeRoom.zone?.zone_name ||
                      activeRoom.zone?.zone_id?.replace(/_/g, " ") ||
                      "Terpetakan"}
                  </strong>
                  {activeViolation
                    ? ` · ${activeViolation.issue}`
                    : " · Posisi memenuhi hierarki kesucian Sanga Mandala"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute top-3 left-3 right-3 px-3 py-1.5 bg-ink-900/90 border border-ink-700 rounded-md text-[11.5px] text-bone-300 flex items-center justify-between pointer-events-none">
            <span className="flex items-center gap-1.5">
              <Info size={13} className="text-bone-400 shrink-0" aria-hidden="true" />
              <span>
                Arahkan kursor atau klik kotak ruangan untuk melihat status zona Sanga Mandala
              </span>
            </span>
            <span className="font-mono text-[10.5px] text-bone-400 hidden sm:inline">
              Scroll: Zoom &middot; Geser: Pan
            </span>
          </div>
        )}

        {/* Bottom Legend Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg text-[11.5px] pointer-events-none bg-ink-900/95 border border-ink-700 text-bone-200 shadow-card">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm border border-bone-100 bg-bone-100/15 inline-block" />
              <span className="font-medium text-bone-100">Sesuai Adat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-clay bg-clay/20 inline-block" />
              <span className="text-clay font-semibold">Perlu Perbaikan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm border border-dashed border-bone-200 bg-bone-100/10 inline-block" />
              <span className="text-bone-300">Utamaning Utama (Kaja-Kangin)</span>
            </div>
          </div>

          <span className="hidden md:inline font-mono text-[11px] text-bone-400">
            {activeRoom ? `Sorotan: ${activeRoom.name}` : "Matriks Spasial Sanga Mandala"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanCanvas;
