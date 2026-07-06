// src/api/mock/index.ts
import {
  registerMock,
  mockResponse,
  mockError,
  mockPaginatedResponse,
} from "@/utils/request";

// 类型定义
interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

// ──────────────────────────────────────────────
// ✅ 模拟数据库
// ──────────────────────────────────────────────

const mockDB = {
  users: [
    {
      id: 1,
      username: "admin",
      nickname: "超级管理员",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      roles: ["admin"],
      permissions: ["*"],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      username: "zhangsan",
      nickname: "张三",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
      roles: ["user"],
      permissions: ["user:read", "user:write"],
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      id: 3,
      username: "lisi",
      nickname: "李四",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi",
      roles: ["manager"],
      permissions: ["user:read", "user:write", "product:read"],
      createdAt: "2024-01-03T00:00:00Z",
    },
  ] as User[],
};

// ──────────────────────────────────────────────
// ✅ 注册所有 Mock
// ──────────────────────────────────────────────

// ─── Auth 相关 ───

registerMock("POST", "/auth/login", ({ body }: { body?: any }) => {
  const { username, password } = body || {};
  const user = mockDB.users.find((u) => u.username === username);

  if (!user || password !== "123456") {
    return mockError("用户名或密码错误", 401);
  }

  return mockResponse({
    token: `mock_token_${Date.now()}_${user.id}`,
    refreshToken: `mock_refresh_${Date.now()}_${user.id}`,
    expiresIn: 7200,
    userInfo: { ...user },
  });
});

registerMock("GET", "/auth/user/info", ({ headers }: { headers?: Record<string, string> }) => {
  const auth = headers?.Authorization || "";
  const token = auth.replace("Bearer ", "");

  if (!token) {
    return mockError("未登录", 401);
  }

  const match = token.match(/mock_token_\d+_(\d+)/);
  if (!match) {
    return mockError("无效的 Token", 401);
  }

  const userId = parseInt(match[1]);
  const user = mockDB.users.find((u) => u.id === userId);

  if (!user) {
    return mockError("用户不存在", 404);
  }

  return mockResponse({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    roles: user.roles,
    permissions: user.permissions,
  });
});

registerMock("POST", "/auth/refresh", ({ body }: { body?: any }) => {
  const { refreshToken } = body || {};
  if (!refreshToken) {
    return mockError("Refresh token required", 400);
  }
  return mockResponse({
    token: `mock_token_${Date.now()}_refreshed`,
  });
});

registerMock("POST", "/auth/logout", () => {
  return mockResponse(null);
});

// ─── User 相关 ───

registerMock("GET", "/user/list", ({ query }: { query?: URLSearchParams }) => {
  const page = parseInt(query?.get("page") || "1");
  const pageSize = parseInt(query?.get("pageSize") || "10");
  const keyword = query?.get("keyword") || "";

  let list = mockDB.users;
  if (keyword) {
    list = list.filter(
      (u) => u.username.includes(keyword) || u.nickname.includes(keyword)
    );
  }

  return mockResponse(mockPaginatedResponse(list, page, pageSize));
});

registerMock("GET", "/user/:id", ({ url }: { url: string }) => {
  const id = parseInt(url.split("/").pop() || "0");
  const user = mockDB.users.find((u) => u.id === id);

  if (!user) {
    return mockError("用户不存在", 404);
  }

  return mockResponse(user);
});

registerMock("POST", "/user", ({ body }: { body?: any }) => {
  const newUser: User = {
    id: mockDB.users.length + 1,
    ...body,
    avatar:
      body?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${mockDB.users.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  mockDB.users.push(newUser);
  return mockResponse(newUser, 0, "创建成功");
});

registerMock("PUT", "/user/:id", ({ body, url }: { body?: any; url: string }) => {
  const id = parseInt(url.split("/").pop() || "0");
  const index = mockDB.users.findIndex((u) => u.id === id);

  if (index === -1) {
    return mockError("用户不存在", 404);
  }

  mockDB.users[index] = { ...mockDB.users[index], ...body };
  return mockResponse(mockDB.users[index], 0, "更新成功");
});

registerMock("DELETE", "/user/:id", ({ url }: { url: string }) => {
  const id = parseInt(url.split("/").pop() || "0");
  const index = mockDB.users.findIndex((u) => u.id === id);

  if (index === -1) {
    return mockError("用户不存在", 404);
  }

  mockDB.users.splice(index, 1);
  return mockResponse(null, 0, "删除成功");
});

registerMock("DELETE", "/user/batch", ({ body }: { body?: any }) => {
  const { ids } = body || {};
  if (!ids || !Array.isArray(ids)) {
    return mockError("请提供要删除的用户ID列表", 400);
  }

  const deletedCount = ids.length;
  mockDB.users = mockDB.users.filter((u) => !ids.includes(u.id));
  return mockResponse({ deletedCount }, 0, `成功删除 ${deletedCount} 个用户`);
});

console.log("[Mock] All handlers registered ✅");
