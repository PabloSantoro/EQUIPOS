import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/equipos/',  // Configurado para subdirectorio de GEPRO
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@headlessui/react', 'clsx']
        }
      }
    }
  },
  server: {
    proxy: {
      '/equipos/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/equipos\/api/, '/api')
      }
    }
  }
})
