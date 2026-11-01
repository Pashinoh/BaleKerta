import math
from typing import Dict, Any, Tuple, Optional

# Mount Agung Summit Coordinates (Titik Suci Kosmologi Bali)
MOUNT_AGUNG_LAT = -8.3433
MOUNT_AGUNG_LON = 115.5071

# Geographic boundaries of Bali Island (approximate bounding box)
BALI_BOUNDS = {
    "lat_min": -8.95,
    "lat_max": -8.05,
    "lon_min": 114.40,
    "lon_max": 115.75
}

# Pre-mapped Regency Coordinates in Bali
BALI_REGENCIES = {
    "denpasar": {
        "name": "Kota Denpasar",
        "lat": -8.6705,
        "lon": 115.2126,
        "note": "Gunung Agung berada di arah Timur Laut (Kaja-Kangin)"
    },
    "badung": {
        "name": "Kabupaten Badung (Kuta, Seminyak, Canggu, Nusa Dua)",
        "lat": -8.5833,
        "lon": 115.1667,
        "note": "Gunung Agung berada di arah Timur Laut"
    },
    "gianyar": {
        "name": "Kabupaten Gianyar (Ubud, Sukawati)",
        "lat": -8.5069,
        "lon": 115.2625,
        "note": "Gunung Agung berada di arah Timur Laut"
    },
    "tabanan": {
        "name": "Kabupaten Tabanan",
        "lat": -8.5414,
        "lon": 115.1252,
        "note": "Gunung Agung berada di arah Timur Laut / Timur"
    },
    "buleleng": {
        "name": "Kabupaten Buleleng (Singaraja)",
        "lat": -8.1120,
        "lon": 115.0882,
        "note": "Kaja berada di arah Tenggara/Selatan (menghadap ke arah Gunung Agung di selatan)"
    },
    "bangli": {
        "name": "Kabupaten Bangli (Kintamani)",
        "lat": -8.4539,
        "lon": 115.3547,
        "note": "Gunung Agung berada di arah Timur"
    },
    "klungkung": {
        "name": "Kabupaten Klungkung & Nusa Penida",
        "lat": -8.5350,
        "lon": 115.4039,
        "note": "Gunung Agung berada di arah Utara-Timur Laut"
    },
    "karangasem": {
        "name": "Kabupaten Karangasem",
        "lat": -8.4619,
        "lon": 115.6122,
        "note": "Kaja bervariasi bergantung lereng (Barat Laut / Utara)"
    },
    "jembrana": {
        "name": "Kabupaten Jembrana (Negara)",
        "lat": -8.3585,
        "lon": 114.6176,
        "note": "Gunung Agung berada di arah Timur"
    }
}

def is_in_bali(lat: float, lon: float) -> bool:
    """Memeriksa apakah koordinat berada di dalam area Pulau Bali."""
    return (
        BALI_BOUNDS["lat_min"] <= lat <= BALI_BOUNDS["lat_max"] and
        BALI_BOUNDS["lon_min"] <= lon <= BALI_BOUNDS["lon_max"]
    )

