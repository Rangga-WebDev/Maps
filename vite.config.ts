/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Saat dev, React disajikan Vite (port 5173) sedangkan server Socket.io
// di port 3000. Proxy ini meneruskan koneksi /socket.io ke server,
// jadi di kode React cukup pakai io() tanpa menulis URL server.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
