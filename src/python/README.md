# Keyboard Bridge Python Daemon

A Python daemon that creates virtual USB HID keyboard devices and handles keyboard events from TypeScript clients via WebSocket connections.

## Features

- ✅ Virtual USB HID keyboard device creation
- ✅ WebSocket server for real-time communication
- ✅ Full Unicode support with composition events
- ✅ Configurable key mapping
- ✅ Mock mode for development/testing
- ✅ Cross-platform compatibility

## Installation

### Requirements
- Python 3.8-3.12
- Linux with uinput support (for real virtual keyboard)
- Root access or input group membership (Linux)

### Using PDM (Recommended)

```bash
# Install PDM if not already installed
pip install pdm

# Install dependencies and package
pdm install

# Build wheel for distribution
pdm build
```

### Using pip

```bash
# Install from wheel
pip install dist/*.whl
```

## Usage

### Command Line Interface

```bash
# Basic usage
keyboard-bridge

# With custom settings
keyboard-bridge --port 8080 --host 0.0.0.0 --device-id 1 --debug

# Mock mode (no virtual keyboard device)
keyboard-bridge --debug
```

### Arguments

- `--port`: WebSocket server port (default: 8080)
- `--host`: WebSocket server host (default: localhost)
- `--device-id`: Virtual keyboard device ID (default: 1)
- `--keymap`: Path to key mapping JSON file
- `--debug`: Enable debug logging

### Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# With custom environment variables
BRIDGE_PORT=9090 BRIDGE_DEBUG=true docker compose up --build
```

## Architecture

```
TypeScript Client → WebSocket → Python Daemon → Virtual Keyboard → xFreeRDP
```

The daemon creates a virtual USB HID keyboard device that can be used with xFreeRDP:

```bash
xfreerdp /v:server /u:user /p:password /usb:id,dev:1
```

## Development

### Running Tests

```bash
pdm run test
```

### Linting and Type Checking

```bash
pdm run lint
pdm run type-check
```

### Development Mode

```bash
pdm run dev
```

## Security Considerations

- WebSocket connections are validated
- Input events are sanitized and normalized
- Virtual devices are isolated from system keyboard
- No persistent storage of keyboard events

## License

MIT License 