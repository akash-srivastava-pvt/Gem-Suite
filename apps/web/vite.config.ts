import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 1. Base must be './' or '/' since you are serving via localhost
  base: '/', 
  server: {
    port: 3000,
    host: '127.0.0.1', 
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 2. Ensure assets are compiled to standard folder
    assetsDir: 'assets'
  }
});