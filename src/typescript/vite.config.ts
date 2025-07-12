import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
      name: 'KeyboardBridge',
      fileName: 'index',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['ws'],
      output: {
        globals: {
          ws: 'ws'
        }
      }
    }
  },
  server: {
    port: 8888,
    host: true
  },
  preview: {
    port: 8888,
    host: true
  }
}) 