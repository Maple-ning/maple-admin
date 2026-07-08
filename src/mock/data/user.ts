export interface MockUser {
  id: number;
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export let mockUsers: MockUser[] = [
  {
    id: 1,
    username: "admin",
    password: "123456",
    nickname: "超级管理员",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    roles: ["admin"],
    permissions: ["*"],
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "zhangsan",
    password: "123456",
    nickname: "张三",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
    roles: ["user"],
    permissions: ["user:read", "user:write"],
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    username: "lisi",
    password: "123456",
    nickname: "李四",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi",
    roles: ["manager"],
    permissions: ["user:read", "user:write", "product:read"],
    createdAt: "2024-01-03T00:00:00Z",
  },
];

export function replaceMockUsers(users: MockUser[]) {
  mockUsers = users;
}
