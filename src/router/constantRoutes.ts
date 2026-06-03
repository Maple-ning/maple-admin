import type { RouteRecordRaw } from "vue-router";

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
    meta: {
      title: "登录",
      requiresAuth: false,
    },
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/Error-page/404.vue"),
    meta: {
      title: "404",
      requiresAuth: false,
    },
  },
  {
    path: "/",
    name: "Layout",
    component: () => import("@/layouts/index.vue"),
    redirect: "/dashboard",
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/Dashboard/index.vue"),
        meta: {
          title: "仪表盘",
          requiresAuth: true,
          icon: "dashboard",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    meta: { requiresAuth: false },
  },
];
