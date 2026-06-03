import { defineStore } from "pinia";
import { ref } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { asyncRoutes } from "@/router/asyncRoutes";

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([]);

  // 根据角色和权限过滤路由
  const filterRoutes = (roles: string[], permissions: string[]) => {
    const filter = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
      return routes.filter((route) => {
        const meta = route.meta; // 去掉 as RouteMeta，直接使用
        if (meta?.requiresAuth) {
          // 角色匹配
          if (meta.roles && !meta.roles.some((role) => roles.includes(role))) {
            return false;
          }
          // 权限码匹配
          if (
            meta.permissions &&
            !meta.permissions.some((p) => permissions.includes(p))
          ) {
            return false;
          }
        }
        if (route.children) {
          route.children = filter(route.children);
        }
        return true;
      });
    };
    return filter(asyncRoutes);
  };

  const generateRoutes = async (roles: string[], permissions: string[]) => {
    const accessedRoutes = filterRoutes(roles, permissions);
    routes.value = accessedRoutes;
    return accessedRoutes;
  };

  return { routes, generateRoutes };
});
