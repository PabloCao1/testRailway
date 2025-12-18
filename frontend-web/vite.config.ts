import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@heroicons/react'],
          'utils': ['axios', 'use-debounce']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000
  }
})