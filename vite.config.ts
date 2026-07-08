import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { authMockServerPlugin } from "./mock-server/auth";

export default defineConfig({
  plugins: [vue(), authMockServerPlugin()],
  server: {
    port: 8088,
    strictPort: true, // 端口被占用时退出
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
});
