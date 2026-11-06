# Panduan Deployment BaleKerta

Arsitektur deploy: **frontend di Vercel**, **backend di Render** (atau Docker di mana pun).

```
browser ──▶ Vercel (Next.js) ──fetch──▶ Render (FastAPI + Gemini)
           balekerta.web.id              <nama>.onrender.com
```

Semua variabel env dibagi dua timing:

| Var | Layanan | Kapan dibaca |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Vercel | **build** — di-bake ke JS; ubah = redeploy |
| `GEMINI_API_KEY` | Render | runtime — wajib untuk fitur upload denah |
| `GEMINI_MODEL` | Render | runtime — opsional, default `gemini-3.5-flash-lite` |
| `CORS_ORIGINS` | Render | runtime — origin frontend, comma-separated |
| `PORT` | Render | runtime — otomatis oleh platform, jangan di-set manual |

Tanpa `GEMINI_API_KEY` sistem tetap jalan: preset & kalkulator geodesik hidup, upload denah membalas 503.

## 1. Backend di Render

### Option A — Blueprint (disarankan)

`render.yaml` ada di root repo. Render Dashboard → **New + → Blueprint** → pilih repo → isi saat diminta:

- `GEMINI_API_KEY` — key dari Google AI Studio
- `CORS_ORIGINS` — origin frontend, mis. `https://balekerta.web.id` (lihat bagian CORS)

### Option B — Manual

New + → **Web Service** → connect repo → pengaturan:

- **Root Directory:** `backend` (monorepo — tanpa ini Render cari Dockerfile di root dan gagal)
- **Runtime:** Docker (auto-detect `backend/Dockerfile`)
- **Health Check Path:** `/api/health`
- **Env vars:** `GEMINI_API_KEY`, `CORS_ORIGINS` (opsional)

Selesai → service di `https://<nama>.onrender.com`, Swagger di `https://<nama>.onrender.com/docs`.

### Catatan plan Free

- Container sleep setelah idle → request pertama bisa 30–90 detik (cold start).
- 512 MB RAM cukup untuk PIL + numpy + uvicorn.
- Tidak ada persistent disk — cache SHA-256 hilang saat redeploy (aman, hanya ulang panggil Gemini).

## 2. Frontend di Vercel

1. **Import repo** → framework Next.js otomatis.
2. **Settings → General → Root Directory: `frontend`** (wajib untuk monorepo).
3. **Settings → Environment Variables** (sebelum deploy pertama):
   ```
   NEXT_PUBLIC_BACKEND_URL = https://<nama>.onrender.com
   ```
4. **Deploy.** `frontend/Dockerfile` diabaikan Vercel (build native) — Dockerfile tetap untuk jalur docker-compose/VPS.
5. **Custom domain (opsional):** project → Domains → tambah `balekerta.web.id`, lalu arahkan DNS:
   - A record → `76.76.21.21`, atau
   - CNAME → `cname.vercel-dns.com`

## 3. CORS

Backend mengizinkan origin lewat env `CORS_ORIGINS` (comma-separated). Tanpa env, fallback ke:
`localhost:3000`, `127.0.0.1:3000`, `balekerta.web.id`, `www.balekerta.web.id`.

- Frontend pasang custom domain `balekerta.web.id` → fallback sudah cukup.
- Frontend pakai `https://<xxx>.vercel.app` → **wajib** set `CORS_ORIGINS=https://<xxx>.vercel.app` di Render (dan setiap preview deployment `*.vercel.app` perlu ditambahkan — preview URL berganti tiap PR).

Wildcard `*` sengaja tidak dipakai: endpoint `/api/audit` membakar kuota Gemini API key.

## 4. Deploy lain (docker compose)

Di mesin/server dengan Docker:

```bash
cp .env.example .env   # isi GEMINI_API_KEY
docker compose up -d --build
```

Frontend `http://localhost:3000`, backend `http://localhost:8000`. Untuk VPS dengan domain, set `NEXT_PUBLIC_BACKEND_URL=https://api.<domain>` lalu `docker compose up -d --build` (build arg — harus build ulang kalau berubah).

## Troubleshooting

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| Build gagal: `package.json` tidak ditemukan | Root Directory belum diset | Set Root Directory `frontend` (Vercel) / `backend` (Render) |
| Audit gagal CORS di browser | Origin tidak diizinkan | Tambah origin ke `CORS_ORIGINS` di Render |
| Upload 503 `ai_unavailable` | `GEMINI_API_KEY` kosong/salah | Set env di Render, redeploy |
| Request pertama lambat | Cold start Render Free | Normal; atau upgrade plan |
| Fetch `localhost:8000` dari production | `NEXT_PUBLIC_BACKEND_URL` belum di-set saat build | Set env di Vercel, redeploy |
