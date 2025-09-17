import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      // Only externalize real browser-safe modules if needed
      external: [
        "firebase",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "firebase/analytics",
      ],
    },
  },
});
