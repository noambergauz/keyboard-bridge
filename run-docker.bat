@echo off
REM Keyboard Bridge Docker Runner for Windows
REM This script builds and runs the keyboard bridge daemon in Docker

echo Building and running Keyboard Bridge Daemon in Docker...

REM Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running or not installed.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] docker-compose is not available.
    echo Please install Docker Compose or use Docker Desktop.
    pause
    exit /b 1
)

REM Set default environment variables for Windows (mock mode)
if "%BRIDGE_PORT%"=="" set BRIDGE_PORT=8080
if "%BRIDGE_DEBUG%"=="" set BRIDGE_DEBUG=false
if "%BRIDGE_MOCK%"=="" set BRIDGE_MOCK=true
if "%BRIDGE_LOG_LEVEL%"=="" set BRIDGE_LOG_LEVEL=info

echo [INFO] Configuration:
echo [INFO]   Port: %BRIDGE_PORT%
echo [INFO]   Debug: %BRIDGE_DEBUG%
echo [INFO]   Mock Mode: %BRIDGE_MOCK%
echo [INFO]   Log Level: %BRIDGE_LOG_LEVEL%
echo.

echo [INFO] Building Docker image...
docker-compose -f docker-compose.windows.yml build

if errorlevel 1 (
    echo [ERROR] Failed to build Docker image.
    pause
    exit /b 1
)

echo [INFO] Starting Keyboard Bridge Daemon...
echo [INFO] The daemon will be available at ws://localhost:%BRIDGE_PORT%
echo [INFO] Press Ctrl+C to stop the daemon
echo.

REM Run the container
docker-compose -f docker-compose.windows.yml up

echo.
echo [INFO] Keyboard Bridge Daemon stopped.
pause 