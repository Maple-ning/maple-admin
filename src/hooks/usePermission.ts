import { useUserStore } from "@/stores/user";

export function usePermission() {
  const userStore = useUserStore();

  function hasRole(role: string | string[]): boolean {
    return userStore.hasRole(role);
  }

  function hasPermission(code: string | string[]): boolean {
    return userStore.hasPermission(code);
  }

  function hasAnyPermission(codes: string[]): boolean {
    return codes.some((c) => userStore.hasPermission(c));
  }

  function hasAllPermissions(codes: string[]): boolean {
    return codes.every((c) => userStore.hasPermission(c));
  }

  return {
    roles: userStore.roles,
    permissions: userStore.permissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
