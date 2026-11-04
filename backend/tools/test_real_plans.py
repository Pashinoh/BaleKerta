import os
import sys
import time
import json
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from main import app

SAMPLES_DIR = BACKEND_DIR / "tests" / "samples"
RESULTS_JSON = BACKEND_DIR / "tests" / "stress_test_results.json"

test_cases = [
    {
        "id": "denah_01",
        "title": "1. Rumah Adat Tradisional Bali (Sanga Mandala Murni)",
        "source": "Indonesian Heritage Vol. 6 / Wikimedia Commons",
        "filename": "denah_1_tradisional_bali.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "category": "Tradisional Murni (Legenda Nomor)"
    },
    {
        "id": "denah_02",
        "title": "2. Umah Hati Villa — Floor Plan (Sayan, Ubud)",
        "source": "Studio Jencquel / ArchDaily",
        "filename": "denah_2_umah_hati_ubud.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "category": "Villa Vernakular Modern (Teks Mandarin)"
    },
    {
        "id": "denah_03",
        "title": "3. Umah Hati Villa — Master Site Plan (Sayan, Ubud)",
        "source": "Studio Jencquel / ArchDaily",
        "filename": "denah_2_umah_hati_site.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "category": "Site Plan Kontur Lanskap"
    },
    {
        "id": "denah_04",
        "title": "4. Oberoi Villa — Main House Ground Floor (Seminyak)",
        "source": "Arkana Architects / ArchDaily",
        "filename": "denah_3_oberoi_mainhouse.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "category": "Villa Modern (Label Inggris + Nomor)"
    },
    {
        "id": "denah_05",
        "title": "5. Oberoi Villa — Compound Master Plan (Seminyak)",
        "source": "Arkana Architects / ArchDaily",
        "filename": "denah_3_oberoi_masterplan.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "category": "Master Plan Kompleks Villa"
    },
    {
        "id": "denah_06",
        "title": "6. Terrace Villa Level +0 (Ubud)",
        "source": "Studio Neba / ArchDaily",
        "filename": "denah_4_terrace_villa_neba.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "category": "Villa Tropis Kontemporer (CAD Halus)"
    },
    {
        "id": "denah_07",
        "title": "7. 321 Canggu Residence (Canggu)",
        "source": "ArchDaily Indonesia",
        "filename": "denah_5_canggu_321.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "category": "Hunian Modern Canggu"
    },
    {
        "id": "denah_08",
        "title": "8. Suncoast Villa (Canggu)",
        "source": "Biombo Architects / ArchDaily",
        "filename": "denah_6_suncoast_canggu.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "category": "Villa Komersial Multi-Massa"
    },
    {
        "id": "denah_09",
        "title": "9. Cala Blanca Villa Bali",
        "source": "ArchDaily Indonesia",
        "filename": "denah_7_cala_blanca.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "category": "Villa Modern Minimalis"
    },
    {
        "id": "denah_10",
        "title": "10. Bandido Bali — La Lourdes & La Matilde (Pecatu)",
        "source": "Javi Diaz / ArchDaily",
        "filename": "denah_8_bandido_bali.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "category": "Kompleks Villa Kembar"
    },
    {
        "id": "denah_11",
        "title": "11. Diagram Tata Ruang Pura Bali (Tri Mandala)",
        "source": "Wikimedia Commons (Bali Temple Diagram)",
        "filename": "denah_9_bali_temple.jpg",
        "regency": "karangasem",
        "plan_north_deg": 0,
        "category": "Arsitektur Sakral Pura (Tri Mandala)"
    },
    {
        "id": "denah_12",
        "title": "12. Desa Hay Sanctuary Resort (Canggu)",
        "source": "ArchDaily Indonesia",
        "filename": "denah_10_desa_hay.jpg",
        "regency": "badung",
        "plan_north_deg": 0,
        "category": "Resort / Boutique Sanctuary"
    },
    {
        "id": "denah_13",
        "title": "13. Chameleon Villa (Buwit, Tabanan)",
        "source": "Word of Mouth Architecture / ArchDaily",
        "filename": "denah_11_chameleon.jpg",
        "regency": "tabanan",
        "plan_north_deg": 0,
        "category": "Villa Lereng Sungai (Denah Vertikal Panjang)"
    },
    {
        "id": "denah_14",
        "title": "14. Iron Wood House Bali",
        "source": "ArchDaily Indonesia",
        "filename": "denah_12_iron_wood.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "category": "Rumah Kayu Ulin Kontemporer"
    },
    {
        "id": "denah_15",
        "title": "15. Zenubud Jungle Villa (Ubud)",
        "source": "ANTI Architecture / ArchDaily",
        "filename": "denah_13_zenubud.jpg",
        "regency": "gianyar",
        "plan_north_deg": 0,
        "category": "Villa Geometri Non-Ortogonal (Miring)"
    },
    {
        "id": "denah_16",
        "title": "16. Bale Meten Sakutus — Kasus 1 (Jurnal Undagi)",
        "source": "Jurnal Ilmiah Arsitektur Undagi Univ. Warmadewa",
        "filename": "denah_14_undagi_meten_kasus1.jpg",
        "regency": "bangli",
        "plan_north_deg": 0,
        "category": "Denah Tunggal Bangunan Adat (Jurnal Akademik)"
    },
    {
        "id": "denah_17",
        "title": "17. Bale Meten Sakutus — Kasus 2 (Jurnal Undagi)",
        "source": "Jurnal Ilmiah Arsitektur Undagi Univ. Warmadewa",
        "filename": "denah_15_undagi_meten_kasus2.jpg",
        "regency": "bangli",
        "plan_north_deg": 0,
        "category": "Denah Tunggal Bangunan Adat (Jurnal Akademik)"
    },
    {
        "id": "denah_18",
        "title": "18. Bale Meten Sakutus — Kasus 3 (Jurnal Undagi)",
        "source": "Jurnal Ilmiah Arsitektur Undagi Univ. Warmadewa",
        "filename": "denah_16_undagi_meten_kasus3.jpg",
        "regency": "bangli",
        "plan_north_deg": 0,
        "category": "Denah Tunggal Bangunan Adat (Jurnal Akademik)"
    }
]

