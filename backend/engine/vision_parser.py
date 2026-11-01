import json
import hashlib
import io
import re
import time
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image
from core.config import settings

def get_image_hash(image_bytes: bytes) -> str:
    """Menghitung SHA256 hash dari data byte gambar untuk keperluan caching."""
    return hashlib.sha256(image_bytes).hexdigest()

def check_cache(image_hash: str) -> Optional[Dict[str, Any]]:
    """
    Mengecek apakah hasil ekstraksi AI gambar sudah tersimpan di cache.
    Hanya mengembalikan cache jika berasal dari AI valid (bukan mock/fallback).
    """
    cache_file = settings.CACHE_DIR / f"{image_hash}.json"
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Validasi bahwa cache ini adalah hasil AI asli
                source = data.get("source", "")
                if source.startswith("ai:") and data.get("rooms"):
                    return {
                        "source": f"cache:{source}",
                        "model": data.get("model", "unknown"),
                        "rooms": data.get("rooms", [])
                    }
        except Exception as e:
            print(f"[CACHE READ ERROR] {e}")
            return None
    return None

def save_cache(image_hash: str, model_name: str, rooms_data: List[Dict[str, Any]]) -> None:
    """Menyimpan hasil ekstraksi AI yang valid ke cache lokal."""
    if not rooms_data:
        return
    cache_file = settings.CACHE_DIR / f"{image_hash}.json"
    try:
        payload = {
            "source": f"ai:{model_name}",
            "model": model_name,
            "cached_at": time.time(),
            "rooms": rooms_data
        }
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[CACHE SAVE ERROR] Gagal menyimpan cache: {e}")

VISION_SYSTEM_PROMPT = """Anda adalah asisten visual analisis gambar denah arsitektur.
Tugas Anda adalah mendeteksi semua teks ruangan dan batas fisik ruangan pada denah ini.
Kembalikan HANYA format JSON valid tanpa backtick markdown dengan skema:
{
  "rooms": [
    {
      "name": "Nama ruangan persis sesuai teks di denah (contoh: Toilet Tamu, Kamar Tidur Utama, Natah Terbuka, Dapur)",
      "type": "Salah satu tipe: [toilet, pemerajan_sanggah, dapur_paon, natah_open_space, bale_daja, bale_dangin, bale_dauh, kamar_tidur, ruang_tamu, angkul_angkul_pintu, garasi, taman]",
      "box": [ymin, xmin, ymax, xmax]
    }
  ]
}

PENTING:
- Koordinat box bernilai integer skala 0 sampai 1000 (0 = tepi atas/kiri, 1000 = tepi bawah/kanan gambar).
- Format box harus flat list: [ymin, xmin, ymax, xmax] di mana ymin < ymax dan xmin < xmax.
"""

def normalize_box(raw_box: Any) -> Optional[List[int]]:
    """Menormalkan koordinat box dari respons model (menangani nested list atau format aneh)."""
    if not isinstance(raw_box, (list, tuple)):
        return None
    
    # Ratakan jika nested [[ymin, xmin, ymax, xmax]]
    flat: List[Any] = []
    for item in raw_box:
        if isinstance(item, (list, tuple)):
            flat.extend(item)
        else:
            flat.append(item)
            
    if len(flat) != 4:
        return None
        
    try:
        ymin = max(0, min(1000, int(round(float(flat[0])))))
        xmin = max(0, min(1000, int(round(float(flat[1])))))
        ymax = max(0, min(1000, int(round(float(flat[2])))))
        xmax = max(0, min(1000, int(round(float(flat[3])))))
        
        # Validasi batas logis
        if ymin >= ymax or xmin >= xmax:
            return None
            
        return [ymin, xmin, ymax, xmax]
    except Exception:
        return None

def call_gemini_vision(image_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Memanggil Google Gemini Vision secara nyata.
    Jika gagal atau terkena kuota, melempar Exception terstruktur (TIDAK ADA FAKE FALLBACK).
    """
    import google.generativeai as genai
    
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY belum dikonfigurasi di file .env")
        
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # Model target dengan urutan prioritas
    candidate_models = [
        settings.GEMINI_MODEL,
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.5-flash",
        "gemini-flash-latest"
    ]
    # Hapus duplikat sambil mempertahankan urutan
    seen = set()
    models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]
    
    image = Image.open(io.BytesIO(image_bytes))
    response = None
    successful_model = None
    last_error: Optional[Exception] = None
    
    for m_name in models_to_try:
        try:
            model = genai.GenerativeModel(
                model_name=m_name,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1
                }
            )
            response = model.generate_content(
                [VISION_SYSTEM_PROMPT, image],
                request_options={"timeout": 20}
            )
            if response and response.text:
                successful_model = m_name
                break
        except Exception as e:
            last_error = e
            err_str = str(e).lower()
            # Jika terkena limit kuota per menit (429 / ResourceExhausted), catat dan coba model lain atau lempar
            print(f"[AI MODEL ATTEMPT] {m_name} gagal: {e}")
            continue
            
    if not response or not response.text or not successful_model:
        raise RuntimeError(f"Semua kandidat model Gemini gagal merespons: {last_error}")
        
    raw_text = response.text.strip()
    if raw_text.startswith("```"):
        raw_text = re.sub(r"^```(?:json)?\n", "", raw_text)
        raw_text = re.sub(r"\n```$", "", raw_text)
        
    parsed = json.loads(raw_text)
    raw_rooms = parsed.get("rooms", [])
    
    valid_rooms = []
    for r in raw_rooms:
        name = str(r.get("name", "Ruangan")).strip()
        rtype = str(r.get("type", "unknown")).strip().lower()
        box = normalize_box(r.get("box"))

        # Normalisasi semantik: pastikan taman/halaman tidak keliru terklasifikasi sebagai pemerajan/bangunan
        name_lower = name.lower()
        if "taman" in name_lower or "kebun" in name_lower or "halaman" in name_lower:
            if "natah" in name_lower:
                rtype = "natah_open_space"
            else:
                rtype = "taman"

        if box:
            valid_rooms.append({
                "name": name,
                "type": rtype,
                "box": box
            })
            
    if not valid_rooms:
        raise ValueError("Model AI berhasil dipanggil, tetapi tidak menemukan batas ruangan yang valid pada gambar denah.")
        
    return successful_model, valid_rooms

async def parse_floor_plan_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Fungsi orkestrasi pemrosesan denah:
    1. Cek Caching Hash (Hanya jika cache valid)
    2. Panggil Gemini Vision secara nyata
    3. Simpan hasil AI ke cache
    CATATAN INTEGRITAS: TIDAK ADA DATA MOCK / FALLBACK PALSU DI SINI.
    """
    img_hash = get_image_hash(image_bytes)
    
    # 1. Cek Cache Asli
    cached = check_cache(img_hash)
    if cached:
        return {
            "source": cached["source"],
            "model": cached["model"],
            "image_hash": img_hash,
            "rooms": cached["rooms"]
        }
        
    # 2. Panggil AI secara nyata
    successful_model, rooms = call_gemini_vision(image_bytes)
    
    # 3. Simpan cache hasil AI yang valid
    save_cache(img_hash, successful_model, rooms)
    
    return {
        "source": f"ai:{successful_model}",
        "model": successful_model,
        "image_hash": img_hash,
        "rooms": rooms
    }
