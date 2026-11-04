"""Unit test deterministik engine BaleKerta: grid Sanga Mandala, rule audit, normalisasi.
Tanpa mock AI / jaringan — semua fungsi murni + data JSON repo."""
import pytest

from engine.sanga_mandala import (
    build_sanga_mandala_grid,
    compute_compound_bounds,
    map_room_to_zone,
    rotate_matrix_clockwise,
    ZONE_KEYS,
)
from engine.audit_checker import run_spatial_audit, compute_boxes_union_area
from engine.vision_parser import classify_and_normalize_room, normalize_box, enrich_bare_room_name


# ---------------------------------------------------------------- rotasi matriks
def test_rotate_identity():
    base = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]
    assert rotate_matrix_clockwise(base, 0) == base


def test_rotate_one_matches_expected():
    base = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]
    one = rotate_matrix_clockwise(base, 1)
    assert one == [["g", "d", "a"], ["h", "e", "b"], ["i", "f", "c"]]
    assert rotate_matrix_clockwise(base, 4) == base  # 4x = identitas


def test_rotate_does_not_mutate_input():
    base = [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]
    snapshot = [row[:] for row in base]
    rotate_matrix_clockwise(base, 2)
    assert base == snapshot


# ---------------------------------------------------------------- grid Sanga Mandala
# Posisi sel suci UTAMANING_UTAMA per kuadrant × jumlah rotasi (golden cases)
# Kuadran: posisi awal sel suci di matriks dasar.
SACRED_START = {
    "TOP_RIGHT": [(0, 2), (2, 2), (2, 0), (0, 0)],
    "BOTTOM_RIGHT": [(2, 2), (2, 0), (0, 0), (0, 2)],
    "TOP_LEFT": [(0, 0), (0, 2), (2, 2), (2, 0)],
    "BOTTOM_LEFT": [(2, 0), (0, 0), (0, 2), (2, 2)],
}

QUADRANTS = list(SACRED_START.keys())
ROTATIONS = [0, 90, 180, 270]


