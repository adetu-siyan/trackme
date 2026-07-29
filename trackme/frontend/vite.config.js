import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './frontend',
  plugins: [react()],
  build: {
    outDir: '../dist',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sign': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})