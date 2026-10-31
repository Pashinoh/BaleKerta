@echo off
title BaleKerta Runner
echo ============================================================
echo   MENJALANKAN BALEKERTA - BALI DIGIFEST 2026
echo ============================================================
echo.
echo [1/2] Memulai FastAPI Backend di port 8000...
start "BaleKerta Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [2/2] Memulai Next.js Frontend di port 3000...
start "BaleKerta Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   Server sedang berjalan!
echo   Buka browser Anda di: http://localhost:3000
echo   Dokumentasi API Swagger di: http://localhost:8000/docs
echo ============================================================
pause
