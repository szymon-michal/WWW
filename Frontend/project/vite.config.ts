import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // Proxy także ścieżki API do backendu, aby uniknąć CORS w dev
      "/api": { target: "http://localhost:8080", changeOrigin: true, secure: false },
    },
  },
});
