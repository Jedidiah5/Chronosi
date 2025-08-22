@echo off
echo Starting Chronosi Backend Services...
echo.

echo Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and start it first.
    pause
    exit /b 1
)

echo Docker is running. Starting services...
echo.

echo Starting PostgreSQL, Redis, and Backend...
docker-compose up -d

echo.
echo Services are starting up...
echo.
echo PostgreSQL: http://localhost:5432
echo Redis: http://localhost:6379
echo Backend API: http://localhost:5000
echo Health Check: http://localhost:5000/health
echo.
echo To view logs: docker-compose logs -f backend
echo To stop services: docker-compose down
echo.
echo Press any key to view backend logs...
pause >nul

docker-compose logs -f backend

