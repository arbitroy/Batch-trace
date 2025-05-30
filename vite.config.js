import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/trace': {
        target: 'http://test-dev.api-eprod-solutions.com:9000',
        changeOrigin: true,
        secure: false,
      },
      '/call-api': {
        target: 'http://localhost:3000', // Your Express server port
        changeOrigin: true,
      }
    }
  }
});