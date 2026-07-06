import { http } from "@/utils/request";
import type { LoginParams, LoginData, UserInfo } from "@/types/auth";

export const authApi = {
  login(data: LoginParams): Promise<LoginData> {
    return http.post<LoginData>("/auth/login", data);
  },

  getUserInfo(): Promise<UserInfo> {
    return http.get<UserInfo>("/auth/user/info");
  },

  logout() {
    return http.post("/auth/logout");
  },
};
