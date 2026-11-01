import json
from pathlib import Path
from typing import List, Dict, Any
from core.config import settings

_rules_cache = None

def load_perda_rules() -> Dict[str, Any]:
    """Rules statis dari disk; cukup dibaca sekali lalu dicache module-level."""
    global _rules_cache
    if _rules_cache is None:
        rules_file = settings.DATA_DIR / "perda_rules.json"
        with open(rules_file, "r", encoding="utf-8") as f:
            _rules_cache = json.load(f)
    return _rules_cache

def run_spatial_audit(rooms: List[Dict[str, Any]], grid_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Melakukan verifikasi deterministik terhadap posisi ruangan
    berdasarkan aturan Perda No. 5/2005 dan Asta Kosala-Kosali.
    """
    rules = load_perda_rules()
    zone_rules = rules["zones"]
    
    violations = []
    compliances = []
    score = 100
    
    # Hitung perkiraan kasar luas bangunan vs total tapak (KDB)
    total_room_area = 0
    total_canvas_area = 1000 * 1000
    
    has_pemerajan = False
    pemerajan_in_utama = False
    has_natah = False
    natah_preserved = True

    # Pra-pengecekan: Apakah pekarangan sudah memiliki tempat suci utama di Utamaning Utama
    has_primary_pemerajan_in_utama = any(
        any(p in r.get("type", "").lower() or p in r.get("name", "").lower() for p in ["pemerajan", "sanggah", "altar"])
        and not any(g in r.get("type", "").lower() or g in r.get("name", "").lower() for g in ["taman", "kebun", "halaman"])
        and r.get("zone", {}).get("zone_id") == "UTAMANING_UTAMA"
        for r in rooms
    )
    
    for room in rooms:
        name = room.get("name", "Ruangan")
        rtype = room.get("type", "unknown").lower()
        box = room.get("box", [0, 0, 0, 0])
        zone_info = room.get("zone", {})
        zone_id = zone_info.get("zone_id", "UNKNOWN")
        
        # Hitung area ruangan tertutup untuk KDB (kecualikan ruang terbuka hijau seperti Natah & Taman)
        ymin, xmin, ymax, xmax = box
        area = max(0, ymax - ymin) * max(0, xmax - xmin)
        is_open_space = any(p in rtype or p in name.lower() for p in [
            "natah", "taman", "halaman", "open_space", "kebun", "plaza", "pekarangan", "sirkulasi"
        ])
        if not is_open_space:
            total_room_area += area
        
        current_zone_rule = zone_rules.get(zone_id, {})
        zone_name = current_zone_rule.get("name", zone_id)
        
        # 1. Cek Pelanggaran Kritis: Toilet / Utilitas Kotor di Zona Suci
        if any(p in rtype for p in ["toilet", "kamar_mandi", "wc", "septic"]):
            if zone_id in ["UTAMANING_UTAMA", "MADYANING_UTAMA"]:
                score -= 35
                violations.append({
                    "id": f"viol_{len(violations)+1}",
                    "rule_id": "TOILET_IN_SACRED",
                    "verified": True,
                    "room_name": name,
                    "room_type": rtype,
                    "box": box,
                    "zone_id": zone_id,
                    "zone_name": zone_name,
                    "severity": "CRITICAL",
                    "issue": f"{name} berada pada zona suci ({zone_name})",
                    "recommendation": "Pindahkan toilet/sanitasi ke sudut Kelod-Kauh (Nistaning Nista / Teba) agar tidak mencemari kesucian pekarangan.",
                    "legal_reference": current_zone_rule.get("legal_basis", rules["regulation"])
                })
            elif zone_id == "NISTANING_NISTA":
                compliances.append({
                    "rule_id": "TOILET_IN_TEBA_OK",
                    "verified": True,
                    "room_name": name,
                    "zone_name": zone_name,
                    "detail": f"{name} ditempatkan tepat di zona Teba (Nistaning Nista) sesuai pedoman Asta Bumi."
                })
                
        # 2. Cek Tempat Suci (Pemerajan / Sanggah) vs Taman Suci
        is_garden = any(p in rtype or p in name.lower() for p in ["taman", "kebun", "halaman", "buffer", "lanskap"])
        if is_garden:
            if zone_id in ["UTAMANING_UTAMA", "MADYANING_UTAMA", "NISTANING_UTAMA", "UTAMANING_MADYA", "MADYANING_MADYA"]:
                compliances.append({
                    "rule_id": "TAMAN_SUCI_OK",
                    "verified": True,
                    "room_name": name,
                    "zone_name": zone_name,
                    "detail": f"{name} berfungsi optimal sebagai ruang terbuka hijau penyangga kesucian pekarangan."
                })
        elif any(p in rtype or p in name.lower() for p in ["pemerajan", "sanggah", "sembahyang", "altar"]):
            has_pemerajan = True
            if zone_id == "UTAMANING_UTAMA":
                pemerajan_in_utama = True
                compliances.append({
                    "rule_id": "PEMERAJAN_OK",
                    "verified": True,
                    "room_name": name,
                    "zone_name": zone_name,
                    "detail": f"{name} berada tepat pada kuadran suci tertinggi (Utamaning Utama) sesuai Asta Bumi."
                })
            elif zone_id in ["NISTANING_NISTA", "MADYANING_NISTA", "UTAMANING_NISTA"]:
                score -= 30
                violations.append({
                    "id": f"viol_{len(violations)+1}",
                    "rule_id": "PEMERAJAN_IN_PROFANE",
                    "verified": True,
                    "room_name": name,
                    "room_type": rtype,
                    "box": box,
                    "zone_id": zone_id,
                    "zone_name": zone_name,
                    "severity": "CRITICAL",
                    "issue": f"{name} ditempatkan pada zona profan/hilir ({zone_name})",
                    "recommendation": "Tempat persembahyangan keluarga (Pemerajan) wajib dialokasikan di sudut Kaja-Kangin (Utamaning Utama).",
                    "legal_reference": "Pedoman Asta Bumi: Tempat persembahyangan keluarga wajib berada pada sudut Kaja-Kangin (Utamaning Utama)."
                })
            elif not has_primary_pemerajan_in_utama:
                # Hanya beri peringatan jika pekarangan BELUM memiliki pemerajan utama di Utamaning Utama
                score -= 15
                violations.append({
                    "id": f"viol_{len(violations)+1}",
                    "rule_id": "PEMERAJAN_OFF_CORNER",
                    "verified": True,
                    "room_name": name,
                    "room_type": rtype,
                    "box": box,
                    "zone_id": zone_id,
                    "zone_name": zone_name,
                    "severity": "WARNING",
                    "issue": f"{name} berada di {zone_name}, belum optimal di Utamaning Utama",
                    "recommendation": "Geser posisi altar/pemerajan lebih condong ke sudut Kaja-Kangin pekarangan.",
                    "legal_reference": current_zone_rule.get("legal_basis", rules["regulation"])
                })
            else:
                # Jika sudah ada pemerajan utama di Utamaning Utama, ruang pelengkap ini dianggap sesuai
                compliances.append({
                    "rule_id": "PEMERAJAN_OK",
                    "verified": True,
                    "room_name": name,
                    "zone_name": zone_name,
                    "detail": f"{name} melengkapi area kesucian pekarangan di zona {zone_name}."
                })
                
        # 3. Cek Dapur (Paon)
        if any(p in rtype for p in ["dapur", "kitchen", "paon"]):
            if zone_id in ["UTAMANING_UTAMA", "MADYANING_UTAMA"]:
                score -= 20
                violations.append({
                    "id": f"viol_{len(violations)+1}",
                    "rule_id": "KITCHEN_IN_SACRED",
                    "verified": True,
                    "room_name": name,
                    "room_type": rtype,
                    "box": box,
                    "zone_id": zone_id,
                    "zone_name": zone_name,
                    "severity": "WARNING",
                    "issue": f"{name} ditempatkan pada zona suci ({zone_name})",
                    "recommendation": "Dapur (Paon) sebaiknya dialokasikan pada zona Kelod (Madyaning Nista atau Utamaning Nista).",
                    "legal_reference": "Pedoman Asta Kosala-Kosali: Paon ditempatkan di sisi selatan / tenggara dekat stana Dewa Brahma."
                })
            elif zone_id in ["MADYANING_NISTA", "UTAMANING_NISTA"]:
                compliances.append({
                    "rule_id": "KITCHEN_OK",
                    "verified": True,
                    "room_name": name,
                    "zone_name": zone_name,
                    "detail": f"{name} sesuai dengan pakem penempatan Paon di sisi selatan/tenggara pekarangan."
                })
                
        # 4. Cek Natah (Halaman Tengah)
        if "natah" in rtype or "open_space" in rtype or "taman_tengah" in rtype:
            has_natah = True
            if zone_id == "MADYANING_MADYA":
                compliances.append({
                    "rule_id": "NATAH_OK",
                    "verified": True,
                    "room_name": name,
                    "zone_name": zone_name,
                    "detail": "Natah (halaman tengah) terpelihara sebagai ruang terbuka keseimbangan kosmik (Akasa-Pertiwi)."
                })
                
        # Jika bangunan masif menutupi zona tengah
        if zone_id == "MADYANING_MADYA" and any(p in rtype for p in ["kamar", "ruang_tamu", "dapur", "toilet"]):
            natah_preserved = False
            score -= 15
            violations.append({
                "id": f"viol_{len(violations)+1}",
                "rule_id": "NATAH_BLOCKED",
                "verified": True,
                "room_name": name,
                "room_type": rtype,
                "box": box,
                "zone_id": zone_id,
                "zone_name": zone_name,
                "severity": "WARNING",
                "issue": f"{name} menutupi zona pusat Natah (Madyaning Madya)",
                "recommendation": "Biarkan zona tengah pekarangan terbuka tanpa atap masif sebagai sirkulasi udara dan ruang sakral Natah.",
                "legal_reference": "Pedoman Asta Bumi: Natah wajib dibiarkan terbuka sebagai ruang hijau dan sirkulasi alami."
            })

        # 5. Cek Kamar Tidur Utama / Ruang Tidur (Tidak boleh di Nistaning Nista / Teba)
        if any(p in rtype for p in ["kamar_tidur", "kamar_utama", "master_bedroom", "bale_daja", "gedong"]):
            if zone_id == "NISTANING_NISTA":
                score -= 20
                violations.append({
                    "id": f"viol_{len(violations)+1}",
                    "rule_id": "BEDROOM_IN_TEBA",
                    "verified": True,
                    "room_name": name,
                    "room_type": rtype,
                    "box": box,
                    "zone_id": zone_id,
                    "zone_name": zone_name,
                    "severity": "WARNING",
                    "issue": f"{name} berada pada zona Teba / pembuangan ({zone_name})",
                    "recommendation": "Menurut pakem Asta Kosala-Kosali, Kamar Tidur Utama (Bale Daja/Gedong) untuk kepala keluarga idealnya berada di sisi Kaja/Utama atau Madya, bukan di zona Teba (area pembuangan/ternak).",
                    "legal_reference": "Asta Kosala-Kosali: Zona Nistaning Nista (Teba) difungsikan untuk sanitasi dan pembuangan, bukan untuk ruang tidur utama."
                })
            elif zone_id in ["MADYANING_UTAMA", "NISTANING_UTAMA", "UTAMANING_MADYA", "MADYANING_NISTA"]:
                compliances.append({
                    "rule_id": "BEDROOM_OK",
                    "verified": True,
                    "room_name": name,
                    "zone_name": zone_name,
                    "detail": f"{name} ditempatkan pada zona yang sesuai ({zone_name}) mematuhi hierarki ruang istirahat keluarga."
                })

    # Evaluasi KDB (Koefisien Dasar Bangunan - Perkiraan Kasar)
    kdb_percentage = round((total_room_area / total_canvas_area) * 100, 1)
    kdb_status = "MEMENUHI"
    if kdb_percentage > 60:
        kdb_status = "MELEBIHI_BATAS"
        score -= 15
        violations.append({
            "id": f"viol_{len(violations)+1}",
            "rule_id": "KDB_EXCEEDED",
            "verified": True,
            "room_name": "Koefisien Dasar Bangunan (KDB)",
            "room_type": "kdb_assessment",
            "box": [0, 0, 1000, 1000],
            "zone_id": "GLOBAL",
            "zone_name": "Seluruh Tapak",
            "severity": "WARNING",
            "issue": f"Perkiraan kasar luas kotak ruangan: {kdb_percentage}%, melebihi ambang batas hunian (60%)",
            "recommendation": "Perbanyak ruang terbuka hijau (RTH) minimal 40% dari total luas pekarangan untuk resapan air.",
            "legal_reference": "Pedoman Tata Ruang Bali: Koefisien Dasar Bangunan (KDB) hunian dianjurkan maksimal 60%."
        })
    else:
        compliances.append({
            "rule_id": "KDB_OK",
            "verified": True,
            "room_name": "KDB Permukiman",
            "zone_name": "Seluruh Tapak",
            "detail": f"Perkiraan kasar luas kotak ruangan: {kdb_percentage}%, mematuhi anjuran ruang hijau pekarangan."
        })

    # Evaluasi Ketersediaan Tempat Suci
    if not has_pemerajan:
        score -= 20
        violations.append({
            "id": f"viol_{len(violations)+1}",
            "rule_id": "NO_PEMERAJAN",
            "verified": True,
            "room_name": "Pemerajan / Sanggah",
            "room_type": "missing_required_facility",
            "box": [0, 667, 333, 1000],
            "zone_id": "UTAMANING_UTAMA",
            "zone_name": "Utamaning Utama",
            "severity": "CRITICAL",
            "issue": "Tidak terdeteksi area persembahyangan (Pemerajan/Sanggah) pada denah",
            "recommendation": "Sediakan area tempat suci keluarga pada sudut Utamaning Utama (Kaja-Kangin).",
            "legal_reference": "Pedoman Asta Bumi: Setiap pekarangan hunian dianjurkan menyediakan tempat pemujaan keluarga di sudut suci."
        })

    final_score = max(0, min(100, score))
    
    if final_score >= 80:
        status_label = "MEMENUHI PERSYARATAN (LAYAK PBG)"
        status_color = "green"
    elif final_score >= 50:
        status_label = "PERLU PENYESUAIAN TATA RUANG"
        status_color = "yellow"
    else:
        status_label = "MELANGGAR REGULASI ADAT & PERDA"
        status_color = "red"
        
    return {
        "compliance_score": final_score,
        "status_label": status_label,
        "status_color": status_color,
        "kdb_percentage": kdb_percentage,
        "kdb_status": kdb_status,
        "violations_count": len(violations),
        "violations": violations,
        "compliances": compliances
    }
