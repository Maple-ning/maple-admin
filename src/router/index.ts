import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { usePermissionStore } from "@/stores/permission";
import { constantRoutes } from "./constantRoutes.ts";

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
});

// 白名单
const whiteList = ["/login", "/404"];

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  const hasToken = userStore.token;

  if (hasToken) {
    if (to.path === "/login") {
      next("/");
      return;
    }

    // 检查是否已添加动态路由
    if (!userStore.roles.length) {
      try {
        // 获取用户信息（角色+权限码）
        await userStore.getUserInfo();

        // 生成动态路由
        const accessRoutes = await permissionStore.generateRoutes(
          userStore.roles,
          userStore.permissions,
        );

        // 动态添加路由
        accessRoutes.forEach((route) => {
          router.addRoute(route);
        });

        // 解决重复路由警告
        const isDuplicateError = (err: any) =>
          err.message?.includes("Duplicate") || err.message?.includes("重複");

        // 重定向到目标路由
        next({ ...to, replace: true });
      } catch (error) {
        await userStore.logout();
        next(`/login?redirect=${to.path}`);
      }
    } else {
      next();
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
  }
});

export default router;
