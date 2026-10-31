import os
import sys
import time
import json
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image

# Load environment
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("[ERROR] GEMINI_API_KEY tidak ditemukan di .env")
    sys.exit(1)

import google.generativeai as genai
genai.configure(api_key=api_key)

test_image_path = ROOT_DIR / "test_denah_bali.png"
if not test_image_path.exists():
    print(f"[ERROR] Gambar uji tidak ditemukan di {test_image_path}")
    sys.exit(1)

img = Image.open(test_image_path)

PROMPT = """Anda adalah asisten visual arsitektur.
Lihat gambar denah ini dan ekstrak semua teks ruangan dan kotak koordinat [ymin, xmin, ymax, xmax] (skala 0-1000).
Kembalikan HANYA JSON:
{
  "rooms": [
    {"name": "...", "type": "...", "box": [ymin, xmin, ymax, xmax]}
  ]
}"""

candidate_models = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-3.8-flash"
]

print("=== PENGUJIAN MODEL GEMINI VISION ===")
print(f"File uji: {test_image_path.name} ({img.size[0]}x{img.size[1]})")

success_model = None

for model_name in candidate_models:
    print(f"\n-> Mencoba model: {model_name}...")
    start_t = time.time()
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={"response_mime_type": "application/json", "temperature": 0.1}
        )
        res = model.generate_content([PROMPT, img], request_options={"timeout": 30})
        latency = round(time.time() - start_t, 2)
        raw_text = res.text.strip()
        data = json.loads(raw_text)
        rooms = data.get("rooms", [])
        print(f"   [SUCCESS] Latency: {latency}s | Ruangan terdeteksi: {len(rooms)}")
        for r in rooms:
            print(f"     * {r.get('name')} ({r.get('type')}) -> box: {r.get('box')}")
        success_model = model_name
        break
    except Exception as e:
        latency = round(time.time() - start_t, 2)
        print(f"   [FAILED] ({latency}s): {e}")

if success_model:
    print(f"\n[KESIMPULAN] Model yang bekerja dengan baik: {success_model}")
else:
    print("\n[KESIMPULAN] Semua model gagal. Periksa kuota / pesan error di atas.")
