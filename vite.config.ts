import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/nash-power-play/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-xyflow': ['@xyflow/react'],
          'vendor-recharts': ['recharts'],
          'vendor-data': [
            './src/lib/seed-data.ts',
            './src/lib/data/ai-thinking.ts',
            './src/lib/data/analysts.ts',
            './src/lib/data/congress.ts',
            './src/lib/data/provinces.ts',
          ],
        },
      },
    },
  },
})
