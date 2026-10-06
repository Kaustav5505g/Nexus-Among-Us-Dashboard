import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        portal: resolve(__dirname, 'index2.html'),
        player: resolve(__dirname, 'player.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});

