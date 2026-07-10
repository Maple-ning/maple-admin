import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { usePermissionStore } from "@/stores/permission";
import { ensureNotFoundRoute } from "@/router";

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
      const result = await userStore.loginAction({ username, password });

      if (!result.success) {
        throw new Error(result.message || "登录失败，请重试");
      }

      await loadUserAndRoutes();
      const redirect = (route.query.redirect as string) ?? "/";
      if (!permissionStore.defaultPath) {
        await router.replace("/403");
        return;
      }
      await router.push(redirect === "/" ? permissionStore.defaultPath : redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登录失败，请重试";
      error.value = msg;
    } finally {
      loading.value = false;
    }
  }

  async function loadUserAndRoutes() {
    await userStore.getUserInfo();
    const accessRoutes = await permissionStore.generateRoutes()
    accessRoutes.forEach((r) => router.addRoute(r));
    ensureNotFoundRoute();
  }

  async function logout() {
    await userStore.logout();
    await router.push('/login')
  }

  return {
    loading,
    error,
    login,
    logout,
    isLoggedIn: userStore.isLoggedIn,
  };
}
