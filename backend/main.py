import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from engine.azimuth import BALI_REGENCIES, resolve_kaja_vector
from engine.sanga_mandala import build_sanga_mandala_grid, map_room_to_zone
from engine.vision_parser import parse_floor_plan_image
from engine.audit_checker import run_spatial_audit, load_perda_rules

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Engine Audit Spasial Denah Berbasis Asta Kosala-Kosali & Perda Bali No. 5/2005"
)

# Setup CORS (Supports Localhost & Any Vercel / Cloud Domain)
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
def run_preset_audit(preset_id: str):
    """Menjalankan evaluasi audit instan untuk preset denah demo."""
    target_file = settings.PRESETS_DIR / f"{preset_id}.json"
    if not target_file.exists():
        raise HTTPException(status_code=404, detail="Preset tidak ditemukan")
        
    with open(target_file, "r", encoding="utf-8") as f:
        preset_data = json.load(f)
        
    regency = preset_data.get("regency", "gianyar")
    raw_rooms = preset_data.get("rooms", [])
    
    # 1. Hitung orientasi Kaja
    kaja_vector = resolve_kaja_vector(regency)
    
    # 2. Bangun 9 grid Sanga Mandala
    grid_config = build_sanga_mandala_grid(kaja_vector["kaja_quadrant"])
    
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
    custom_lat: Optional[float] = Form(None),
    custom_lon: Optional[float] = Form(None),
    hasta_cm: Optional[float] = Form(45.0)
):
    """
    Endpoint audit utama:
    Menerima upload gambar denah -> AI Vision -> Sanga Mandala Math -> Audit Perda.
    """
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File kosong")
        
    # 1. AI Vision Parsing (dengan Caching)
    try:
        vision_result = await parse_floor_plan_image(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses gambar AI: {str(e)}")
        
    raw_rooms = vision_result.get("rooms", [])
    if not raw_rooms:
        raise HTTPException(status_code=422, detail="AI tidak mendeteksi ruangan pada denah yang diunggah.")
        
    # 2. Hitung vektor arah Gunung Agung
    kaja_vector = resolve_kaja_vector(regency, custom_lat, custom_lon)
    
    # 3. Proyeksikan 9 Grid Sanga Mandala
    grid_config = build_sanga_mandala_grid(kaja_vector["kaja_quadrant"])
    
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
        "image_hash": vision_result.get("image_hash"),
        "kaja_vector": kaja_vector,
        "hasta_antropometri_cm": hasta_cm,
        "grid_layout": grid_config,
        "rooms": mapped_rooms,
        "audit_report": audit_results
    }