def calculate_haversine_distance(
    lat1: float, lon1: float,
    lat2: float = MOUNT_AGUNG_LAT, lon2: float = MOUNT_AGUNG_LON
) -> float:
    """Menghitung jarak lengkung bumi (km) ke puncak Gunung Agung."""
    R = 6371.0 # Jari-jari bumi rata-rata (km)
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_geodesic_bearing(
    lat1: float, lon1: float,
    lat2: float = MOUNT_AGUNG_LAT, lon2: float = MOUNT_AGUNG_LON
) -> float:
    """
    Menghitung sudut bantalan (azimuth / bearing) dari koordinat tapak ke puncak Gunung Agung.
    Formula:
      θ = atan2( sin Δλ ⋅ cos φ2 , cos φ1 ⋅ sin φ2 − sin φ1 ⋅ cos φ2 ⋅ cos Δλ )
    Hasil dikembalikan dalam derajat (0° - 360° dari Utara Sejati).
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)
    
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    
    initial_bearing = math.atan2(y, x)
    bearing_deg = (math.degrees(initial_bearing) + 360) % 360
    return round(bearing_deg, 2)

def get_cardinal_direction(bearing: float) -> str:
    """Mengonversi derajat azimuth ke nama mata angin standar."""
    directions = [
        "Utara (N)", "Utara-Timur Laut (NNE)", "Timur Laut (NE)", "Timur-Timur Laut (ENE)",
        "Timur (E)", "Timur-Tenggara (ESE)", "Tenggara (SE)", "Selatan-Tenggara (SSE)",
        "Selatan (S)", "Selatan-Barat Daya (SSW)", "Barat Daya (SW)", "Barat-Barat Daya (WSW)",
        "Barat (W)", "Barat-Barat Laut (WNW)", "Barat Laut (NW)", "Utara-Barat Laut (NNW)"
    ]
    idx = int((bearing + 11.25) / 22.5) % 16
    return directions[idx]

def find_nearest_regency(lat: float, lon: float) -> Tuple[str, str]:
    """Mencari kabupaten Bali terdekat dengan koordinat tapak."""
    min_dist = float("inf")
    best_key = "denpasar"
    best_name = "Kota Denpasar"
    for key, data in BALI_REGENCIES.items():
        d = (lat - data["lat"]) ** 2 + (lon - data["lon"]) ** 2
        if d < min_dist:
            min_dist = d
            best_key = key
            best_name = data["name"]
    return best_key, best_name

def resolve_kaja_vector(
    regency_key: Optional[str] = None,
    custom_lat: Optional[float] = None,
    custom_lon: Optional[float] = None
) -> Dict[str, Any]:
    """
    Mengembalikan data orientasi Kaja untuk wilayah atau koordinat spesifik di Bali.
    """
    regency_info = None
    in_bali = True

    if custom_lat is not None and custom_lon is not None:
        lat = custom_lat
        lon = custom_lon
        in_bali = is_in_bali(lat, lon)
        _, nearest_name = find_nearest_regency(lat, lon)
        location_label = f"Lokasi Tanah ({lat:.4f}, {lon:.4f}) · dekat {nearest_name}"
    elif regency_key and regency_key.lower() in BALI_REGENCIES:
        regency_info = BALI_REGENCIES[regency_key.lower()]
        lat = regency_info["lat"]
        lon = regency_info["lon"]
        location_label = regency_info["name"]
    else:
        # Default: Denpasar
        regency_info = BALI_REGENCIES["denpasar"]
        lat = regency_info["lat"]
        lon = regency_info["lon"]
        location_label = regency_info["name"]
        
    bearing = calculate_geodesic_bearing(lat, lon)
    cardinal = get_cardinal_direction(bearing)
    distance_km = calculate_haversine_distance(lat, lon)
    
    # Menentukan kuadran Kaja pada denah 2D
    # Jika arah Gunung Agung condong ke Timur Laut / Utara (Bali Selatan: Denpasar/Badung) -> TOP_RIGHT
    # Jika condong ke Tenggara / Selatan (Bali Utara: Singaraja/Buleleng) -> BOTTOM_RIGHT
    if 0 <= bearing < 90:
        kaja_quadrant = "TOP_RIGHT"
        kaja_side = "TOP"
    elif 90 <= bearing < 180:
        kaja_quadrant = "BOTTOM_RIGHT"
        kaja_side = "BOTTOM"
    elif 180 <= bearing < 270:
        kaja_quadrant = "BOTTOM_LEFT"
        kaja_side = "BOTTOM"
    else:
        kaja_quadrant = "TOP_LEFT"
        kaja_side = "TOP"
        
    return {
        "location": location_label,
        "latitude": lat,
        "longitude": lon,
        "in_bali": in_bali,
        "distance_km": distance_km,
        "mount_agung_target": {
            "lat": MOUNT_AGUNG_LAT,
            "lon": MOUNT_AGUNG_LON
        },
        "bearing_degrees": bearing,
        "cardinal_direction": cardinal,
        "kaja_quadrant": kaja_quadrant,
        "kaja_side": kaja_side,
        "note": regency_info.get("note", "") if regency_info else "Orientasi dihitung via Geodesic Azimuth"
    }
