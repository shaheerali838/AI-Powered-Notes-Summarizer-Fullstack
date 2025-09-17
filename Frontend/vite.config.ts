import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        // changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      external: [
        "firebase-admin", // if you accidentally imported it in frontend
        "fs", // Node built-in
        "path", // Node built-in
      ],
    },
  },
});
