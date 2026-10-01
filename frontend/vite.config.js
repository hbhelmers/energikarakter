import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Send /api requests to the FastAPI backend, so we don't need CORS in development
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
