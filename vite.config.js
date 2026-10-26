import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  base: './',
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1500,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
