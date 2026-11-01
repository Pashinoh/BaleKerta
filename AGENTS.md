# AGENTS.md — BaleKerta

## Apa ini

Engine pra-pemeriksaan kepatuhan tata ruang adat Bali (Asta Bumi / Sanga Mandala / Perda No. 5/2005) berbasis AI Vision + math geodesik. Frontend: Next.js 14 App Router + Tailwind + Leaflet di `frontend/`. Backend: FastAPI di `backend/`. Bahasa UI & komentar: Indonesia.

## Perintah

```bash
# Backend (dari repo root)
backend\venv\Scripts\activate                        # Windows venv sudah ada
cd backend && python -m uvicorn main:app --port 8000 --reload
cd backend && python -m pytest tests -q              # test deterministik (37 kasus, tanpa mock AI)

# Frontend
cd frontend && npm run dev      # :3000
cd frontend && npm run build    # gate sebelum merge

# Keduanya sekaligus
docker compose up
```

## Struktur yang harus dijaga

```
backend/engine/    azimuth.py (arah Kaja→Gn.Agung) · sanga_mandala.py (grid 3×3 + rotasi)
                   vision_parser.py (Gemini + cache) · audit_checker.py (rules deterministik)
backend/tests/     pytest murni-fungsi; BEBAS dari I/O jaringan
backend/tools/     utilitas debug manual (bukan test)
backend/data/      perda_rules.json + presets/ (statis, in-git); cache/ runtime (gitignored)
frontend/src/components/  WAJIB dalam folder kategori (plan/ map/ result/ ui/ layout/ glossary/)
frontend/public/   satu-satunya lokasi asset sampel
```

## Aturan desain yang tidak boleh dilanggar

1. **Pemisahan AI vs rules**: Gemini HANYA membaca denah → rooms `[ymin,xmin,ymax,xmax]` skala 0–1000. Semua keputusan kepatuhan/pelanggaran/skor itu deterministik di `audit_checker.py`. Jangan pernah biarkan model AI memberi verdict.
2. **Anti fake fallback**: Jika AI gagal/kuota habis (429), balas error transparan + tombol coba lagi. DILARANG data mock/data palsu. Frontend selalu menampilkan sumber data (`preset` / `ai:*` / `cache:*`).
3. **Palet 3 warna**: Ink `#0E0D0C–#2A2622`, Bone `#EDE7DA/#A39B8B`, Clay `#D2603F` (Clay khusus pelanggaran/masalah). Tanpa gradien, blur, emoji, animasi dekoratif, micro-copy uppercase.
4. **Alur logika audit**: `vision_parser.VISION_SYSTEM_PROMPT` → `classify_and_normalize_room` → `build_sanga_mandala_grid(kaja_quadrant, plan_north)` → `map_room_to_zone` → `run_spatial_audit`. Utamakan mengubah root cause di shared code, bukan patch di endpoint.

## Konfigurasi & env

- Backend membaca root `.env` (dan `backend/.env`). Var yang dibaca HANYA: `GEMINI_API_KEY`, `GEMINI_MODEL`, `PORT`, `HOST`. Jangan tambah var env tanpa menambah pembaca di `backend/core/config.py` + baris di `.env.example`.
- Frontend Next.js TIDAK membaca root `.env` — var FE (mis. `NEXT_PUBLIC_BACKEND_URL`) ditempatkan di `frontend/.env.local`.
- `CORS_ORIGINS` di `config.py` tanpa wildcard `"*"`; menambah domain deploy = tambah origin di list itu saja.
- Jika model AI diubah: urutan fallback ada di `vision_parser.call_gemini_vision` (`GEMINI_MODEL` → daftar kandidat).

## Konvensi pengujian

Golden case rotasi grid (4 kuadrant × 4 rotasi) dan 1 test per rule `audit_checker` ada di `backend/tests/test_engine.py`. Saat mengubah scoring/grid/classifier: jalankan pytest dulu; test gagal = perilaku berubah yang perlu review golden case sebelum update.

## Jangan

- Jangan buat folder `infra/`, microservice, atau abstraksi baru — proyek 2 service, pola co-located cukup.
- Jangan hardcode warning/logging dengan `print` di kode produksi gunakan logging.
- Jangan commit file biner sampel baru di root repo.
