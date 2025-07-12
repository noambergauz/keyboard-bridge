#!/bin/bash

# Keyboard Bridge Docker Runner for Linux/macOS
# This script builds and runs the keyboard bridge daemon in Docker

set -e

echo "Building and running Keyboard Bridge Daemon in Docker..."

# Check if Docker is running
if ! docker version >/dev/null 2>&1; then
    echo "[ERROR] Docker is not running or not installed."
    echo "Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! docker-compose --version >/dev/null 2>&1; then
    echo "[ERROR] docker-compose is not available."
    echo "Please install Docker Compose."
    exit 1
fi

# Set default environment variables for Linux (real virtual keyboard)
export BRIDGE_PORT=${BRIDGE_PORT:-8080}
export BRIDGE_DEBUG=${BRIDGE_DEBUG:-false}
export BRIDGE_MOCK=${BRIDGE_MOCK:-false}
export BRIDGE_LOG_LEVEL=${BRIDGE_LOG_LEVEL:-info}

echo "[INFO] Configuration:"
echo "[INFO]   Port: $BRIDGE_PORT"
echo "[INFO]   Debug: $BRIDGE_DEBUG"
echo "[INFO]   Mock Mode: $BRIDGE_MOCK"
echo "[INFO]   Log Level: $BRIDGE_LOG_LEVEL"
echo

# Check if running on Linux with uinput support
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [[ -e "/dev/uinput" ]]; then
        echo "[INFO] Linux detected with uinput support - using real virtual keyboard"
        COMPOSE_FILE="docker-compose.yml"
    else
        echo "[WARNING] Linux detected but no /dev/uinput found - falling back to mock mode"
        export BRIDGE_MOCK=true
        COMPOSE_FILE="docker-compose.yml"
    fi
else
    echo "[INFO] Non-Linux system detected - using mock mode"
    export BRIDGE_MOCK=true
    COMPOSE_FILE="docker-compose.yml"
fi

echo "[INFO] Building Docker image..."
docker-compose -f "$COMPOSE_FILE" build

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to build Docker image."
    exit 1
fi

echo "[INFO] Starting Keyboard Bridge Daemon..."
echo "[INFO] The daemon will be available at ws://localhost:$BRIDGE_PORT"
echo "[INFO] Press Ctrl+C to stop the daemon"
echo

# Run the container
docker-compose -f "$COMPOSE_FILE" up

echo
echo "[INFO] Keyboard Bridge Daemon stopped." 