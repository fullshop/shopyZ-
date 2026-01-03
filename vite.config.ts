import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Add the line below. It must match your repository name exactly!
  base: '/shopyZ-/', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});