# Gunakan base image Python yang ringan
FROM python:3.10-slim

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
COPY requirements.txt .

# Install dependencies Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode backend ke dalam container
COPY . .

# Expose port yang digunakan FastAPI
EXPOSE 8000

# Perintah untuk menjalankan aplikasi saat container start
# Menggunakan host 0.0.0.0 agar bisa diakses dari luar container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]