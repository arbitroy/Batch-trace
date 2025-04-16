import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
  };
  
  // Only add proxy configuration in development mode
  if (command === 'serve') {
    config.server = {
      proxy: {
        '/trace': {
          target: 'http://test-dev.api-eprod-solutions.com:9000',
          changeOrigin: true,
          secure: false,
        }
      }
    };
  }
  
  return config;
});