def run_stress_test():
    print("=" * 95, flush=True)
    print(f"STRESS TEST {len(test_cases)} DENAH ASLI ARSITEKTUR BALI — BALEKERTA SPATIAL ENGINE", flush=True)
    print("=" * 95, flush=True)

    client = TestClient(app)
    results = []

    for idx, tc in enumerate(test_cases, 1):
        img_path = SAMPLES_DIR / tc["filename"]
        if not img_path.exists():
            print(f"[{idx:02d}/{len(test_cases)}] [SKIP] {tc['filename']} tidak ditemukan", flush=True)
            continue

        kb_size = img_path.stat().st_size / 1024
        print(f"\n[{idx:02d}/{len(test_cases)}] {tc['title']}", flush=True)
        print(f"        Kategori : {tc['category']} | Sumber: {tc['source']}", flush=True)
        print(f"        Berkas   : {tc['filename']} ({kb_size:.1f} KB) | Lokasi: {tc['regency'].capitalize()}", flush=True)

        start_time = time.time()
        try:
            with open(img_path, "rb") as f:
                files = {"file": (tc["filename"], f, "image/jpeg")}
                data = {
                    "regency": tc["regency"],
                    "plan_north_deg": str(tc["plan_north_deg"])
                }
                resp = client.post("/api/audit", files=files, data=data)

            elapsed = time.time() - start_time

            if resp.status_code != 200:
                err_json = {}
                try:
                    err_json = resp.json()
                except Exception:
                    err_json = {"raw": resp.text}
                print(f"        [HTTP {resp.status_code}] ({elapsed:.2f}s) -> {err_json.get('error', 'error')}: {err_json.get('message', resp.text)}", flush=True)
                results.append({
                    "index": idx,
                    "test_case": tc,
                    "http_status": resp.status_code,
                    "elapsed_s": round(elapsed, 2),
                    "error": err_json
                })
                continue

            audit_res = resp.json()
            source_model = audit_res.get("source", "unknown")
            report = audit_res.get("audit_report", {})
            score = report.get("compliance_score", 0)
            status_label = report.get("status_label", "-")
            kdb = report.get("kdb_percentage", 0)
            rooms = audit_res.get("rooms", [])
            violations = report.get("violations", [])

            print(f"        [HTTP 200] ({elapsed:.2f}s) | Source: {source_model}", flush=True)
            print(f"        Ruangan: {len(rooms)} terdeteksi | KDB: {kdb:.1f}% | Skor: {score}/100 ({status_label})", flush=True)
            for r in rooms[:6]:
                z = r.get("zone", {})
                zid = z.get("zone_id", "-") if isinstance(z, dict) else str(z)
                print(f"          - {str(r['name'])[:28]:<28} -> {r['type']:<20} @ {zid:<16} {r['box']}", flush=True)
            if len(rooms) > 6:
                print(f"          ... (+{len(rooms) - 6} ruangan lainnya)", flush=True)

            if violations:
                v_summary = ", ".join(f"{v['rule_id']}" for v in violations)
                print(f"        Pelanggaran ({len(violations)}): {v_summary}", flush=True)

            results.append({
                "index": idx,
                "test_case": tc,
                "http_status": 200,
                "elapsed_s": round(elapsed, 2),
                "source": source_model,
                "rooms_count": len(rooms),
                "kdb_percentage": kdb,
                "compliance_score": score,
                "status_label": status_label,
                "violations_count": len(violations),
                "violation_rules": [v.get("rule_id") for v in violations],
                "rooms": [
                    {
                        "name": r.get("name"),
                        "type": r.get("type"),
                        "zone_id": r.get("zone", {}).get("zone_id") if isinstance(r.get("zone"), dict) else None,
                        "box": r.get("box")
                    }
                    for r in rooms
                ]
            })

            with open(RESULTS_JSON, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, ensure_ascii=False)

        except Exception as e:
            elapsed = time.time() - start_time
            print(f"        [EXCEPTION] ({elapsed:.2f}s): {e}", flush=True)
            results.append({
                "index": idx,
                "test_case": tc,
                "http_status": 0,
                "elapsed_s": round(elapsed, 2),
                "error": str(e)
            })

    with open(RESULTS_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 95, flush=True)
    print(f"RINGKASAN STRESS TEST ({len(results)} DENAH) — TERSIMPAN DI {RESULTS_JSON.name}", flush=True)
    print("=" * 95, flush=True)
    print(f"{'No':<3} | {'Nama Denah':<38} | {'HTTP':<4} | {'Waktu':<6} | {'Ruang':<5} | {'KDB':<6} | {'Skor':<4} | {'Status'}", flush=True)
    print("-" * 95, flush=True)
    for r in results:
        tc = r["test_case"]
        http_code = r["http_status"]
        t_str = f"{r['elapsed_s']:.1f}s"
        if http_code == 200:
            rm = r["rooms_count"]
            kdb_s = f"{r['kdb_percentage']:.1f}%"
            sc = r["compliance_score"]
            st = "LAYAK PBG" if sc >= 70 else "MELANGGAR"
            print(f"{r['index']:<3} | {tc['title'][:38]:<38} | {http_code:<4} | {t_str:<6} | {rm:<5} | {kdb_s:<6} | {sc:<4} | {st}", flush=True)
        else:
            err_code = r.get("error", {}).get("error", "FAIL") if isinstance(r.get("error"), dict) else "EXC"
            print(f"{r['index']:<3} | {tc['title'][:38]:<38} | {http_code:<4} | {t_str:<6} | {'-':<5} | {'-':<6} | {'-':<4} | ERROR ({err_code})", flush=True)
    print("=" * 95, flush=True)

if __name__ == "__main__":
    run_stress_test()
