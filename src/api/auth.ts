import { http } from "@/utils/request";

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export interface UserInfo {
  username: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

export const authApi = {
  login(data: LoginParams) {
    return http.post<LoginResult>("/auth/login", data);
  },

  getUserInfo() {
    return http.get<UserInfo>("/auth/userinfo");
  },

  logout() {
    return http.post("/auth/logout");
  },
};
