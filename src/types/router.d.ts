// src/types/router.d.ts
import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    requiresAuth: boolean;
    roles?: string[];
    permissions?: string[];
    icon?: string;
  }
}
