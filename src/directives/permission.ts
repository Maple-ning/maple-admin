import type { Directive, DirectiveBinding } from "vue";
import { useUserStore } from "@/stores/user";

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding;
    const userStore = useUserStore();

    if (value && Array.isArray(value)) {
      if (userStore.roles.includes("admin") || userStore.permissions.includes("*")) return;

      const hasPermission = value.some((v) =>
        userStore.permissions.includes(v),
      );
      if (!hasPermission) {
        el.parentNode?.removeChild(el);
      }
    } else {
      throw new Error(
        `需要指定权限码，如 v-permission="['system:user:create']"`,
      );
    }
  },
};
