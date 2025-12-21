import { defineConfig } from "vite";
import path from "path";
import compression from "vite-plugin-compression";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],
  root: ".",
  publicDir: "public",
  server: {
    port: 5175,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: "esnext",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: ['@srexi/purecounterjs'],
      input: {
        main: path.resolve(__dirname, "src/index.html"),
        login: path.resolve(__dirname, "src/login.html"),
        register: path.resolve(__dirname, "src/register.html"),
        dashboard: path.resolve(__dirname, "src/dashboard.html"),
        "forgot-password": path.resolve(__dirname, "src/forgot-password.html"),
        "reset-password": path.resolve(__dirname, "src/reset-password.html"),
        "verify-code": path.resolve(__dirname, "src/verify-code.html"),
        "service-details": path.resolve(__dirname, "src/service-details.html"),
        freelancers: path.resolve(__dirname, "src/freelancers.html"),
        employees: path.resolve(__dirname, "src/employees.html"),
        "starter-page": path.resolve(__dirname, "src/starter-page.html"),
        loading: path.resolve(__dirname, "src/loading.html"),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
  },
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./server/src"),
    },
  },
  optimizeDeps: {
    include: ['aos', 'glightbox', 'swiper']
  }
});
