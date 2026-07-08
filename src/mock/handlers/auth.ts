import { mockUsers, type MockUser } from "../data/user";
import { mockError, mockResponse, registerMock } from "@/utils/request";

interface LoginBody {
  username?: string;
  password?: string;
}

interface RefreshTokenBody {
  refreshToken?: string;
}

function getTokenUserId(token: string) {
  const match = token.match(/^mock_token_\d+_(\d+)$/);
  return match ? Number(match[1]) : null;
}

function toUserInfo(user: MockUser) {
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

export function registerAuthMocks() {
  registerMock("POST", "/auth/login", ({ body }) => {
    const { username, password } = (body || {}) as LoginBody;
    const user = mockUsers.find((item) => item.username === username);

    if (!user || user.password !== password) {
      return mockError("用户名或密码错误", 401);
    }

    return mockResponse({
      token: `mock_token_${Date.now()}_${user.id}`,
      refreshToken: `mock_refresh_${Date.now()}_${user.id}`,
      expiresIn: 7200,
      userInfo: toUserInfo(user),
    });
  });

  registerMock("GET", "/auth/user/info", ({ headers }) => {
    const auth = String(headers?.Authorization || "");
    const token = auth.replace("Bearer ", "");

    if (!token) {
      return mockError("未登录", 401);
    }

    const userId = getTokenUserId(token);
    if (!userId) {
      return mockError("无效的 Token", 401);
    }

    const user = mockUsers.find((item) => item.id === userId);
    if (!user) {
      return mockError("用户不存在", 404);
    }

    return mockResponse(toUserInfo(user));
  });

  registerMock("POST", "/auth/refresh", ({ body }) => {
    const { refreshToken } = (body || {}) as RefreshTokenBody;

    if (!refreshToken) {
      return mockError("Refresh token required", 400);
    }

    return mockResponse({
      token: `mock_token_${Date.now()}_1`,
    });
  });

  registerMock("POST", "/auth/logout", () => {
    return mockResponse(null);
  });
}
