import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      "lucide-react",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
    ],
  },
  build: {
    rollupOptions: {
      // Only externalize real browser-safe modules if needed
      external: [],
    },
  },
});
