import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_URL ?? 'http://backend:8000'

  return {
    plugins: [react()],
    server: {
      port: 3001,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiBase,
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
  }
})
