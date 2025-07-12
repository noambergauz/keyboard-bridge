# Keyboard Bridge Client (Vite)

A TypeScript library that captures keyboard events from web browsers and sends them to a Python daemon via WebSocket for RDP integration.

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
npm install
```

### Development Server

Start the Vite development server:

```bash
npm run dev
```

The server will be available at `http://localhost:8888` (or the next available port).

### Build

Build the library for production:

```bash
npm run build
```

This generates:
- `dist/index.js` - ES module format
- `dist/index.umd.cjs` - UMD format for browser compatibility

### Preview

Preview the production build:

```bash
npm run preview
```

## Usage

### ES Module (Recommended)

```javascript
import { KeyboardBridge } from './dist/index.js';

const bridge = new KeyboardBridge({
  url: 'ws://localhost:8080',
  debug: true
});

await bridge.start();
```

### UMD (Browser)

```html
<script src="./dist/index.umd.cjs"></script>
<script>
  const bridge = new KeyboardBridge({
    url: 'ws://localhost:8080',
    debug: true
  });
  
  bridge.start();
</script>
```

## Development vs Production

- **Development**: Use `npm run dev` for hot reloading and TypeScript compilation
- **Production**: Use `npm run build` to create optimized bundles

## Example

Open `index.html` in your browser to see a working example of the keyboard bridge. 