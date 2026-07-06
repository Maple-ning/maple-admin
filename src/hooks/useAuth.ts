import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { usePermissionStore } from "@/stores/permission";

export function useAuth() {
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  const loading = ref(false);
  const error = ref("");

  async function login(username: string, password: string) {
    loading.value = true;
    error.value = "";
    try {
      const result = await userStore.login({ username, password });

      if (!result.success) {
        throw new Error(result.message || "登录失败，请重试");
      }

      await loadUserAndRoutes();
      const redirect = (route.query.redirect as string) ?? "/";
      await router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登录失败，请重试";
      error.value = msg;
    } finally {
      loading.value = false;
    }
  }

  async function loadUserAndRoutes() {
    await userStore.getUserInfo();
    const accessRoutes = await permissionStore.generateRoutes(
      userStore.roles,
      userStore.permissions,
    );
    accessRoutes.forEach((r) => router.addRoute(r));
  }

  async function logout() {
    await userStore.logout();
  }

  return {
    loading,
    error,
    login,
    logout,
    isLoggedIn: userStore.isLoggedIn,
  };
}
