import type { Plugin } from "vite";
import { mockUsers } from "../src/mock/data/user";

function sendJson(res: any, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json;charset=utf-8");
  res.end(JSON.stringify(data));
}

function mockResponse<T>(data: T, code = 0, message = "success") {
  return {
    code,
    data,
    message,
    timestamp: Date.now(),
  };
}

function mockError(message: string, code = 500) {
  return mockResponse(null, code, message);
}

function toUserInfo(user: (typeof mockUsers)[number]) {
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

async function readBody(req: any) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf-8");
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

export function authMockServerPlugin(enabled: boolean): Plugin {
  return {
    name: "maple-auth-mock-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!enabled) {
          next();
          return;
        }

        if (req.url?.split("?")[0] !== "/api/auth/login") {
          next();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, mockError("登录接口请使用 POST 请求", 405));
          return;
        }

        const body = await readBody(req);
        const user = mockUsers.find((item) => item.username === body.username);

        if (!user || user.password !== body.password) {
          sendJson(res, mockError("用户名或密码错误", 401));
          return;
        }

        sendJson(
          res,
          mockResponse({
            token: `mock_token_${Date.now()}_${user.id}`,
            refreshToken: `mock_refresh_${Date.now()}_${user.id}`,
            expiresIn: 7200,
            userInfo: toUserInfo(user),
          }),
        );
      });
    },
  };
}
