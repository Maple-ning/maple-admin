import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/api/auth";
import type { UserInfo } from "@/api/auth";
import router from "@/router";
import { usePermissionStore } from "./permission";

export const useUserStore = defineStore("user", () => {
  // ── state ──
  const token = ref<string>("");
  const username = ref<string>("");
  const avatar = ref<string>("");
  const roles = ref<string[]>([]);
  const permissions = ref<string[]>([]);

  // ── getters ──
  const isLoggedIn = computed(() => !!token.value);

  // ── actions ──
  async function login(usernameParam: string, password: string) {
    const { token: accessToken } = await authApi.login({
      username: usernameParam,
      password,
    });
    token.value = accessToken;
  }

  async function getUserInfo() {
    const info: UserInfo = await authApi.getUserInfo();
    username.value = info.username;
    avatar.value = info.avatar ?? "";
    roles.value = info.roles;
    permissions.value = info.permissions;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      resetState();
      const permissionStore = usePermissionStore();
      permissionStore.resetRoutes();
      router.push("/login");
    }
  }

  function resetState() {
    token.value = "";
    username.value = "";
    avatar.value = "";
    roles.value = [];
    permissions.value = [];
  }

  const hasRole = (role: string | string[]) => {
    const roleList = Array.isArray(role) ? role : [role];
    return roleList.some((r) => roles.value.includes(r));
  };

  const hasPermission = (permission: string | string[]) => {
    const permList = Array.isArray(permission) ? permission : [permission];
    if (roles.value.includes("admin")) return true;
    return permList.some((p) => permissions.value.includes(p));
  };

  return {
    token,
    username,
    avatar,
    roles,
    permissions,
    isLoggedIn,
    login,
    getUserInfo,
    logout,
    resetState,
    hasRole,
    hasPermission,
  };
});
