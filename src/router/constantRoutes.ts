import type { RouteRecordRaw } from "vue-router";

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
    meta: { title: "登录", requiresAuth: false },
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/Error-page/404.vue"),
    meta: { title: "404", requiresAuth: false },
  },
  {
    path: "/403",
    name: "403",
    component: () => import("@/views/Error-page/403.vue"),
    meta: { title: "403", requiresAuth: true },
  },
  {
    path: "/",
    name: "Root",
    component: { render: () => null },
    meta: { requiresAuth: true },
  },
];
