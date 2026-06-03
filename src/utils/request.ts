import { useUserStore } from "@/stores/user";
import { message } from "ant-design-vue";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers: rawHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rawHeaders as Record<string, string>),
  };

  const userStore = useUserStore();
  if (userStore.token) {
    headers["Authorization"] = `Bearer ${userStore.token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    userStore.logout();
    window.location.href = "/login";
    throw new HttpError(401, "登录已过期，请重新登录");
  }

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.message ?? `请求失败 (${res.status})`;
    message.error(msg);
    throw new HttpError(res.status, msg);
  }

  // 业务状态码校验: { code: 0, data, message }
  if (data.code !== undefined && data.code !== 0) {
    message.error(data.message ?? "操作失败");
    throw new Error(data.message ?? "操作失败");
  }

  return data.data ?? data;
}

export const http = {
  get<T = unknown>(url: string, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "GET" });
  },
  post<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "POST", body });
  },
  put<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "PUT", body });
  },
  delete<T = unknown>(url: string, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "DELETE" });
  },
};
