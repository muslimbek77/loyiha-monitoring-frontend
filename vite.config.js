import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  server: {
    port: 5175,
    strictPort: true,
  },
  plugins: [
    react({
      babel:
        mode === "development"
          ? {
              plugins: [
                [
                  "@locator/babel-jsx/dist",
                  {
                    env: "development",
                  },
                ],
              ],
            }
          : undefined,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }

          if (
            id.includes("/react-router/") ||
            id.includes("/react-router-dom/")
          ) {
            return "router-vendor";
          }

          if (
            id.includes("/antd/") ||
            id.includes("/@ant-design/") ||
            id.includes("/rc-")
          ) {
            return "antd-vendor";
          }

          if (
            id.includes("/dayjs/") ||
            id.includes("/axios/") ||
            id.includes("/zustand/")
          ) {
            return "data-vendor";
          }

        },
      },
    },
  },
}));
