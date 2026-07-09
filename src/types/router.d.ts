import "vue-router";
import type { Component } from 'vue'

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
    permissions?: string[];
    icon?: string | Component
  }
}
