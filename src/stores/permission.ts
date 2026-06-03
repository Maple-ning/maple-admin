import { defineStore } from "pinia";
import { ref } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { asyncRoutes } from "@/router/asyncRoutes";

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([]);

  // 根据角色和权限过滤路由
  function filterRoutes(roles: string[], permissions: string[]) {
    const filter = (list: RouteRecordRaw[]): RouteRecordRaw[] => {
      return list
        .filter((route) => {
          const meta = route.meta;
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
          return true;
        })
        .map((route) => {
          if (route.children) {
            route.children = filter(route.children);
          }
          return route;
        });
    };
    return filter(asyncRoutes);
  }

  async function generateRoutes(roles: string[], permissions: string[]) {
    const accessedRoutes = filterRoutes(roles, permissions);
    routes.value = accessedRoutes;
    return accessedRoutes;
  }

  function resetRoutes() {
    routes.value = [];
  }

  return { routes, generateRoutes, resetRoutes };
});
