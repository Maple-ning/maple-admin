import axios, {
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse } from "@/types/api";
import { useUserStore } from "@/stores/user";
import { message } from "ant-design-vue";

const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true";

export type MockHandler = (params: {
  url: string;
  method: string;
  body?: unknown;
  headers?: Record<string, unknown>;
  query?: URLSearchParams;
}) => unknown;

const mockRegistry = new Map<string, MockHandler>();
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

export function registerMock(
  method: string,
  url: string,
  handler: MockHandler,
) {
  mockRegistry.set(`${method.toUpperCase()}:${url}`, handler);
}

export function mockResponse<T>(data: T, code = 0, messageStr = "success") {
  return {
    code,
    data,
    message: messageStr,
    timestamp: Date.now(),
  };
}

export function mockError(messageStr = "请求失败", code = 500) {
  return {
    code,
    data: null,
    message: messageStr,
    timestamp: Date.now(),
  };
}

export function mockPaginatedResponse<T>(
  list: T[],
  page = 1,
  pageSize = 10,
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

function getRequestPath(url = "") {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "";
  const pathname = url.startsWith("http")
    ? `/${url.split("/").slice(3).join("/")}`
    : url;
  const pathWithoutBase =
    baseURL && pathname.startsWith(baseURL)
      ? pathname.slice(baseURL.length)
      : pathname;

  return pathWithoutBase.startsWith("/") ? pathWithoutBase : `/${pathWithoutBase}`;
}

function parseBody(data: unknown) {
  if (typeof data !== "string") return data;

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function findMockHandler(
  url: string,
  method: string,
  body?: unknown,
  headers?: Record<string, unknown>,
) {
  const fullPath = getRequestPath(url);
  const [pathname, queryString] = fullPath.split("?");
  const query = new URLSearchParams(queryString || "");
  const upperMethod = method.toUpperCase();
  const exactHandler = mockRegistry.get(`${upperMethod}:${pathname}`);

  if (exactHandler) {
    return {
      matched: true,
      data: exactHandler({ url: pathname, method: upperMethod, body, headers, query }),
    };
  }

  for (const [key, handler] of mockRegistry) {
    const separatorIndex = key.indexOf(":");
    const registeredMethod = key.slice(0, separatorIndex);
    const pattern = key.slice(separatorIndex + 1);

    if (registeredMethod !== upperMethod || !pattern) continue;

    const regex = new RegExp(
      `^${pattern.replace(/:[^/]+/g, "([^/]+)").replace(/\*/g, ".*")}$`,
    );

    if (regex.test(pathname)) {
      return {
        matched: true,
        data: handler({ url: pathname, method: upperMethod, body, headers, query }),
      };
    }
  }

  return { matched: false, data: undefined };
}

const mockAdapter: AxiosAdapter = async (config) => {
  const method = config.method || "GET";
  const headers = config.headers?.toJSON
    ? config.headers.toJSON()
    : (config.headers as Record<string, unknown> | undefined);
  const mockResult = findMockHandler(
    config.url || "",
    method,
    parseBody(config.data),
    headers,
  );

  if (!mockResult.matched) {
    return defaultAdapter(config);
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    data: mockResult.data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: config as InternalAxiosRequestConfig,
    request: {},
  };
};

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  adapter: USE_MOCK ? mockAdapter : undefined,
});

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
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
      if (status === 401) {
        window.location.href = "/login";
      } else {
        message.error(error.response.data?.message || "网络异常，请稍后重试");
      }
    } else {
      message.error("网络连接失败，请检查网络");
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
