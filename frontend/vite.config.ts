import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-vendor';
          if (id.includes('/react-router-dom/') || id.includes('/react-router/')) return 'router';
          if (id.includes('/@tanstack/')) return 'query';
          if (id.includes('/react-hook-form/') || id.includes('/@hookform/') || id.includes('/zod/')) return 'forms';
          if (id.includes('/lucide-react/')) return 'icons';
          if (id.includes('/@dnd-kit/')) return 'dnd';
          if (id.includes('/node_modules/')) return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
});
