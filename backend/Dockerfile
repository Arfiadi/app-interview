# Gunakan base image Python yang ringan
FROM python:3.11-slim

# Set working directory di dalam container
WORKDIR /app

# Cegah Python membuat file .pyc dan buffering output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies sistem yang mungkin dibutuhkan
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Salin requirements.txt terlebih dahulu (untuk caching layer Docker yang efisien)
COPY requirements.txt ./backend/requirements.txt

# Install dependencies Python
RUN pip install --no-cache-dir -r ./backend/requirements.txt


# Salin seluruh kode backend ke dalam container
COPY . ./backend

# Cloud Run injects PORT env var (default 8080)
EXPOSE 8080

# Use shell form so $PORT is expanded at runtime (Cloud Run requirement)
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}