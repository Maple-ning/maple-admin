import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: "",
    username: "",
  }),
  actions: {
    async login(username: string, password: string) {},
    logout() {
      this.token = "";
      this.username = "";
    },
  },
});
