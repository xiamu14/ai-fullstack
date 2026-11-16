import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const backendUrl = process.env.VITE_BACKEND_URL ?? 'http://localhost:3020';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    viteReact(),
  ],
  server: {
    proxy: {
      '/rpc': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
