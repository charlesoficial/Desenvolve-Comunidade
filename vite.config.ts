import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Resolve alias pra evitar imports relativos longos.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "app/javascript"),
      "@components": path.resolve(__dirname, "app/javascript/components"),
      "@data": path.resolve(__dirname, "app/javascript/data"),
      "@lib": path.resolve(__dirname, "app/javascript/lib"),
      "@types": path.resolve(__dirname, "app/javascript/types"),
      "@design": path.resolve(__dirname, "app/javascript/design-system"),
    },
  },

  server: {
    // Forca IPv4 para resolver problema do Node 25+ no Windows que escuta só em IPv6.
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,

    // Proxy do Rails API para evitar CORS em desenvolvimento.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: false,
      },
      "/cable": {
        target: "ws://127.0.0.1:3000",
        ws: true,
        changeOrigin: false,
      },
      "/rails": {
        target: "http://127.0.0.1:3000",
        changeOrigin: false,
      },
    },
  },

  // Otimizacao do bundle de producao.
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
  },
});
