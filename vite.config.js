import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Vercel: base: '/' でルート公開
  // GitHub Pages で /Drawell/ に公開する場合は base: '/Drawell/' に変更
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
