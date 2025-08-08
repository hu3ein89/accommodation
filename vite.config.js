// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: {
      disableDotRule: true, // Important for handling tokens with special characters
      verbose: true // Helps with debugging
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        timeout: 10000
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          i18n: ['i18next', 'react-i18next']
        }
      }
    }
  }
})