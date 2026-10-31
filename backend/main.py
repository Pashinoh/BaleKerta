import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from engine.azimuth import (
    BALI_REGENCIES,
    MOUNT_AGUNG_LAT,
    MOUNT_AGUNG_LON,
    resolve_kaja_vector,
    is_in_bali
)
from engine.sanga_mandala import build_sanga_mandala_grid, map_room_to_zone
from engine.vision_parser import parse_floor_plan_image
from engine.audit_checker import run_spatial_audit, load_perda_rules

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Engine Audit Spasial Denah Berbasis Asta Kosala-Kosali & Perda Bali No. 5/2005"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "groq_configured": bool(settings.GROQ_API_KEY),
        "cache_dir_ready": settings.CACHE_DIR.exists()
    }

@app.get("/api/kaja")
def get_kaja_endpoint(
    lat: float = Query(..., description="Latitude tapak tanah"),
    lon: float = Query(..., description="Longitude tapak tanah")
):
    """
    Menghitung vektor arah Kaja (menuju puncak Gunung Agung) secara instan berbasis geodesik.
    Cepat, deterministik, tanpa pemanggilan AI.
    """
    vector = resolve_kaja_vector(custom_lat=lat, custom_lon=lon)
    in_bali = vector["in_bali"]

    return {
        "latitude": lat,
        "longitude": lon,
        "in_bali": in_bali,
        "bearing_degrees": vector["bearing_degrees"],
        "cardinal_direction": vector["cardinal_direction"],
        "kaja_quadrant": vector["kaja_quadrant"],
        "distance_km": vector["distance_km"],
        "location_label": vector["location"],
        "target": {
            "lat": MOUNT_AGUNG_LAT,
            "lon": MOUNT_AGUNG_LON,
            "label": "Puncak Gunung Agung (Titik Suci)"
        },
        "message": (
            "Koordinat berada di dalam Pulau Bali."
            if in_bali
            else "Pilih lokasi di dalam Pulau Bali."
        )
    }

@app.get("/api/regencies")
def get_regencies():
    """Mengembalikan daftar kabupaten di Bali beserta orientasi sudut Gunung Agung."""
    results = {}
    for key, data in BALI_REGENCIES.items():
        vector = resolve_kaja_vector(key)
        results[key] = {
            **data,
            **vector
        }
    return results

@app.get("/api/rules")
def get_rules():
    """Mengembalikan basis pengetahuan Perda No. 5/2005 dan Asta Kosala-Kosali."""
    return load_perda_rules()

@app.get("/api/presets")
def get_presets():
    """Mengembalikan daftar denah preset untuk pengujian instan tanpa kuota API."""
    presets = []
    for file in sorted(settings.PRESETS_DIR.glob("*.json")):
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                presets.append({
                    "id": data.get("id"),
                    "title": data.get("title"),
                    "regency": data.get("regency"),
                    "description": data.get("description"),
                    "expected_status": data.get("expected_status")
                })
        except Exception:
            continue
    return presets

@app.get("/api/presets/{preset_id}")
def run_preset_audit(
    preset_id: str,
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    plan_north_deg: int = Query(0)
):
    """Menjalankan evaluasi audit instan untuk preset denah demo dengan rotasi orientasi."""
    target_file = settings.PRESETS_DIR / f"{preset_id}.json"
    if not target_file.exists():
        raise HTTPException(status_code=404, detail="Preset tidak ditemukan")
        
    with open(target_file, "r", encoding="utf-8") as f:
        preset_data = json.load(f)
        
    raw_rooms = preset_data.get("rooms", [])
    
    # 1. Hitung orientasi Kaja
    if lat is not None and lon is not None:
        kaja_vector = resolve_kaja_vector(custom_lat=lat, custom_lon=lon)
    else:
        regency = preset_data.get("regency", "gianyar")
        kaja_vector = resolve_kaja_vector(regency)
    
    # 2. Bangun 9 grid Sanga Mandala (dengan orientasi utara denah)
    grid_config = build_sanga_mandala_grid(kaja_vector["kaja_quadrant"], plan_north_deg)
    
    # 3. Petakan ruangan ke zona
    mapped_rooms = []
    for r in raw_rooms:
        zone_info = map_room_to_zone(r["box"], grid_config)
        mapped_rooms.append({
            **r,
            "zone": zone_info
        })
        
    # 4. Audit kepatuhan
    audit_results = run_spatial_audit(mapped_rooms, grid_config)
    
    return {
        "status": "success",
        "source": "preset",
        "mode": "preset",
        "preset_id": preset_id,
        "title": preset_data.get("title"),
        "kaja_vector": kaja_vector,
        "grid_layout": grid_config,
        "rooms": mapped_rooms,
        "audit_report": audit_results
    }

@app.post("/api/audit")
async def audit_floor_plan(
    file: UploadFile = File(...),
    regency: Optional[str] = Form("denpasar"),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
    custom_lat: Optional[float] = Form(None),
    custom_lon: Optional[float] = Form(None),
    plan_north_deg: int = Form(0),
    hasta_cm: Optional[float] = Form(44.5)
):
    """
    Endpoint audit utama:
    Menerima upload gambar denah -> AI Vision Asli -> Sanga Mandala Math -> Audit Perda.
    """
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File gambar kosong.")
        
    # 1. AI Vision Parsing (Asli, dengan caching)
    try:
        vision_result = await parse_floor_plan_image(contents)
    except Exception as e:
        err_msg = str(e)
        err_lower = err_msg.lower()
        if "quota" in err_lower or "resourceexhausted" in err_lower or "429" in err_lower:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "retry_after_s": 40,
                    "message": "Layanan AI sedang mencapai batas kuota free-tier Google. Silakan coba lagi dalam 40 detik."
                }
            )
        return JSONResponse(
            status_code=503,
            content={
                "error": "ai_unavailable",
                "message": f"Layanan AI tidak dapat membaca denah ini: {err_msg}"
            }
        )
        
    raw_rooms = vision_result.get("rooms", [])
    if not raw_rooms:
        return JSONResponse(
            status_code=422,
            content={
                "error": "no_rooms_detected",
                "message": "Model AI tidak mendeteksi teks batas ruangan pada denah yang diunggah. Pastikan gambar denah memiliki tulisan label ruangan yang jelas."
            }
        )
        
    # 2. Hitung vektor arah Gunung Agung
    target_lat = lat if lat is not None else custom_lat
    target_lon = lon if lon is not None else custom_lon
    kaja_vector = resolve_kaja_vector(regency, target_lat, target_lon)
    
    # 3. Proyeksikan 9 Grid Sanga Mandala dengan rotasi orientasi denah
    grid_config = build_sanga_mandala_grid(kaja_vector["kaja_quadrant"], plan_north_deg)
    
    # 4. Petakan koordinat ruangan ke zona adat
    mapped_rooms = []
    for r in raw_rooms:
        zone_info = map_room_to_zone(r["box"], grid_config)
        mapped_rooms.append({
            **r,
            "zone": zone_info
        })
        
    # 5. Jalankan audit deterministik Perda No. 5/2005
    audit_results = run_spatial_audit(mapped_rooms, grid_config)
    
    return {
        "status": "success",
        "source": vision_result.get("source"),
        "model": vision_result.get("model"),
        "image_hash": vision_result.get("image_hash"),
        "kaja_vector": kaja_vector,
        "grid_layout": grid_config,
        "rooms": mapped_rooms,
        "audit_report": audit_results
    }
