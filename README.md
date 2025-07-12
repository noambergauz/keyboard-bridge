# Keyboard Bridge

A Unicode-aware keyboard input bridge between web clients and xFreeRDP connections, bypassing X11 input conversion.

## Architecture

```
Web Client (TypeScript) → WebSocket → Python Daemon → Virtual USB Keyboard → xFreeRDP
```

### Components

1. **TypeScript Client Library** (`src/typescript/`)
   - Captures keyboard events from web browsers
   - Handles composition events (AltGr, dead keys, etc.)
   - Normalizes events and sends via WebSocket

2. **Python Daemon** (`src/python/`)
   - Creates virtual USB HID keyboard devices
   - Receives events via WebSocket
   - Sends Unicode characters to xFreeRDP via virtual device

3. **WebSocket Bridge** 
   - Real-time communication between client and daemon
   - Handles connection management and event routing

## Features

- ✅ Full Unicode support
- ✅ Composition event handling (AltGr, dead keys)
- ✅ Language-agnostic keyboard events
- ✅ Virtual USB HID device creation
- ✅ Real-time WebSocket communication
- ✅ Secure event normalization

## Installation

### Python Daemon

**Requirements:** [PDM](https://pdm.fming.dev/) (Python Dependency Manager)

```bash
cd src/python
pdm install
```

### TypeScript Client
```bash
cd src/typescript
npm install
npm run build
```

## Usage

### Starting the Daemon

```bash
pdm run keyboard-bridge --port 8080 --device-id 1
```

Or, if installed globally:

```bash
keyboard-bridge --port 8080 --device-id 1
```

### Using the TypeScript Client
```typescript
import { KeyboardBridge } from './keyboard-bridge';

const bridge = new KeyboardBridge('ws://localhost:8080');
bridge.connect();
```

## Integration with xFreeRDP

The daemon creates a virtual USB keyboard device that can be used with xFreeRDP:

```bash
xfreerdp /v:server /u:user /p:password /usb:id,dev:1
```

Where `dev:1` corresponds to the virtual keyboard device created by the daemon.

## Security Considerations

- WebSocket connections are validated
- Input events are sanitized and normalized
- Virtual devices are isolated from system keyboard
- No persistent storage of keyboard events 