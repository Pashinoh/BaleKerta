from typing import List, Dict, Any, Tuple

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

def build_sanga_mandala_grid(kaja_quadrant: str = "TOP_RIGHT", plan_north_deg: int = 0) -> Dict[str, Any]:
    """
    Menghasilkan konfigurasi 9 grid Sanga Mandala (skala 0 - 1000)
    berdasarkan orientasi arah Kaja dan orientasi utara denah (plan_north_deg).
    
    plan_north_deg:
      0   = Sisi atas denah menghadap Utara (default)
      90  = Sisi kanan denah menghadap Utara
      180 = Sisi bawah denah menghadap Utara
      270 = Sisi kiri denah menghadap Utara
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

    cells = []
    col_bounds = [(0, 333), (334, 666), (667, 1000)]
    row_bounds = [(0, 333), (334, 666), (667, 1000)]
    
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
