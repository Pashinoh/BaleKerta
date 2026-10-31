import json
import hashlib
import io
import re
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
- Deteksi setepat mungkin nama ruangan berdasarkan teks label di denah atau simbol arsitektur (simbol kloset untuk toilet, simbol kompor/bak untuk dapur, halaman terbuka tengah untuk natah).
"""

async def parse_floor_plan_gemini(image_bytes: bytes) -> List[Dict[str, Any]]:
    """Memanggil Google Gemini Vision untuk mendeteksi ruangan."""
    import google.generativeai as genai
    
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY belum dikonfigurasi di file .env")
        
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # Prioritaskan gemini-2.5-flash atau gemini-flash-latest
    target_models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"]
    response = None
    last_err = None
    
    image = Image.open(io.BytesIO(image_bytes))
    
    for m_name in target_models:
        try:
            model = genai.GenerativeModel(
                model_name=m_name,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1
                }
            )
            response = model.generate_content([VISION_SYSTEM_PROMPT, image])
            if response and response.text:
                break
        except Exception as e:
            last_err = e
            continue
            
    if not response or not response.text:
        raise ValueError(f"Gagal generate content dengan Gemini: {last_err}")
    
    raw_text = response.text.strip()
    # Bersihkan markdown jika ada
    if raw_text.startswith("```"):
        raw_text = re.sub(r"^```(?:json)?\n", "", raw_text)
        raw_text = re.sub(r"\n```$", "", raw_text)
        
    data = json.loads(raw_text)
    return data.get("rooms", [])

async def parse_floor_plan_groq(image_bytes: bytes) -> List[Dict[str, Any]]:
    """Memanggil Groq Vision (qwen/qwen3.8-27b) sebagai secondary fallback."""
    import base64
    from groq import Groq
    
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY belum dikonfigurasi di file .env")
        
    client = Groq(api_key=settings.GROQ_API_KEY)
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": VISION_SYSTEM_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64_image}"
                        }
                    }
                ]
            }
        ],
        model="qwen/qwen3.8-27b",
        response_format={"type": "json_object"},
        temperature=0.1
    )
    
    raw_text = chat_completion.choices[0].message.content
    data = json.loads(raw_text)
    return data.get("rooms", [])

def generate_mock_rooms_fallback() -> List[Dict[str, Any]]:
    """
    Fallback mock rooms jika API key belum diisi,
    memastikan proses pengembangan lokal tidak pernah crash.
    """
    return [
        {"name": "Sanggah Pemerajan", "type": "pemerajan_sanggah", "box": [50, 700, 250, 950]},
        {"name": "Bale Daja (Gedong Meten)", "type": "bale_daja", "box": [60, 350, 280, 650]},
        {"name": "Bale Dangin (Upacara)", "type": "bale_dangin", "box": [360, 700, 620, 940]},
        {"name": "Natah (Pekarangan Tengah)", "type": "natah_open_space", "box": [350, 360, 650, 640]},
        {"name": "Bale Dauh (Kamar Anak)", "type": "bale_dauh", "box": [360, 60, 620, 320]},
        {"name": "Paon (Dapur)", "type": "dapur_paon", "box": [700, 370, 920, 640]},
        {"name": "Kamar Mandi / WC", "type": "toilet", "box": [720, 70, 920, 300]},
        {"name": "Angkul-angkul (Pintu Masuk)", "type": "angkul_angkul_pintu", "box": [850, 720, 980, 880]}
    ]

async def parse_floor_plan_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Fungsi orkestrasi utama:
    1. Cek Caching Hash
    2. Panggil Primary Provider (Gemini Flash)
    3. Fallback ke Secondary Provider (Groq)
    4. Fallback ke Mock Dev jika kedua API offline/unconfigured
    """
    img_hash = get_image_hash(image_bytes)
    
    # 1. Cek Cache
    cached = check_cache(img_hash)
    if cached:
        return {
            "source": "cache",
            "image_hash": img_hash,
            "rooms": cached
        }
        
    rooms = None
    provider_used = "none"
    
    # 2. Coba Gemini
    if settings.GEMINI_API_KEY:
        try:
            rooms = await parse_floor_plan_gemini(image_bytes)
            provider_used = "gemini-1.5-flash"
        except Exception as e:
            print(f"[AI WARN] Gemini call failed: {e}. Mencoba fallback...")
            
    # 3. Coba Groq
    if not rooms and settings.GROQ_API_KEY:
        try:
            rooms = await parse_floor_plan_groq(image_bytes)
            provider_used = "groq-qwen3.8-27b"
        except Exception as e:
            print(f"[AI WARN] Groq call failed: {e}. Mencoba fallback dev...")
            
    # 4. Fallback jika API key belum terpasang
    if not rooms:
        rooms = generate_mock_rooms_fallback()
        provider_used = "mock-dev-engine"
        
    # Simpan ke cache
    save_cache(img_hash, rooms)
    
    return {
        "source": provider_used,
        "image_hash": img_hash,
        "rooms": rooms
    }
