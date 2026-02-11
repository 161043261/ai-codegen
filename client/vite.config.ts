import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("/radix-ui/") ||
              id.includes("/lucide-react/") ||
              id.includes("/class-variance-authority/") ||
              id.includes("/clsx/") ||
              id.includes("/tailwind-merge/") ||
              id.includes("/sonner/")
            ) {
              return "vendor-ui";
            }
            if (
              id.includes("/react-markdown/") ||
              id.includes("/react-syntax-highlighter/")
            ) {
              return "vendor-markdown";
            }
            if (
              id.includes("/react-hook-form/") ||
              id.includes("/@hookform/") ||
              id.includes("/zod/")
            ) {
              return "vendor-form";
            }
            if (
              id.includes("/@tanstack/react-query/") ||
              id.includes("/axios/") ||
              id.includes("/zustand/")
            ) {
              return "vendor-data";
            }
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router",
      "react-markdown",
      "react-syntax-highlighter",
      "react-syntax-highlighter/dist/esm/styles/prism",
      "react-syntax-highlighter/dist/esm/languages/prism/tsx",
      "react-syntax-highlighter/dist/esm/languages/prism/typescript",
      "react-syntax-highlighter/dist/esm/languages/prism/javascript",
      "react-syntax-highlighter/dist/esm/languages/prism/jsx",
      "react-syntax-highlighter/dist/esm/languages/prism/css",
      "react-syntax-highlighter/dist/esm/languages/prism/json",
      "react-syntax-highlighter/dist/esm/languages/prism/bash",
      "react-syntax-highlighter/dist/esm/languages/prism/markdown",
      "react-syntax-highlighter/dist/esm/languages/prism/python",
      "react-syntax-highlighter/dist/esm/languages/prism/java",
      "react-syntax-highlighter/dist/esm/languages/prism/sql",
      "react-syntax-highlighter/dist/esm/languages/prism/yaml",
      "react-syntax-highlighter/dist/esm/languages/prism/markup",
      "react-hook-form",
      "@hookform/resolvers",
      "@hookform/resolvers/zod",
      "zod",
      "@tanstack/react-query",
      "axios",
      "zustand",
      "sonner",
      "lucide-react",
      "radix-ui",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "next-themes",
      "dayjs",
    ],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8123",
        changeOrigin: true,
      },
    },
  },
});
