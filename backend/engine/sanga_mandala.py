from typing import List, Dict, Any, Tuple, Optional

# Standar 9 Zona Sanga Mandala
ZONE_KEYS = [
    "UTAMANING_UTAMA", "MADYANING_UTAMA", "NISTANING_UTAMA",
    "UTAMANING_MADYA", "MADYANING_MADYA", "NISTANING_MADYA",
    "UTAMANING_NISTA", "MADYANING_NISTA", "NISTANING_NISTA"
]

def rotate_matrix_clockwise(matrix: List[List[str]], steps: int) -> List[List[str]]:
    """Memutar matriks 3x3 searah jarum jam sebanyak langkah (90 deg per langkah)."""
    res = [row[:] for row in matrix]
    for _ in range(steps % 4):
        res = [list(x) for x in zip(*res[::-1])]
    return res

def compute_compound_bounds(rooms: List[Dict[str, Any]]) -> Optional[List[int]]:
    """
    Menghitung batas amplop tapak (bounding envelope) [ymin, xmin, ymax, xmax]
    dari sekumpulan ruangan yang terdeteksi agar grid 3x3 Sanga Mandala
    tidak terdorong oleh margin kertas kosong atau kolom legenda di tepi gambar.
    """
    valid_boxes = [r["box"] for r in rooms if isinstance(r.get("box"), (list, tuple)) and len(r["box"]) == 4]
    if len(valid_boxes) < 3:
        return None

    min_y = min(b[0] for b in valid_boxes)
    min_x = min(b[1] for b in valid_boxes)
    max_y = max(b[2] for b in valid_boxes)
    max_x = max(b[3] for b in valid_boxes)

    span_y = max_y - min_y
    span_x = max_x - min_x
    if span_y < 120 or span_x < 120:
        return None

    # Tambahkan sedikit margin dinding penyengker (2% dari rentang)
    pad_y = max(5, int(round(span_y * 0.02)))
    pad_x = max(5, int(round(span_x * 0.02)))

    return [
        max(0, min_y - pad_y),
        max(0, min_x - pad_x),
        min(1000, max_y + pad_y),
        min(1000, max_x + pad_x)
    ]

