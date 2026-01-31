import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // Allow connections from outside container
    port: 5173,
    strictPort: false,
    watch: {
      usePolling: true, // Required for Docker on Windows/Mac
      interval: 100, // Check for changes every 100ms
    },
    hmr: {
      host: "localhost", // HMR websocket host
      port: 5173,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          map: ["ol"],
          utils: ["axios", "zod", "zustand"],
        },
      },
    },
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
