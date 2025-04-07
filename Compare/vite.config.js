import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      'diff': path.resolve(__dirname, 'node_modules/diff/lib/diff.js')
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'diff']
  },
  build: {
    commonjsOptions: {
      include: [/pdfjs-dist/, /diff/]
    }
  }
}) 