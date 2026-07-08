import { mockUsers, replaceMockUsers, type MockUser } from "../data/user";
import {
  mockError,
  mockPaginatedResponse,
  mockResponse,
  registerMock,
} from "@/utils/request";

type UserPayload = Partial<Omit<MockUser, "id" | "createdAt">>;

function getUserIdFromUrl(url: string) {
  return Number(url.split("/").pop() || 0);
}

function withoutPassword(user: MockUser) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    roles: user.roles,
    permissions: user.permissions,
    createdAt: user.createdAt,
  };
}

export function registerUserMocks() {
  registerMock("GET", "/user/list", ({ query }) => {
    const page = Number(query?.get("page") || 1);
    const pageSize = Number(query?.get("pageSize") || 10);
    const keyword = query?.get("keyword")?.trim() || "";

    let list = mockUsers;
    if (keyword) {
      list = list.filter(
        (user) =>
          user.username.includes(keyword) || user.nickname.includes(keyword),
      );
    }

    return mockResponse(
      mockPaginatedResponse(list.map(withoutPassword), page, pageSize),
    );
  });

  registerMock("GET", "/user/:id", ({ url }) => {
    const id = getUserIdFromUrl(url);
    const user = mockUsers.find((item) => item.id === id);

    if (!user) {
      return mockError("用户不存在", 404);
    }

    return mockResponse(withoutPassword(user));
  });

  registerMock("POST", "/user", ({ body }) => {
    const payload = (body || {}) as UserPayload;
    const id = Math.max(...mockUsers.map((user) => user.id), 0) + 1;
    const username = payload.username?.trim();

    if (!username) {
      return mockError("用户名不能为空", 400);
    }

    if (mockUsers.some((user) => user.username === username)) {
      return mockError("用户名已存在", 400);
    }

    const newUser: MockUser = {
      id,
      username,
      password: payload.password || "123456",
      nickname: payload.nickname || username,
      avatar:
        payload.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${id}`,
      roles: payload.roles || ["user"],
      permissions: payload.permissions || ["user:read"],
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    return mockResponse(withoutPassword(newUser), 0, "创建成功");
  });

  registerMock("PUT", "/user/:id", ({ body, url }) => {
    const id = getUserIdFromUrl(url);
    const index = mockUsers.findIndex((user) => user.id === id);

    if (index === -1) {
      return mockError("用户不存在", 404);
    }

    const payload = (body || {}) as UserPayload;
    mockUsers[index] = {
      ...mockUsers[index],
      ...payload,
      id,
    };

    return mockResponse(withoutPassword(mockUsers[index]), 0, "更新成功");
  });

  registerMock("DELETE", "/user/:id", ({ url }) => {
    const id = getUserIdFromUrl(url);
    const index = mockUsers.findIndex((user) => user.id === id);

    if (index === -1) {
      return mockError("用户不存在", 404);
    }

    mockUsers.splice(index, 1);
    return mockResponse(null, 0, "删除成功");
  });

  registerMock("DELETE", "/user/batch", ({ body }) => {
    const { ids } = (body || {}) as { ids?: number[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return mockError("请提供要删除的用户ID列表", 400);
    }

    const beforeLength = mockUsers.length;
    replaceMockUsers(mockUsers.filter((user) => !ids.includes(user.id)));
    const deletedCount = beforeLength - mockUsers.length;

    return mockResponse({ deletedCount }, 0, `成功删除 ${deletedCount} 个用户`);
  });
}
