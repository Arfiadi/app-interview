@echo off
title AI Interview App Control Panel
echo =====================================================
echo    AI Interview App Controller (Docker Compose)
echo =====================================================
echo.

:: Cek apakah docker daemon aktif
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker tidak terdeteksi aktif!
    echo Silakan jalankan Docker Desktop terlebih dahulu.
    echo.
    pause
    exit /b 1
)

echo [1/3] Menjalankan build dan container di background...
docker-compose up --build -d

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Gagal menjalankan Docker Compose.
    echo Pastikan file docker-compose.yaml dan .env sudah benar.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Aplikasi BERHASIL dijalankan!
echo =====================================================
echo   - Frontend: http://localhost:3005
echo   - Backend : http://localhost:8000
echo =====================================================
echo.
echo =====================================================
echo   PENTING: JANGAN TUTUP jendela ini kecuali ingin
echo   mematikan aplikasi secara otomatis.
echo.
echo   Tekan tombol apa saja di jendela ini untuk 
echo   MEMATIKAN aplikasi (docker-compose down).
echo =====================================================
pause > nul

echo.
echo [3/3] Mematikan semua container...
docker-compose down

echo.
echo =====================================================
echo   Aplikasi telah dihentikan secara bersih.
echo =====================================================
echo.
pause
