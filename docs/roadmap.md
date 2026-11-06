# Roadmap Perapihan Codebase

> Dibuat: 2026-11-06 · Status: rencana (belum diimplementasi)
> Setiap tier adalah kandidat change OpenSpec terpisah. Implementasi hanya dimulai setelah keluar explore mode.

## Kondisi awal

- Branch `main` up to date, working tree bersih, 11 main spec valid, 0 change aktif.
- Tanpa CI/GitHub Actions; frontend tanpa test; backend punya pytest.
- 9 branch lokal, sebagian `fix/*` sudah ter-merge.

## Tier 1 — Hapus dead code (effort kecil, nol risiko)

File/ekspor yang tidak pernah di-import oleh konsumen mana pun:

- [ ] `frontend/src/components/glossary/GlossarySidebar.tsx` — hanya diekspor oleh barrel `index.ts`
- [ ] `frontend/src/components/glossary/index.ts` — barrel yang tak pernah di-import
- [ ] `frontend/src/components/layout/StickyControlDock.tsx`
- [ ] `frontend/src/components/layout/Stepper.tsx` — stepper hidup ada di `Header.tsx`, ini implementasi terpisah yang mati
- [ ] `frontend/src/components/ui/Card.tsx`
- [ ] `frontend/src/components/ui/Disclosure.tsx`
- [ ] `frontend/src/lib/animations.ts` — hapus 4 fungsi mati: `animateNumber`, `animateRotation`, `animateHighlightPulse`, `animateStaggerFadeIn` (yang terpakai hanya `animateStepTransition`)

Verifikasi: `npm run lint` + `npm run build` lulus.

## Tier 2 — Struktur & layering (effort sedang)

- [ ] Pindahkan interface `SangaMandalaGrid` dari `components/map/MiniZoneGrid.tsx` ke `types/audit.ts`, agar `lib/api.ts` tidak meng-import dari layer `components/` (layering kebalik). `ZoneCell`/`GridLayout` sudah tinggal di `types/audit.ts`.
- [ ] (opsional, risiko lebih tinggi) Pecah `app/panduan/PanduanPageClient.tsx` (698 baris) per-tab — tab `kalkulator` sudah komponen terpisah (`GlossaryCalculator`), tersisa `kamus` dan `sanga-mandala`.
- [ ] (tunda) `app/page.tsx` (736 baris) — jangan dipecah dulu; logika step sudah tersebar ke `plan/*` dan `result/*`, file ini sebagian besar JSX dan baru kena redesign.

Verifikasi: `npm run build` + QA visual halaman utama & panduan.

## Tier 3 — Konsistensi backend (effort kecil, bernilai)

- [ ] Tambah rule copy `INSUFFICIENT_ROOM_LABELS` ke `frontend/src/data/rules-copy.ts` — satu-satunya `rule_id` yang bolong (backend 16 unik, frontend 15). Saat ini `IssueCard` fallback ke `violation.issue` (tidak crash, tapi copy generik).
- [ ] Ganti 3 `print()` di `backend/engine/vision_parser.py` (baris 76, 95, 279) memakai `logging` — konsisten dengan `main.py`. `tools/*.py` boleh tetap `print()` (script CLI).

Verifikasi: `pytest` lulus; jalankan audit sekali dan cek log.

## Tier 4 — Infra (pilih sesuai tenaga)

- [ ] CI minimal (GitHub Actions): `next lint` + `next build` + `pytest` di tiap PR.
- [ ] Branch cleanup: hapus branch `fix/*` lokal yang sudah ter-merge; putuskan nasib `feat/qol-ux-simplification` (merge atau buang).
- [ ] (putusan) `openspec/` saat ini gitignored (`.gitignore:44`) — specs tidak ikut ke GitHub. Biarkan (lokal-saja) atau un-ignore agar tim lain dapat spesifikasi.

## Prioritas yang disarankan

1. Tier 1 dulu (langkah bersih tercepat)
2. Tier 1 + 3 digabung jadi satu change `cleanup/dead-code-and-consistency`
3. Tier 2 & 4 sebagai change terpisah, atau roadmap multi-change

## Catatan verifikasi yang belum dilakukan

- Test coverage backend belum diaudit nyata (hanya diketahui file tes ada).
- CSS/Tailwind class mati belum discan.
- `backend/data/perda_rules.json` semua `verified: false` — belum dieksplorasi alasannya.