@pytest.mark.parametrize("quadrant", QUADRANTS)
@pytest.mark.parametrize("plan_north", ROTATIONS)
def test_grid_sacred_cell_golden(quadrant, plan_north):
    """16 golden case: sel suci berpindah sesuai rotasi CW kisi denah."""
    grid = build_sanga_mandala_grid(quadrant, plan_north)
    expected = SACRED_START[quadrant][(plan_north // 90) % 4]
    assert grid["sacred_row_col"] == expected


def test_grid_structure():
    grid = build_sanga_mandala_grid("TOP_RIGHT", 0)
    assert len(grid["cells"]) == 9
    assert grid["kaja_quadrant"] == "TOP_RIGHT"
    assert grid["plan_north_deg"] == 0
    assert all(c["zone_id"] in ZONE_KEYS for c in grid["cells"])
    assert len({c["zone_id"] for c in grid["cells"]}) == 9


def test_compute_compound_bounds_and_adaptive_grid():
    """Batas amplop tapak menyesuaikan grid 3x3 terhadap margin kertas/legenda."""
    rooms = [
        {"name": "Sanggah", "box": [200, 600, 280, 700]},
        {"name": "Bale Daja", "box": [200, 350, 280, 500]},
        {"name": "Paon", "box": [550, 350, 650, 480]},
        {"name": "Bale Delod", "box": [550, 520, 650, 700]},
    ]
    bounds = compute_compound_bounds(rooms)
    assert bounds is not None
    assert 180 <= bounds[0] <= 200
    assert 330 <= bounds[1] <= 350
    assert 650 <= bounds[2] <= 670
    assert 700 <= bounds[3] <= 720

    grid = build_sanga_mandala_grid("TOP_RIGHT", 0, bounds=bounds)
    assert grid["lot_bounds"] == bounds
    sanggah_zone = map_room_to_zone(rooms[0]["box"], grid)
    assert sanggah_zone["zone_id"] == "UTAMANING_UTAMA"


# ---------------------------------------------------------------- helper ruangan
def room(rtype, zone_id, name=None, box=None):
    return {
        "name": name or rtype.replace("_", " ").title(),
        "type": rtype,
        "box": box or [100, 100, 200, 200],
        "zone": {"zone_id": zone_id, "name": zone_id},
    }


def pemerajan(zone="UTAMANING_UTAMA"):
    return room("pemerajan_sanggah", zone, name="Pemerajan Keluarga")


# ---------------------------------------------------------------- rule audit
def test_toilet_in_sacred_violation():
    report = run_spatial_audit(
        [room("toilet", "UTAMANING_UTAMA", name="Toilet"), pemerajan()], None
    )
    assert any(v["rule_id"] == "TOILET_IN_SACRED" for v in report["violations"])
    assert report["compliance_score"] == 65  # 100 - 35


def test_toilet_in_teba_is_compliant():
    report = run_spatial_audit([room("toilet", "NISTANING_NISTA", name="Toilet"), pemerajan()], None)
    assert any(c["rule_id"] == "TOILET_IN_TEBA_OK" for c in report["compliances"])
    assert not any(v["rule_id"] == "TOILET_IN_SACRED" for v in report["violations"])


def test_pemerajan_ok_in_utama():
    report = run_spatial_audit([pemerajan()], None)
    assert any(c["rule_id"] == "PEMERAJAN_OK" for c in report["compliances"])
    assert not any(v["rule_id"] == "NO_PEMERAJAN" for v in report["violations"])


def test_pemerajan_in_profane_zone():
    report = run_spatial_audit([room("pemerajan_sanggah", "NISTANING_NISTA", name="Pemerajan")], None)
    assert any(v["rule_id"] == "PEMERAJAN_IN_PROFANE" for v in report["violations"])


def test_pemerajan_off_corner_when_no_primary():
    report = run_spatial_audit([room("pemerajan_sanggah", "MADYANING_MADYA", name="Sanggah")], None)
    rules = [v["rule_id"] for v in report["violations"]]
    assert "PEMERAJAN_OFF_CORNER" in rules


def test_missing_pemerajan_flagged():
    report = run_spatial_audit([room("kamar_tidur", "MADYANING_UTAMA", name="Kamar")], None)
    assert any(v["rule_id"] == "NO_PEMERAJAN" for v in report["violations"])


def test_kitchen_ok_in_nista():
    report = run_spatial_audit([room("dapur_paon", "MADYANING_NISTA", name="Paon"), pemerajan()], None)
    assert any(c["rule_id"] == "KITCHEN_OK" for c in report["compliances"])
    assert not any(v["rule_id"] == "KITCHEN_IN_SACRED" for v in report["violations"])


def test_natah_preserved_is_compliant():
    report = run_spatial_audit(
        [room("natah_open_space", "MADYANING_MADYA", name="Natah"), pemerajan()], None
    )
    assert any(c["rule_id"] == "NATAH_OK" for c in report["compliances"])
    assert not any(v["rule_id"] == "NATAH_BLOCKED" for v in report["violations"])


def test_natah_preserved_suppresses_bordering_room_false_positive():
    """Jika Natah terbuka sudah ada di Madyaning Madya, bale di tepi tengah tidak memicu NATAH_BLOCKED."""
    report = run_spatial_audit(
        [
            room("natah_open_space", "MADYANING_MADYA", name="Natah"),
            room("ruang_tamu", "MADYANING_MADYA", name="Bale Dangin"),
            pemerajan(),
        ],
        None,
    )
    assert any(c["rule_id"] == "NATAH_OK" for c in report["compliances"])
    assert not any(v["rule_id"] == "NATAH_BLOCKED" for v in report["violations"])


def test_bedroom_blocking_natah_central():
    report = run_spatial_audit(
        [room("kamar_tidur", "MADYANING_MADYA", name="Kamar Tidur"), pemerajan()], None
    )
    assert any(v["rule_id"] == "NATAH_BLOCKED" for v in report["violations"])


def test_multiple_rooms_blocking_natah_deduplicates_score_penalty():
    """Beberapa sub-ruang di tengah tetap tercatat, tetapi penalti skor hanya -15 satu kali."""
    report = run_spatial_audit(
        [
            room("kamar_tidur", "MADYANING_MADYA", name="Kamar 1"),
            room("ruang_tamu", "MADYANING_MADYA", name="Ruang Keluarga"),
            pemerajan(),
        ],
        None,
    )
    natah_viols = [v for v in report["violations"] if v["rule_id"] == "NATAH_BLOCKED"]
    assert len(natah_viols) == 2
    assert report["compliance_score"] == 85  # 100 - 15 (bukan 100 - 30)


def test_bedroom_in_teba_violation():
    report = run_spatial_audit([room("kamar_tidur", "NISTANING_NISTA", name="Kamar"), pemerajan()], None)
    assert any(v["rule_id"] == "BEDROOM_IN_TEBA" for v in report["violations"])


def test_kdb_exceeded_when_massive_room():
    report = run_spatial_audit(
        [room("kamar_tidur", "MADYANING_UTAMA", name="Kamar", box=[0, 0, 1000, 800]), pemerajan(
            zone="UTAMANING_UTAMA")], None
    )
    assert any(v["rule_id"] == "KDB_EXCEEDED" for v in report["violations"])
    assert report["kdb_percentage"] > 60


def test_kdb_ok_small_build():
    report = run_spatial_audit([room("kamar_tidur", "MADYANING_UTAMA", name="Kamar"), pemerajan()], None)
    assert report["kdb_status"] == "MEMENUHI"
    assert not any(v["rule_id"] == "KDB_EXCEEDED" for v in report["violations"])


def test_compute_boxes_union_area_no_double_counting():
    """Kotak yang beririsan penuh atau sebagian tidak dihitung ganda dalam luas KDB."""
    outer = [100, 100, 500, 500]  # 400 x 400 = 160_000
    inner = [200, 200, 400, 400]  # sepenuhnya di dalam outer
    assert compute_boxes_union_area([outer, inner]) == 160_000


def test_insufficient_room_labels_on_sparse_plan():
    """Denah dengan grid aktif tetapi < 3 ruangan terdeteksi diberi peringatan INSUFFICIENT_ROOM_LABELS."""
    grid = build_sanga_mandala_grid("TOP_RIGHT", 0)
    report = run_spatial_audit(
        [room("natah_open_space", "MADYANING_MADYA", name="Natah Open Space")],
        grid,
    )
    rules = [v["rule_id"] for v in report["violations"]]
    assert "INSUFFICIENT_ROOM_LABELS" in rules
    assert report["compliance_score"] == 65  # 100 - 20 (NO_PEMERAJAN) - 15 (INSUFFICIENT_ROOM_LABELS)


# ---------------------------------------------------------------- normalisasi ruangan
def test_classify_synonyms():
    assert classify_and_normalize_room("Sanggah Keluarga") == "pemerajan_sanggah"
    assert classify_and_normalize_room("Toilet Tamu") == "toilet"
    assert classify_and_normalize_room("Natah Tengah") == "natah_open_space"
    assert classify_and_normalize_room("Dapur Paon") == "dapur_paon"
    assert classify_and_normalize_room("Kamar Tidur Utama") == "bale_daja"
    assert classify_and_normalize_room("Bale Dangin") == "bale_dangin"
    assert classify_and_normalize_room("Zona Misterius") == "ruang_tamu"


def test_enrich_bare_room_name():
    assert enrich_bare_room_name("A", "pemerajan_sanggah") == "Kode A (Pemerajan / Sanggah)"
    assert enrich_bare_room_name("12", "pemerajan_sanggah") == "Kode 12 (Pemerajan / Sanggah)"
    assert enrich_bare_room_name("Bale Daja", "bale_daja") == "Bale Daja"


def test_normalize_box():
    assert normalize_box([0, 0, 100, 100]) == [0, 0, 100, 100]
    assert normalize_box([[0, 0, 100, 100]]) == [0, 0, 100, 100]  # nested diratakan
    assert normalize_box([-5, 0, 1200, 100]) == [0, 0, 1000, 100]  # clamp
    assert normalize_box([200, 0, 100, 100]) is None  # ymin >= ymax
    assert normalize_box("bukan-list") is None
    assert normalize_box([1, 2]) is None  # panjang salah
