import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { authMockServerPlugin } from "./mock-server/auth";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue(), authMockServerPlugin(env.VITE_USE_MOCK === "true")],
    server: {
      port: 8088,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      },
    },
  };
});
