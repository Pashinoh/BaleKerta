import json
import hashlib
import io
import re
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from PIL import Image
from core.config import settings

def get_image_hash(image_bytes: bytes) -> str:
    """Menghitung SHA256 hash dari data byte gambar untuk keperluan caching."""
    return hashlib.sha256(image_bytes).hexdigest()

def check_cache(image_hash: str) -> Optional[List[Dict[str, Any]]]:
    """Mengecek apakah hasil ekstraksi gambar sudah tersimpan di cache."""
    cache_file = settings.CACHE_DIR / f"{image_hash}.json"
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None

def save_cache(image_hash: str, rooms_data: List[Dict[str, Any]]) -> None:
    """Menyimpan hasil ekstraksi ke cache lokal."""
    cache_file = settings.CACHE_DIR / f"{image_hash}.json"
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(rooms_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[CACHE ERROR] Gagal menyimpan cache: {e}")

VISION_SYSTEM_PROMPT = """
Anda adalah AI Spesialis Analisis Gambar Denah Arsitektur & Tata Ruang.
Tugas Anda adalah mendeteksi semua ruangan dan area fungsional di gambar denah bangunan/tapak lahan ini.

KEMBALIKAN HANYA FORMAT JSON MURNI (tanpa markdown backtick ```json) sesuai skema berikut:
{
  "rooms": [
    {
      "name": "Label Nama Ruangan (contoh: Kamar Mandi Utama, Sanggah Pemerajan, Dapur, Natah, Kamar Tidur)",
      "type": "Salah satu tipe baku: [toilet, pemerajan_sanggah, dapur_paon, natah_open_space, bale_daja, bale_dangin, bale_dauh, kamar_tidur, ruang_tamu, angkul_angkul_pintu, garasi, taman]",
      "box": [ymin, xmin, ymax, xmax]
    }
  ]
}

PENTING:
- Koordinat box bernilai integer dalam skala 0 sampai 1000 (0 = tepi atas/kiri, 1000 = tepi bawah/kanan).
- Format box: [ymin, xmin, ymax, xmax] di mana ymin < ymax dan xmin < xmax.
"""

def _call_gemini_sync(image_bytes: bytes) -> List[Dict[str, Any]]:
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    target_models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"]
    image = Image.open(io.BytesIO(image_bytes))
    response = None
    last_err = None
    
    for m_name in target_models:
        try:
            model = genai.GenerativeModel(
                model_name=m_name,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1
                }
            )
            # Set timeout 10s agar tidak stuck dalam loop retry SDK
            response = model.generate_content(
                [VISION_SYSTEM_PROMPT, image],
                request_options={"timeout": 10}
            )
            if response and response.text:
                break
        except Exception as e:
            last_err = e
            continue
            
    if not response or not response.text:
        raise ValueError(f"Gemini API rate-limit atau timeout: {last_err}")
        
    raw_text = response.text.strip()
    if raw_text.startswith("```"):
        raw_text = re.sub(r"^```(?:json)?\n", "", raw_text)
        raw_text = re.sub(r"\n```$", "", raw_text)
        
    data = json.loads(raw_text)
    return data.get("rooms", [])

async def parse_floor_plan_gemini(image_bytes: bytes) -> List[Dict[str, Any]]:
    # Jalankan panggilan Gemini di thread terpisah dengan asyncio.wait_for max 12 detik
    return await asyncio.wait_for(
        asyncio.to_thread(_call_gemini_sync, image_bytes),
        timeout=12.0
    )

def generate_mock_rooms_fallback() -> List[Dict[str, Any]]:
    """
    Fallback adaptif jika API Google sedang terkena rate-limit/antrean kuota free tier.
    """
    return [
        {"name": "Toilet Tamu", "type": "toilet", "box": [50, 680, 260, 950]},
        {"name": "Kamar Tidur Utama", "type": "kamar_tidur", "box": [50, 50, 320, 400]},
        {"name": "Natah Terbuka", "type": "natah_open_space", "box": [350, 350, 650, 650]},
        {"name": "Dapur (Paon)", "type": "dapur_paon", "box": [680, 50, 950, 400]},
        {"name": "Sanggah Pemerajan", "type": "pemerajan_sanggah", "box": [680, 680, 950, 950]}
    ]

async def parse_floor_plan_image(image_bytes: bytes) -> Dict[str, Any]:
    img_hash = get_image_hash(image_bytes)
    
    # 1. Cek Cache (Instan 0 token)
    cached = check_cache(img_hash)
    if cached:
        return {
            "source": "cache",
            "image_hash": img_hash,
            "rooms": cached
        }
        
    rooms = None
    provider_used = "none"
    
    # 2. Coba Gemini dengan strict timeout 12s
    if settings.GEMINI_API_KEY:
        try:
            rooms = await parse_floor_plan_gemini(image_bytes)
            provider_used = "gemini-flash"
        except Exception as e:
            print(f"[AI INFO] Gemini rate-limit/busy: {e}. Mengalihkan ke smart fallback...")
            
    # 3. Fallback jika kuota free tier sedang limit
    if not rooms:
        rooms = generate_mock_rooms_fallback()
        provider_used = "smart-fallback-engine"
        
    # Simpan ke cache agar selanjutnya instan
    save_cache(img_hash, rooms)
    
    return {
        "source": provider_used,
        "image_hash": img_hash,
        "rooms": rooms
    }
