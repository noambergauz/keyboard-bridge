# Keyboard Bridge Setup Guide

This guide will help you set up and run the Keyboard Bridge solution for RDP connections.

## Prerequisites

### System Requirements
- Linux system with kernel support for uinput (for full virtual keyboard functionality)
- Python 3.8–3.12
- Node.js 18+ (for TypeScript build)
- Root/sudo access (for virtual keyboard device creation)
- (Optional) Docker for containerized deployment

### Required Permissions
The Python daemon needs to create virtual USB HID devices, which requires:
- Root access or membership in the `input` group
- Access to `/dev/uinput` device (Linux only)

## Installation

### 1. Python Daemon Setup (PDM)

```bash
# Navigate to the Python directory
cd src/python

# Install PDM if not already installed
pip install pdm

# Install dependencies and the package (editable mode for development)
pdm install

# Build a wheel (for distribution)
pdm build
```

### 2. TypeScript Client Setup (Vite)

```bash
# Navigate to the TypeScript directory
cd src/typescript

# Install dependencies
npm install

# Build the library (output in dist/)
npm run build
```

## Usage

### 1. Start the Python Daemon

#### From source (development):
```bash
# Run with default settings (requires root for virtual keyboard)
sudo pdm run keyboard-bridge

# Run in mock mode (no /dev/uinput, e.g. on Windows)
pdm run keyboard-bridge --mock
```

#### From installed package (wheel):
```bash
# After installing the wheel (pip install dist/*.whl)
sudo keyboard-bridge
```

#### With Docker (Linux only for real virtual keyboard):
```bash
# Build and run with Docker Compose
# For Linux host:
docker compose up --build
# For Windows host (mock mode):
docker compose -f docker-compose.windows.yml up --build
```

### 2. Use the TypeScript Client

```typescript
import { KeyboardBridge } from 'keyboard-bridge-client';

const bridge = new KeyboardBridge({
    url: 'ws://localhost:8080',
    debug: true
});

await bridge.start();
```

### 3. Integration with xFreeRDP

Once the daemon is running, you can use the virtual keyboard device with xFreeRDP:

```bash
xfreerdp /v:your-server /u:username /p:password /usb:id,dev:1
```
Where `dev:1` corresponds to the virtual keyboard device created by the daemon.

## Testing

### Python Daemon
```bash
cd src/python
pdm run test
```

### TypeScript Client
```bash
cd src/typescript
npm test
```

## Continuous Integration

GitHub Actions workflows automatically build, test, and package both Python and TypeScript projects on every push, PR, and release. See `.github/workflows/` for details.

## Troubleshooting

### Common Issues

1. **Permission Denied for /dev/uinput**
   ```bash
   sudo chmod 666 /dev/uinput
   sudo usermod -a -G input $USER
   ```
2. **Virtual Keyboard Device Creation Fails**
   - Ensure uinput module is loaded: `sudo modprobe uinput`
   - Check kernel support: `ls /dev/uinput`
   - On Windows, use mock mode (`--mock`)
3. **WebSocket Connection Fails**
   - Verify the daemon is running: `netstat -tlnp | grep 8080`
   - Check firewall settings
4. **TypeScript Build Errors**
   ```bash
   cd src/typescript
   npm install
   npm run build
   ```

### Debug Mode

Enable debug logging for both components:

**Python Daemon:**
```bash
sudo keyboard-bridge --debug
```

**TypeScript Client:**
```typescript
const bridge = new KeyboardBridge({
    url: 'ws://localhost:8080',
    debug: true
});
```

## Security Considerations

- **Network Security:** The WebSocket connection is unencrypted by default. For production use, implement WSS (WebSocket Secure).
- **Device Isolation:** Virtual keyboard devices are isolated from the system keyboard to prevent conflicts.
- **Input Validation:** All keyboard events are validated and sanitized before processing.
- **Access Control:** Consider implementing authentication for WebSocket connections in production.

## Architecture Details

### Data Flow
```
Web Browser → TypeScript Client → WebSocket → Python Daemon → Virtual Keyboard → xFreeRDP
```

### Unicode Support
The solution supports full Unicode input through:
- Direct character transmission
- Composition event handling
- Modifier state tracking (AltGr, etc.)

## Development

### Adding New Features
- **Python:** Add modules in `src/python/keyboard_bridge/`
- **TypeScript:** Add modules in `src/typescript/src/`

### Testing
```bash
# Python
cd src/python && pdm run test
# TypeScript
cd src/typescript && npm test
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the debug logs
3. Verify system requirements and permissions
4. Open an issue on GitHub 