# Keyboard Bridge

A Unicode-aware keyboard input bridge between web clients and xFreeRDP connections, bypassing X11 input conversion. This solution provides real-time keyboard event transmission from web browsers to RDP sessions via virtual USB HID devices.

## 🏗️ Architecture

```
Web Browser → TypeScript Client → WebSocket → Python Daemon → Virtual USB Keyboard → xFreeRDP
```

### Components

1. **TypeScript Client Library** (`src/typescript/`)
   - Captures keyboard events from web browsers with full Unicode support
   - Handles composition events (AltGr, dead keys, etc.)
   - Normalizes events and sends via WebSocket
   - Built with Vite for modern development experience
   - Supports 100+ keys including function keys, numpad, and media controls

2. **Python Daemon** (`src/python/`)
   - Creates virtual USB HID keyboard devices using uinput
   - Receives events via WebSocket with real-time processing
   - Sends Unicode characters to xFreeRDP via virtual device
   - Built as installable package with PDM
   - Fallback mock mode for Windows/unsupported systems

3. **WebSocket Bridge** 
   - Real-time communication between client and daemon
   - Handles connection management and event routing
   - Configurable keymap support for custom mappings

## ✨ Features

- ✅ **Full Unicode Support** - Complete Unicode character transmission
- ✅ **Comprehensive Key Coverage** - 100+ keys including function keys, numpad, media controls
- ✅ **Composition Event Handling** - AltGr, dead keys, and complex input methods
- ✅ **Language-Agnostic** - Works with any keyboard layout and language
- ✅ **Virtual USB HID Device** - Creates real virtual keyboard devices
- ✅ **Real-Time WebSocket Communication** - Low-latency event transmission
- ✅ **Cross-Platform Support** - Linux (full), Windows/macOS (mock mode)
- ✅ **Docker Support** - Containerized deployment with environment configuration
- ✅ **Modern Tooling** - PDM (Python), Vite (TypeScript), ESLint, MyPy
- ✅ **CI/CD Pipeline** - Automated builds, testing, and packaging
- ✅ **Configurable Keymaps** - Custom key mappings via JSON files
- ✅ **Debug & Logging** - Comprehensive logging and debug modes

## 🚀 Quick Start

### Prerequisites
- **Linux**: Root access or `input` group membership for virtual keyboard
- **Windows/macOS**: Mock mode (no virtual keyboard, but WebSocket bridge works)
- **Python 3.12+** and **Node.js 18+**

### 1. Python Daemon Setup

```bash
cd src/python
pdm install
pdm run keyboard-bridge --port 8080 --device-id 1
```

### 2. TypeScript Client Setup

```bash
cd src/typescript
npm install
npm run build
```

### 3. Using the Client

```typescript
import { KeyboardBridge } from './dist/index.js';

const bridge = new KeyboardBridge({
  url: 'ws://localhost:8080',
  debug: true
});

await bridge.start();
```

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Build the Python package wheel
cd src/python && pdm build && cd ../..

# Build and run with Docker Compose
docker compose up --build
```

### Environment Configuration

```bash
# Custom configuration
BRIDGE_PORT=9090 BRIDGE_DEBUG=true docker compose up --build

# Windows (mock mode)
docker compose -f docker-compose.windows.yml up --build
```

## 📦 Installation

### Python Daemon (PDM)

```bash
cd src/python
pdm install
pdm build  # Creates distributable wheel
```

### TypeScript Client (Vite)

```bash
cd src/typescript
npm install
npm run build  # Creates ES/UMD modules in dist/
```

## 🔧 Usage

### Starting the Daemon

```bash
# Development mode
pdm run keyboard-bridge --port 8080 --device-id 1 --debug

# Production mode (after wheel installation)
keyboard-bridge --port 8080 --host 0.0.0.0

# Mock mode (Windows/macOS)
keyboard-bridge --mock --port 8080
```

### Using the TypeScript Client

```typescript
import { KeyboardBridge } from 'keyboard-bridge-client';

const bridge = new KeyboardBridge({
  url: 'ws://localhost:8080',
  debug: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10
});

// Start the bridge
await bridge.start();

// Check connection status
console.log('Connected:', bridge.connected);

// Stop the bridge
bridge.stop();
```

### Integration with xFreeRDP

```bash
# Connect to RDP server with virtual keyboard
xfreerdp /v:your-server /u:username /p:password /usb:id,dev:1
```

## 🛠️ Development

### Python Development

```bash
cd src/python
pdm install
pdm run lint      # Black + isort
pdm run type-check # MyPy type checking
pdm run test      # Run tests
```

### TypeScript Development

```bash
cd src/typescript
npm install
npm run dev       # Vite dev server
npm run lint      # ESLint
npm run build     # Production build
```

### Testing

```bash
# Python tests
cd src/python && pdm run test

# TypeScript tests  
cd src/typescript && npm test
```

## 🔐 Security Considerations

- **Network Security**: WebSocket connections are unencrypted by default. Use WSS for production
- **Device Isolation**: Virtual keyboard devices are isolated from system keyboard
- **Input Validation**: All keyboard events are validated and sanitized
- **Access Control**: Consider implementing WebSocket authentication for production

## 📋 Configuration

### Environment Variables (Docker)

| Variable | Default | Description |
|----------|---------|-------------|
| `BRIDGE_HOST` | `0.0.0.0` | WebSocket server host |
| `BRIDGE_PORT` | `8080` | WebSocket server port |
| `BRIDGE_DEVICE_ID` | `1` | Virtual keyboard device ID |
| `BRIDGE_DEBUG` | `false` | Enable debug logging |
| `BRIDGE_MOCK` | `false` | Use mock keyboard mode |
| `BRIDGE_KEYMAP_FILE` | (empty) | Path to keymap JSON file |
| `BRIDGE_LOG_LEVEL` | `info` | Logging level |

### Keymap Configuration

```json
{
  "65": "KEY_A",
  "66": "KEY_B",
  "32": "KEY_SPACE",
  "13": "KEY_ENTER"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied for /dev/uinput**
   ```bash
   sudo chmod 666 /dev/uinput
   sudo usermod -a -G input $USER
   ```

2. **Virtual Keyboard Device Creation Fails**
   ```bash
   sudo modprobe uinput
   # Use --mock flag on Windows/macOS
   ```

3. **WebSocket Connection Fails**
   ```bash
   netstat -tlnp | grep 8080
   # Check firewall settings
   ```

### Debug Mode

```bash
# Python daemon
keyboard-bridge --debug --port 8080

# TypeScript client
const bridge = new KeyboardBridge({
  url: 'ws://localhost:8080',
  debug: true
});
```

## 📚 Documentation

- **[Setup Guide](SETUP.md)** - Detailed installation and configuration
- **[Docker Guide](DOCKER.md)** - Containerized deployment instructions
- **[API Documentation](src/typescript/README.md)** - TypeScript client API
- **[Python API](src/python/README.md)** - Python daemon API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/bergauznoam/keyboard-bridge/issues)
- **Documentation**: [Project Wiki](https://github.com/bergauznoam/keyboard-bridge/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/bergauznoam/keyboard-bridge/discussions) 