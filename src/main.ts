import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { permission } from "@/directives/permission";

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true") {
    await import("./mock");
    console.log("[Mock] Loaded successfully");
  }

  const pinia = createPinia();
  const app = createApp(App);

  app.use(pinia);
  app.use(router);
  app.use(Antd);
  app.directive("permission", permission);

  app.mount("#app");
}

bootstrap();
