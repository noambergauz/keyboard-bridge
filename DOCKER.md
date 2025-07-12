# Docker Usage: Keyboard Bridge

This guide explains how to build and run the Keyboard Bridge Python daemon in Docker, using the package wheel (not the source code) for installation.

---

## 1. Build the Python Package Wheel

Before building the Docker image, you must build the Python package wheel locally:

```sh
cd src/python
pdm build
```

This will create a `dist/` directory with a `.whl` file (e.g., `keyboard_bridge-1.0.0-py3-none-any.whl`).

---

## 2. Build the Docker Image

From the project root:

```sh
docker build -t keyboard-bridge .
```

The Dockerfile will:
- Install Python 3.12 and all system dependencies
- Copy only the built wheel from `src/python/dist/`
- Install the package using `pip install dist/*.whl`
- Set up the correct user, permissions, and healthcheck
- Run the daemon using the installed CLI entry point

---

## 3. Run with Docker Compose

### Linux (with real virtual keyboard support)

```sh
# Use default settings
docker compose up --build

# With custom environment variables
BRIDGE_PORT=9090 BRIDGE_DEBUG=true docker compose up --build
```

### Windows (mock mode)

```sh
# Use Windows-specific compose file
docker compose -f docker-compose.windows.yml up --build
```

---

## 4. Environment Variables

All daemon arguments are exposed as environment variables:

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `BRIDGE_HOST` | `0.0.0.0` | WebSocket server host |
| `BRIDGE_PORT` | `8080` | WebSocket server port |
| `BRIDGE_DEVICE_ID` | `1` | Virtual keyboard device ID |
| `BRIDGE_DEBUG` | `false` | Enable debug logging |
| `BRIDGE_MOCK` | `false` (Linux) / `true` (Windows) | Use mock keyboard mode |
| `BRIDGE_KEYMAP_FILE` | (empty) | Path to keymap JSON file |
| `BRIDGE_LOG_LEVEL` | `info` | Logging level (debug, info, warning, error) |

### Example: Custom Configuration

```sh
# Create a .env file
cat > .env << EOF
BRIDGE_PORT=9090
BRIDGE_DEBUG=true
BRIDGE_MOCK=false
BRIDGE_LOG_LEVEL=debug
EOF

# Run with custom settings
docker compose up --build
```

---

## 5. Direct Docker Run

```sh
# Basic run
docker run --rm -p 8080:8080 --device /dev/uinput keyboard-bridge

# With environment variables
docker run --rm \
  -p 9090:8080 \
  --device /dev/uinput \
  -e BRIDGE_PORT=8080 \
  -e BRIDGE_DEBUG=true \
  -e BRIDGE_MOCK=false \
  keyboard-bridge

# With additional command-line arguments
docker run --rm \
  -p 8080:8080 \
  --device /dev/uinput \
  -e BRIDGE_DEBUG=true \
  keyboard-bridge --port 8080 --host 0.0.0.0
```

---

## 6. Troubleshooting

- **No wheel file found:**
  - Make sure you ran `pdm build` in `src/python` before building the Docker image.
  - The `dist/` directory must contain a `.whl` file for the Docker build to succeed.
- **Dependency issues:**
  - The Docker image uses Python 3.12. Ensure your wheel is built for Python 3.12 compatibility.
- **Device permissions:**
  - The container must be run with `--device /dev/uinput` for virtual keyboard support on Linux hosts.
- **Mock mode on Windows:**
  - Use `docker-compose.windows.yml` or set `BRIDGE_MOCK=true` for Windows hosts.

---

## 7. Example: Full Workflow

```sh
# Build the wheel
cd src/python
pdm build
cd ../..

# Build the Docker image
docker build -t keyboard-bridge .

# Run with custom configuration
BRIDGE_PORT=9090 BRIDGE_DEBUG=true docker compose up --build
```

---

## 8. Notes

- The Docker image **does not contain the Python source code**—only the built package wheel is included.
- You do **not** need to use PDM inside the container; all dependencies are installed via pip from the wheel.
- For development, use PDM and the source code locally. For production, use the wheel-based Docker workflow above.
- The entrypoint script automatically converts environment variables to command-line arguments.
- Additional command-line arguments can be passed after the image name and will be appended to the environment-based arguments. 