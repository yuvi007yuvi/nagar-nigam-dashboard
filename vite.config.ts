import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/gps-api': {
          target: 'https://oempowersupply.in',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/gps-api/, '')
        }
      }
    },
    plugins: [
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database', 'firebase/storage'],
            'vendor-leaflet': ['leaflet', 'react-leaflet'],
            'vendor-recharts': ['recharts'],
            'vendor-framer': ['framer-motion'],
          }
        }
      }
    }
  };
});