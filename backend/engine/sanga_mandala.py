from typing import List, Dict, Any, Tuple

# Standar 9 Zona Sanga Mandala
ZONE_KEYS = [
    "UTAMANING_UTAMA", "MADYANING_UTAMA", "NISTANING_UTAMA",
    "UTAMANING_MADYA", "MADYANING_MADYA", "NISTANING_MADYA",
    "UTAMANING_NISTA", "MADYANING_NISTA", "NISTANING_NISTA"
]

def build_sanga_mandala_grid(kaja_quadrant: str = "TOP_RIGHT") -> Dict[str, Any]:
    """
    Menghasilkan konfigurasi 9 grid Sanga Mandala (skala 0 - 1000)
    berdasarkan orientasi arah Kaja (Gunung Agung).
    
    Grid 3x3:
    Row 0: y: 0 - 333 (Atas)
    Row 1: y: 334 - 666 (Tengah)
    Row 2: y: 667 - 1000 (Bawah)
    
    Col 0: x: 0 - 333 (Kiri)
    Col 1: x: 334 - 666 (Tengah)
    Col 2: x: 667 - 1000 (Kanan)
    """
    # Matriks pemetaan baris dan kolom ke Zona Adat
    if kaja_quadrant == "TOP_RIGHT":
        # Kasus umum Bali Selatan (Denpasar, Badung, Gianyar, Tabanan)
        # Kaja-Kangin di Pojok Kanan Atas (Row 0, Col 2)
        grid_matrix = [
            ["NISTANING_UTAMA", "MADYANING_UTAMA", "UTAMANING_UTAMA"],
            ["NISTANING_MADYA", "MADYANING_MADYA", "UTAMANING_MADYA"],
            ["NISTANING_NISTA", "MADYANING_NISTA", "UTAMANING_NISTA"]
        ]
    elif kaja_quadrant == "BOTTOM_RIGHT":
        # Kasus Bali Utara (Buleleng / Singaraja) - Gunung Agung di Tenggara/Selatan
        # Kaja-Kangin di Pojok Kanan Bawah (Row 2, Col 2)
        grid_matrix = [
            ["NISTANING_NISTA", "MADYANING_NISTA", "UTAMANING_NISTA"],
            ["NISTANING_MADYA", "MADYANING_MADYA", "UTAMANING_MADYA"],
            ["NISTANING_UTAMA", "MADYANING_UTAMA", "UTAMANING_UTAMA"]
        ]
    elif kaja_quadrant == "TOP_LEFT":
        # Lereng Timur Karangasem
        grid_matrix = [
            ["UTAMANING_UTAMA", "MADYANING_UTAMA", "NISTANING_UTAMA"],
            ["UTAMANING_MADYA", "MADYANING_MADYA", "NISTANING_MADYA"],
            ["UTAMANING_NISTA", "MADYANING_NISTA", "NISTANING_NISTA"]
        ]
    else: # BOTTOM_LEFT
        grid_matrix = [
            ["UTAMANING_NISTA", "MADYANING_NISTA", "NISTANING_NISTA"],
            ["UTAMANING_MADYA", "MADYANING_MADYA", "NISTANING_MADYA"],
            ["UTAMANING_UTAMA", "MADYANING_UTAMA", "NISTANING_UTAMA"]
        ]
        
    cells = []
    col_bounds = [(0, 333), (334, 666), (667, 1000)]
    row_bounds = [(0, 333), (334, 666), (667, 1000)]
    
    for r_idx, (ymin, ymax) in enumerate(row_bounds):
        for c_idx, (xmin, xmax) in enumerate(col_bounds):
            zone_id = grid_matrix[r_idx][c_idx]
            cells.append({
                "row": r_idx,
                "col": c_idx,
                "zone_id": zone_id,
                "box": [ymin, xmin, ymax, xmax],
                "center": [(ymin + ymax) / 2, (xmin + xmax) / 2]
            })
            
    return {
        "kaja_quadrant": kaja_quadrant,
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
        # Cari sel terdekat berdasarkan jarak Euclidean
        min_dist = float("inf")
        for cell in grid_config["cells"]:
            cy, cx = cell["center"]
            dist = (center_y - cy) ** 2 + (center_x - cx) ** 2
            if dist < min_dist:
                min_dist = dist
                matched_cell = cell
                
    return {
        "zone_id": matched_cell["zone_id"],
        "grid_row": matched_cell["row"],
        "grid_col": matched_cell["col"],
        "centroid": [round(center_y, 1), round(center_x, 1)]
    }
