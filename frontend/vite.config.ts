import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api-1001': {
        target: 'https://1001albumsgenerator.com/api/v1/projects',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-1001/, ''),
      },
    },
  },
})