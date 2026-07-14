import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "@/assets/styles/index.scss";
import App from "./App.vue";
import router from "./router";
import { permission } from "@/directives/permission";

function bootstrap() {
  const pinia = createPinia();
  const app = createApp(App);

  app.use(pinia);
  app.use(router);
  app.use(Antd);
  app.directive("permission", permission);

  app.mount("#app");
}

bootstrap();
