Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MENJALANKAN BALEKERTA - BALI DIGIFEST 2026" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $PSScriptRoot

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Write-Host "`nServer berhasil diluncurkan!" -ForegroundColor Green
Write-Host "Aplikasi Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Swagger Backend:   http://localhost:8000/docs" -ForegroundColor White
