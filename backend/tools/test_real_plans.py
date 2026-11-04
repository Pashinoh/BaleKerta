import os
import sys
import time
import json
from pathlib import Path
import httpx

# Pastikan output console di Windows mendukung karakter UTF-8
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

API_URL = "http://localhost:8000/api/audit"
SAMPLES_DIR = Path(__file__).resolve().parent.parent / "tests" / "samples"

test_cases = [
    {
        "id": "denah_1",
        "title": "Denah 1: Rumah Adat Tradisional Bali (Pola Sanga Mandala Murni)",
        "source": "Indonesian Heritage Vol 6 (Wikimedia Commons - Balinese House Compound)",
        "filename": "denah_1_tradisional_bali.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "description": "Denah pekarangan adat Bali klasik dengan Natah, Sanggah Kemulan, Bale Daja, Bale Dauh, Bale Dangin, Paon, dan Angkul-angkul."
    },
    {
        "id": "denah_2",
        "title": "Denah 2: Umah Hati Villa Ubud (Arsitektur Vernakular Modern)",
        "source": "Studio Jencquel / ArchDaily (Sayan, Ubud)",
        "filename": "denah_2_umah_hati_ubud.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "description": "Villa modern tropis di Ubud dengan konsep ruang terbuka mengitari courtyard/taman sesuai iklim mikro Bali."
    },
    {
        "id": "denah_3",
        "title": "Denah 3: Oberoi Villa Bali (Modern Luxury Villa)",
        "source": "Arkana Architects / ArchDaily (Oberoi Seminyak)",
        "filename": "denah_3_oberoi_mainhouse.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "description": "Villa komersial dengan massa terpisah (main house & pavilion) dengan ensuite bathroom dan kolam."
    }
]

def run_tests():
    print("=" * 88)
    print("LAPORAN PENGUJIAN DENAH ASLI ARSITEKTUR BALI — BALEKERTA SPATIAL ENGINE")
    print("=" * 88)

    results = []

    for idx, tc in enumerate(test_cases, 1):
        img_path = SAMPLES_DIR / tc["filename"]
        if not img_path.exists():
            print(f"[SKIP] File {tc['filename']} tidak ditemukan di {SAMPLES_DIR}")
            continue

        print(f"\n[{idx}/{len(test_cases)}] {tc['title']}")
        print(f"       Sumber: {tc['source']}")
        print(f"       Berkas: {tc['filename']} ({img_path.stat().st_size / 1024:.1f} KB)")
        print(f"       Wilayah Pengujian: Kabupaten {tc['regency'].capitalize()} | Arah Utara: {tc['plan_north_deg']}°")
        print("       Mengirim ke POST /api/audit...")

        start_time = time.time()
        try:
            with open(img_path, "rb") as f:
                files = {"file": (tc["filename"], f, "image/jpeg")}
                data = {
                    "regency": tc["regency"],
                    "plan_north_deg": str(tc["plan_north_deg"])
                }
                with httpx.Client(timeout=90.0) as client:
                    resp = client.post(API_URL, files=files, data=data)
            
            elapsed = time.time() - start_time
            if resp.status_code != 200:
                print(f"       [ERROR {resp.status_code}] ({elapsed:.2f}s): {resp.text}")
                continue

            audit_res = resp.json()
            source_model = audit_res.get("source", "unknown")
            kaja = audit_res.get("kaja_vector", {})
            kaja_bearing = kaja.get("bearing_degrees", 0)
            kaja_dir = kaja.get("cardinal_direction", "-")
            kaja_quad = kaja.get("kaja_quadrant", "-")
            
            report = audit_res.get("audit_report", {})
            score = report.get("compliance_score", 0)
            status_label = report.get("status_label", "-")
            kdb = report.get("kdb_percentage", 0)
            rooms = audit_res.get("rooms", [])
            violations = report.get("violations", [])

            print(f"       [STATUS: OK] (Waktu: {elapsed:.2f}s) | Engine: {source_model}")
            print(f"       * Sumbu Kaja Geodesik: {kaja_bearing:.1f}° ({kaja_dir} - {kaja_quad})")
            print(f"       * Skor Kepatuhan Adat: {score}/100 -> {status_label}")
            print(f"       * Rasio KDB Terestimasi: {kdb:.1f}%")
            print(f"       * Total Ruangan Terdeteksi: {len(rooms)} elemen")
            
            for r in rooms:
                box_str = f"[{r['box'][0]:>3}, {r['box'][1]:>3}, {r['box'][2]:>3}, {r['box'][3]:>3}]"
                z = r.get("zone", {})
                zone_id = z.get("zone_id", "-") if isinstance(z, dict) else str(z)
                clean_name = str(r['name']).strip()
                print(f"         - {clean_name:<28} | Tipe: {r['type']:<20} | Zona: {zone_id:<18} | Box: {box_str}")

            if violations:
                print(f"       * Temuan Pelanggaran / Catatan Tata Ruang ({len(violations)}):")
                for v in violations:
                    print(f"         ! [{v.get('rule_id')}] {v.get('issue')}")
                    print(f"           Rekomendasi: {v.get('recommendation')}")
                    print(f"           Dasar Hukum: {v.get('legal_reference')}")
            else:
                print("       * Temuan: 0 Pelanggaran (Denah Sepenuhnya Mematuhi Kosmologi Adat & KDB)")

            results.append({
                "test_case": tc,
                "elapsed": elapsed,
                "audit": audit_res
            })

        except Exception as e:
            elapsed = time.time() - start_time
            print(f"       [EXCEPTION] ({elapsed:.2f}s): {e}")

    print("\n" + "=" * 88)
    print("TABEL RINGKASAN PERBANDINGAN PENGUJIAN 3 DENAH ASLI BALI")
    print("=" * 88)
    print(f"{'No':<3} | {'Nama Sampel':<34} | {'Ruangan':<8} | {'KDB':<7} | {'Skor':<5} | {'Hasil Audit':<16}")
    print("-" * 88)
    for i, res in enumerate(results, 1):
        tc = res["test_case"]
        rep = res["audit"].get("audit_report", {})
        rooms_count = len(res["audit"].get("rooms", []))
        kdb = rep.get("kdb_percentage", 0)
        score = rep.get("compliance_score", 0)
        label = "LOLOS (LAYAK)" if score >= 70 else "PERLU REVISI"
        print(f"{i:<3} | {tc['title'][:34]:<34} | {rooms_count:<8} | {kdb:>5.1f}% | {score:>4} | {label:<16}")
    print("=" * 88)

if __name__ == "__main__":
    run_tests()
