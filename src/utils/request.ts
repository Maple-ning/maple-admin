// src/api/request.ts
import { useUserStore } from "@/stores/user";
import { message } from "ant-design-vue";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

interface ApiResult<T = unknown> {
  code?: number;
  data?: T;
  message?: string;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** 是否跳过 Mock（某些请求需要真实调用） */
  skipMock?: boolean;
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

// ──────────────────────────────────────────────
// ✅ Mock 类型定义和接口（不包含具体实现）
// ──────────────────────────────────────────────

export type MockHandler = (params: {
  url: string;
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: URLSearchParams;
}) => unknown;

// Mock 注册表（在模块内部）
const mockRegistry = new Map<string, MockHandler>();

// 注册 Mock（内部使用）
export function registerMock(
  method: string,
  url: string,
  handler: MockHandler
) {
  const key = `${method.toUpperCase()}:${url}`;
  mockRegistry.set(key, handler);
  if (import.meta.env.DEV) {
    console.log(`[Mock] Registered: ${key}`);
  }
}

// 匹配并执行 Mock
function matchMock(
  url: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>
): { matched: boolean; data?: unknown } {
  const fullUrl = url.startsWith("/") ? url : `/${url}`;
  const [pathname, queryString] = fullUrl.split("?");
  const query = new URLSearchParams(queryString || "");

  // 1. 精确匹配
  const exactKey = `${method.toUpperCase()}:${pathname}`;
  const exactHandler = mockRegistry.get(exactKey);
  if (exactHandler) {
    return {
      matched: true,
      data: exactHandler({ url: pathname, method, body, headers, query }),
    };
  }

  // 2. 通配符匹配（支持路径参数）
  for (const [key, handler] of mockRegistry) {
    const separatorIndex = key.indexOf(":");
    const registeredMethod = key.slice(0, separatorIndex);
    const pattern = key.slice(separatorIndex + 1);

    if (registeredMethod !== method.toUpperCase() || !pattern) continue;

    // 将路径模式转为正则，支持 :id 这样的参数
    const regexPattern = pattern
      .replace(/:[^/]+/g, "([^/]+)")
      .replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);

    if (regex.test(pathname)) {
      return {
        matched: true,
        data: handler({ url: pathname, method, body, headers, query }),
      };
    }
  }

  return { matched: false };
}

// ──────────────────────────────────────────────
// ✅ Mock 响应工具函数
// ──────────────────────────────────────────────

export function mockResponse<T>(data: T, code = 0, messageStr = "success") {
  return {
    code,
    data,
    message: messageStr,
    timestamp: Date.now(),
  };
}

export function mockError(
  messageStr = "请求失败",
  code = 500
): {
  code: number;
  data: null;
  message: string;
  timestamp: number;
} {
  return {
    code,
    data: null,
    message: messageStr,
    timestamp: Date.now(),
  };
}

export function mockPaginatedResponse<T>(
  list: T[],
  page: number = 1,
  pageSize: number = 10
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    list: list.slice(start, end),
    total: list.length,
    page,
    pageSize,
    totalPages: Math.ceil(list.length / pageSize),
  };
}

// ──────────────────────────────────────────────
// ✅ 核心请求函数
// ──────────────────────────────────────────────

async function request<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: rawHeaders, skipMock = false, ...rest } = options;

  const userStore = useUserStore();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rawHeaders as Record<string, string>),
  };

  if (userStore.token) {
    headers["Authorization"] = `Bearer ${userStore.token}`;
  }

  // 1. 处理 Mock（非跳过模式 + USE_MOCK 开启）
  if (USE_MOCK && !skipMock) {
    const mockResult = matchMock(url, rest.method || "GET", body, headers);

    if (mockResult.matched) {
      // 模拟网络延迟
      const delay = Math.random() * 300 + 200;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const mockData = mockResult.data as ApiResult | undefined;

      // 如果 Mock 返回的是错误响应，抛出错误
      if (mockData?.code !== undefined && mockData?.code !== 0) {
        const msg = mockData.message ?? "Mock 请求失败";
        if (mockData.code === 401 && url !== "/auth/login") {
          userStore.logout();
          window.location.href = "/login";
        }
        message.error(msg);
        throw new HttpError(mockData.code || 500, msg);
      }

      if (mockData?.code === 0 && "data" in mockData) {
        return mockData.data as T;
      }

      if (mockData?.code !== undefined) {
        return mockData as T;
      }

      if (mockData === undefined) {
        return undefined as T;
      }

      return mockData as T;
    }

    // 开发环境下，Mock 未匹配时给出警告
    if (import.meta.env.DEV) {
      console.warn(
        `[Mock] No handler found for ${rest.method || "GET"} ${url}，将发起真实请求`
      );
    }
  }

  // 2. 真实请求
  const res = await fetch(`${BASE_URL}${url}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 3. 401 处理
  if (res.status === 401) {
    if (url !== "/auth/login") {
      userStore.logout();
      window.location.href = "/login";
    }
    throw new HttpError(401, url === "/auth/login" ? "用户名或密码错误" : "登录已过期，请重新登录");
  }

  // 4. 解析响应
  const data = await res.json();

  // 5. HTTP 状态码错误
  if (!res.ok) {
    const msg = data?.message ?? `请求失败 (${res.status})`;
    message.error(msg);
    throw new HttpError(res.status, msg);
  }

  // 6. 业务状态码校验: { code: 0, data, message }
  if (data.code !== undefined && data.code !== 0) {
    // 401 业务码也触发登出
    if (data.code === 401 && url !== "/auth/login") {
      userStore.logout();
      window.location.href = "/login";
    }
    message.error(data.message ?? "操作失败");
    throw new Error(data.message ?? "操作失败");
  }

  return data.data ?? data;
}

// ──────────────────────────────────────────────
// ✅ 导出 HTTP 方法
// ──────────────────────────────────────────────

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
  patch<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "PATCH", body });
  },
  delete<T = unknown>(url: string, options?: RequestOptions) {
    return request<T>(url, { ...options, method: "DELETE" });
  },
};
