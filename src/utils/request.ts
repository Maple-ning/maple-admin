import axios, {
  type AxiosResponse,
} from "axios";
import type { ApiResponse } from "@/types/api";
import { useUserStore } from "@/stores/user";
import { message } from "ant-design-vue";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const isLoginRequest = config.url === '/auth/login';
    if (userStore.token && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    } else if (isLoginRequest) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, data, message } = response.data;
    if (code === 0) {
      return data;
    }
    return Promise.reject(new Error(message || "请求失败"));
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl === '/auth/login';
      if (status === 401 && !isLoginRequest) {
        const userStore = useUserStore();
        userStore.resetState();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        message.error(error.response.data?.message || '网络异常，请稍后重试');
      }
    } else {
      message.error('网络连接失败，请检查网络');
    }
    return Promise.reject(error);
  },
);

export function get<T = unknown>(url: string, params?: object): Promise<T> {
  return request.get(url, { params }) as Promise<T>;
}

export function post<T = unknown>(url: string, data?: object): Promise<T> {
  return request.post(url, data) as Promise<T>;
}

export function put<T = unknown>(url: string, data?: object): Promise<T> {
  return request.put(url, data) as Promise<T>;
}

export function del<T = unknown>(url: string, params?: object): Promise<T> {
  return request.delete(url, { params }) as Promise<T>;
}

export default {
  get,
  post,
  put,
  delete: del,
};
