# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000

# Seluruh dependensi (pillow, numpy, pydantic, dst.) punya wheel manylinux —
# build-essential tidak diperlukan dan menghemat ~250 MB.
COPY requirements.txt .
RUN pip install -r requirements.txt

# tests/ & tools/ tidak ikut (dikecualikan .dockerignore) — runtime hanya butuh
# main.py, core/, engine/, dan data/ (presets + perda_rules.json).
COPY . .

RUN useradd --system --no-create-home --shell /usr/sbin/nologin appuser \
 && mkdir -p data/cache \
 && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import os,urllib.request;urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','8000')+'/api/health',timeout=3)"

# Shell form agar ${PORT} ter-expand; sh mengeksekusi uvicorn langsung (PID 1 aman).
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
