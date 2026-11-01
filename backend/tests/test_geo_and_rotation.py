import sys
import os
from pathlib import Path

# Add backend root to sys.path
backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_root))

from engine.azimuth import resolve_kaja_vector, is_in_bali, calculate_geodesic_bearing
from engine.sanga_mandala import build_sanga_mandala_grid, map_room_to_zone
from engine.audit_checker import run_spatial_audit
import json

def test_kaja_geo():
    print("=== 1. Testing /api/kaja Geodesic Vectors ===")
    
    # Case A: Denpasar
    dps = resolve_kaja_vector(custom_lat=-8.6705, custom_lon=115.2126)
    print(f"Denpasar: bearing={dps['bearing_degrees']}°, quadrant={dps['kaja_quadrant']}, in_bali={dps['in_bali']}")
    assert dps["in_bali"] == True, "Denpasar should be in Bali"
    assert 35 <= dps["bearing_degrees"] <= 65, f"Unexpected bearing for Denpasar: {dps['bearing_degrees']}"
    assert dps["kaja_quadrant"] == "TOP_RIGHT", f"Unexpected quadrant for Denpasar: {dps['kaja_quadrant']}"

    # Case B: Singaraja (Buleleng)
    bll = resolve_kaja_vector(custom_lat=-8.1120, custom_lon=115.0882)
    print(f"Singaraja: bearing={bll['bearing_degrees']}°, quadrant={bll['kaja_quadrant']}, in_bali={bll['in_bali']}")
    assert bll["in_bali"] == True, "Singaraja should be in Bali"
    assert bll["kaja_quadrant"] == "BOTTOM_RIGHT", f"Singaraja should face south-east towards Mount Agung: {bll['kaja_quadrant']}"

    # Case C: Outside Bali (Jakarta)
    jkt = resolve_kaja_vector(custom_lat=-6.2088, custom_lon=106.8456)
    print(f"Jakarta: in_bali={jkt['in_bali']}, location={jkt['location']}")
    assert jkt["in_bali"] == False, "Jakarta should NOT be in Bali"

    print(">>> All 3 geo vector test cases PASSED!")

def test_plan_north_rotation():
    print("\n=== 2. Testing 3x3 Sanga Mandala Rotation (plan_north_deg) ===")

    # Denpasar base quadrant = TOP_RIGHT
    # Test 0 deg -> sacred cell at top-right (row 0, col 2)
    g0 = build_sanga_mandala_grid("TOP_RIGHT", 0)
    assert g0["sacred_row_col"] == (0, 2), f"Expected (0, 2), got {g0['sacred_row_col']}"
    print("deg 0: sacred cell at top-right (row 0, col 2) -> OK")

    # Test 90 deg -> sacred cell rotated to bottom-right (row 2, col 2)
    g90 = build_sanga_mandala_grid("TOP_RIGHT", 90)
    assert g90["sacred_row_col"] == (2, 2), f"Expected (2, 2), got {g90['sacred_row_col']}"
    print("deg 90: sacred cell at bottom-right (row 2, col 2) -> OK")

    # Test 180 deg -> sacred cell rotated to bottom-left (row 2, col 0)
    g180 = build_sanga_mandala_grid("TOP_RIGHT", 180)
    assert g180["sacred_row_col"] == (2, 0), f"Expected (2, 0), got {g180['sacred_row_col']}"
    print("deg 180: sacred cell at bottom-left (row 2, col 0) -> OK")

    # Test 270 deg -> sacred cell rotated to top-left (row 0, col 0)
    g270 = build_sanga_mandala_grid("TOP_RIGHT", 270)
    assert g270["sacred_row_col"] == (0, 0), f"Expected (0, 0), got {g270['sacred_row_col']}"
    print("deg 270: sacred cell at top-left (row 0, col 0) -> OK")

    # Singaraja (BOTTOM_RIGHT) with 0 deg -> sacred cell at bottom-right (row 2, col 2)
    g_singaraja = build_sanga_mandala_grid("BOTTOM_RIGHT", 0)
    assert g_singaraja["sacred_row_col"] == (2, 2), f"Expected (2, 2), got {g_singaraja['sacred_row_col']}"
    print("Singaraja deg 0: sacred cell at bottom-right (row 2, col 2) -> OK")

    print(">>> All 5 rotation test cases PASSED!")

def test_preset_regression_and_rule_ids():
    print("\n=== 3. Testing Preset Regression & rule_id Integrity ===")
    presets_dir = backend_root / "data" / "presets"
    
    # Test Preset 1 (Ideal Denah)
    p1_file = presets_dir / "preset_1_pass.json"
    with open(p1_file, "r", encoding="utf-8") as f:
        p1_data = json.load(f)
    kaja_p1 = resolve_kaja_vector(p1_data.get("regency", "gianyar"))
    grid_p1 = build_sanga_mandala_grid(kaja_p1["kaja_quadrant"], 0)
    mapped_p1 = []
    for r in p1_data["rooms"]:
        mapped_p1.append({**r, "zone": map_room_to_zone(r["box"], grid_p1)})
    res_p1 = run_spatial_audit(mapped_p1, grid_p1)
    print(f"Preset 1 Score: {res_p1['compliance_score']}/100, Violations: {res_p1['violations_count']}")
    assert res_p1["compliance_score"] == 100, f"Preset 1 should score 100, got {res_p1['compliance_score']}"
    assert len(res_p1["violations"]) == 0, "Preset 1 should have 0 violations"
    for comp in res_p1["compliances"]:
        assert "rule_id" in comp, f"Compliance missing rule_id: {comp}"
        assert comp.get("verified") is True, f"Compliance missing verified: {comp}"
    print("Preset 1: Compliances verified with rule_id -> OK")

    # Test Preset 2 (Pelanggaran Denah)
    p2_file = presets_dir / "preset_2_toilet_violation.json"
    with open(p2_file, "r", encoding="utf-8") as f:
        p2_data = json.load(f)
    kaja_p2 = resolve_kaja_vector(p2_data.get("regency", "badung"))
    grid_p2 = build_sanga_mandala_grid(kaja_p2["kaja_quadrant"], 0)
    mapped_p2 = []
    for r in p2_data["rooms"]:
        mapped_p2.append({**r, "zone": map_room_to_zone(r["box"], grid_p2)})
    res_p2 = run_spatial_audit(mapped_p2, grid_p2)
    print(f"Preset 2 Score: {res_p2['compliance_score']}/100, Violations: {res_p2['violations_count']}")
    assert res_p2["compliance_score"] <= 65, f"Preset 2 should fail with <= 65, got {res_p2['compliance_score']}"
    assert len(res_p2["violations"]) >= 2, "Preset 2 should have at least 2 violations"
    for viol in res_p2["violations"]:
        assert "rule_id" in viol, f"Violation missing rule_id: {viol}"
        assert viol.get("verified") is True, f"Violation missing verified: {viol}"
        print(f"  - [{viol['rule_id']}] {viol['issue']} (verified: {viol['verified']})")
    print("Preset 2: Violations verified with rule_id -> OK")

    print(">>> Preset regression & rule_id test PASSED!")

if __name__ == "__main__":
    test_kaja_geo()
    test_plan_north_rotation()
    test_preset_regression_and_rule_ids()
    print("\n==========================================")
    print("ALL FASE 3 BACKEND TESTS PASSED CLEANLY!")
    print("==========================================")