def build_sanga_mandala_grid(
    kaja_quadrant: str = "TOP_RIGHT",
    plan_north_deg: int = 0,
    bounds: Optional[List[int]] = None
) -> Dict[str, Any]:
    """
    Menghasilkan konfigurasi 9 grid Sanga Mandala (skala 0 - 1000)
    berdasarkan orientasi arah Kaja dan orientasi utara denah (plan_north_deg).
    Jika bounds=[ymin, xmin, ymax, xmax] diberikan, kisi 3x3 diproyeksikan
    mengikuti batas tapak bangunan sebenarnya (bukan margin kertas).
    """
    # Matriks pemetaan baris dan kolom ke Zona Adat dengan Utara di sisi atas
    if kaja_quadrant == "TOP_RIGHT":
        # Kasus umum Bali Selatan (Denpasar, Badung, Gianyar, Tabanan)
        # Kaja-Kangin di Pojok Kanan Atas (Row 0, Col 2)
        base_matrix = [
            ["NISTANING_UTAMA", "MADYANING_UTAMA", "UTAMANING_UTAMA"],
            ["NISTANING_MADYA", "MADYANING_MADYA", "UTAMANING_MADYA"],
            ["NISTANING_NISTA", "MADYANING_NISTA", "UTAMANING_NISTA"]
        ]
    elif kaja_quadrant == "BOTTOM_RIGHT":
        # Kasus Bali Utara (Buleleng / Singaraja) - Gunung Agung di Tenggara/Selatan
        # Kaja-Kangin di Pojok Kanan Bawah (Row 2, Col 2)
        base_matrix = [
            ["NISTANING_NISTA", "MADYANING_NISTA", "UTAMANING_NISTA"],
            ["NISTANING_MADYA", "MADYANING_MADYA", "UTAMANING_MADYA"],
            ["NISTANING_UTAMA", "MADYANING_UTAMA", "UTAMANING_UTAMA"]
        ]
    elif kaja_quadrant == "TOP_LEFT":
        # Lereng Timur Karangasem
        base_matrix = [
            ["UTAMANING_UTAMA", "MADYANING_UTAMA", "NISTANING_UTAMA"],
            ["UTAMANING_MADYA", "MADYANING_MADYA", "NISTANING_MADYA"],
            ["UTAMANING_NISTA", "MADYANING_NISTA", "NISTANING_NISTA"]
        ]
    else: # BOTTOM_LEFT
        base_matrix = [
            ["UTAMANING_NISTA", "MADYANING_NISTA", "NISTANING_NISTA"],
            ["UTAMANING_MADYA", "MADYANING_MADYA", "NISTANING_MADYA"],
            ["UTAMANING_UTAMA", "MADYANING_UTAMA", "NISTANING_UTAMA"]
        ]

    # Putar matriks searah jarum jam sesuai nilai plan_north_deg
    steps = (int(plan_north_deg) // 90) % 4
    grid_matrix = rotate_matrix_clockwise(base_matrix, steps) if steps > 0 else base_matrix

    if bounds and len(bounds) == 4 and bounds[0] < bounds[2] and bounds[1] < bounds[3]:
        by0, bx0, by3, bx3 = bounds
        dy = (by3 - by0) / 3.0
        dx = (bx3 - bx0) / 3.0
        y1 = int(round(by0 + dy))
        y2 = int(round(by0 + 2 * dy))
        x1 = int(round(bx0 + dx))
        x2 = int(round(bx0 + 2 * dx))
        row_bounds = [(by0, y1), (y1 + 1, y2), (y2 + 1, by3)]
        col_bounds = [(bx0, x1), (x1 + 1, x2), (x2 + 1, bx3)]
        lot_bounds = [by0, bx0, by3, bx3]
    else:
        col_bounds = [(0, 333), (334, 666), (667, 1000)]
        row_bounds = [(0, 333), (334, 666), (667, 1000)]
        lot_bounds = [0, 0, 1000, 1000]
    
    cells = []
    sacred_cell_coords = None
    for r_idx, (ymin, ymax) in enumerate(row_bounds):
        for c_idx, (xmin, xmax) in enumerate(col_bounds):
            zone_id = grid_matrix[r_idx][c_idx]
            if zone_id == "UTAMANING_UTAMA":
                sacred_cell_coords = (r_idx, c_idx)
            cells.append({
                "row": r_idx,
                "col": c_idx,
                "zone_id": zone_id,
                "box": [ymin, xmin, ymax, xmax],
                "center": [(ymin + ymax) / 2, (xmin + xmax) / 2]
            })
            
    return {
        "kaja_quadrant": kaja_quadrant,
        "plan_north_deg": plan_north_deg,
        "sacred_row_col": sacred_cell_coords,
        "lot_bounds": lot_bounds,
        "grid_matrix": grid_matrix,
        "cells": cells
    }

def map_room_to_zone(room_box: List[int], grid_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Menerima box ruangan [ymin, xmin, ymax, xmax] dan mencocokkan titik tengah (centroid)
    ke salah satu dari 9 sel Sanga Mandala.
    """
    ymin, xmin, ymax, xmax = room_box
    center_y = (ymin + ymax) / 2
    center_x = (xmin + xmax) / 2
    
    matched_cell = None
    for cell in grid_config["cells"]:
        c_ymin, c_xmin, c_ymax, c_xmax = cell["box"]
        if c_ymin <= center_y <= c_ymax and c_xmin <= center_x <= c_xmax:
            matched_cell = cell
            break
            
    # Fallback jika di tepi ekstrim
    if not matched_cell:
        min_dist = float("inf")
        for cell in grid_config["cells"]:
            cy, cx = cell["center"]
            dist = (center_y - cy) ** 2 + (center_x - cx) ** 2
            if dist < min_dist:
                min_dist = dist
                matched_cell = cell
                
    return matched_cell
