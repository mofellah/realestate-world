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
        manualChunks(id) {
          // React vendor bundle (shared across all pages)
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router")
          ) {
            return "react-vendor";
          }

          // Map library (only loaded on map pages)
          if (id.includes("node_modules/ol") || id.includes("MapView")) {
            return "map";
          }

          // Dashboard routes share chunk
          if (id.includes("pages/dashboard") && !id.includes("node_modules")) {
            return "dashboard";
          }

          // Agency routes share chunk
          if (id.includes("pages/agency") && !id.includes("node_modules")) {
            return "agency";
          }

          // Admin routes share chunk
          if (id.includes("pages/admin") && !id.includes("node_modules")) {
            return "admin";
          }

          // Auth routes share chunk
          if (
            (id.includes("pages/login") || id.includes("pages/register")) &&
            !id.includes("node_modules")
          ) {
            return "auth";
          }

          // Utilities
          if (
            id.includes("node_modules/axios") ||
            id.includes("node_modules/zod") ||
            id.includes("node_modules/zustand")
          ) {
            return "utils";
          }

          // Other vendor dependencies
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
