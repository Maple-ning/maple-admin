/**
 * 用户 & 认证模块 Mock
 *
 * 一个文件搞定：数据定义 + 接口注册。
 * 新增同一业务领域的接口直接在这个文件里追加 registerMock() 即可。
 *
 * URL 路径请与 src/api/ 中的真实接口路径保持一致。
 */
import { registerMock, mockResponse, mockError, mockPaginatedResponse } from '@/utils/request'

// ============================================================
//  数据定义
// ============================================================

export interface MockUser {
  id: number
  username: string
  password: string
  nickname: string
  avatar: string
  roles: string[]
  permissions: string[]
  createdAt: string
}

// 用户列表（可增删改，注意是 let 不是 const）
export let mockUsers: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '超级管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    roles: ['admin'],
    permissions: ['*'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'viewer',
    password: '123456',
    nickname: '只读用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
    roles: ['viewer'],
    permissions: ['dashboard:overview'],
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    username: 'operator',
    password: '123456',
    nickname: '运营人员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=operator',
    roles: ['operator'],
    permissions: ['dashboard:overview', 'dashboard:analytics', 'system:user:list', 'order:list', 'product:list', 'account:profile', 'account:settings'],
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 4,
    username: 'manager',
    password: '123456',
    nickname: '系统经理',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    roles: ['manager'],
    permissions: [
      'dashboard:overview',
      'dashboard:analytics',
      'system:user:list',
      'system:user:detail',
      'system:role:list',
      'system:menu:list',
      'system:permission:test',
      'order:list',
      'order:detail',
      'product:list',
      'log:operation',
      'log:login',
      'account:profile',
      'account:settings',
    ],
    createdAt: '2024-01-04T00:00:00Z',
  },
]

// ============================================================
//  工具函数（仅本文件使用）
// ============================================================

function toUserInfo(user: MockUser) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    roles: user.roles,
    permissions: user.permissions,
    createdAt: user.createdAt,
  }
}

function getTokenUserId(token: string): number | null {
  const match = token.match(/^mock_token_\d+_(\d+)$/)
  return match ? Number(match[1]) : null
}

function getUserIdFromUrl(url: string): number {
  return Number(url.split('/').pop() || 0)
}

// ============================================================
//  认证相关接口
// ============================================================

registerMock('POST', '/auth/login', ({ body }) => {
  const { username, password } = (body || {}) as { username?: string; password?: string }
  const user = mockUsers.find((u) => u.username === username)

  if (!user || user.password !== password) {
    return mockError('用户名或密码错误', 401)
  }

  return mockResponse({
    token: `mock_token_${Date.now()}_${user.id}`,
    refreshToken: `mock_refresh_${Date.now()}_${user.id}`,
    expiresIn: 7200,
    userInfo: toUserInfo(user),
  })
})

registerMock('GET', '/auth/user/info', ({ headers }) => {
  const auth = String(headers?.Authorization || '')
  const token = auth.replace('Bearer ', '')

  if (!token) return mockError('未登录', 401)

  const userId = getTokenUserId(token)
  if (!userId) return mockError('无效的 Token', 401)

  const user = mockUsers.find((u) => u.id === userId)
  if (!user) return mockError('用户不存在', 404)

  return mockResponse(toUserInfo(user))
})

registerMock('POST', '/auth/refresh', ({ body }) => {
  const { refreshToken } = (body || {}) as { refreshToken?: string }
  if (!refreshToken) return mockError('Refresh token required', 400)
  return mockResponse({ token: `mock_token_${Date.now()}_1` })
})

registerMock('POST', '/auth/logout', () => {
  return mockResponse(null)
})

// ============================================================
//  用户 CRUD 接口
// ============================================================

registerMock('GET', '/user/list', ({ query }) => {
  const page = Number(query?.get('page') || 1)
  const pageSize = Number(query?.get('pageSize') || 10)
  const keyword = query?.get('keyword')?.trim() || ''

  let list = mockUsers
  if (keyword) {
    list = list.filter(
      (u) => u.username.includes(keyword) || u.nickname.includes(keyword),
    )
  }

  return mockResponse(mockPaginatedResponse(list.map(toUserInfo), page, pageSize))
})

registerMock('GET', '/user/:id', ({ url }) => {
  const id = getUserIdFromUrl(url)
  const user = mockUsers.find((u) => u.id === id)
  if (!user) return mockError('用户不存在', 404)
  return mockResponse(toUserInfo(user))
})

registerMock('POST', '/user', ({ body }) => {
  const payload = (body || {}) as Partial<MockUser>
  const username = payload.username?.trim()
  if (!username) return mockError('用户名不能为空', 400)
  if (mockUsers.some((u) => u.username === username)) return mockError('用户名已存在', 400)

  const newUser: MockUser = {
    id: Math.max(...mockUsers.map((u) => u.id), 0) + 1,
    username,
    password: payload.password || '123456',
    nickname: payload.nickname || username,
    avatar: payload.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${Date.now()}`,
    roles: payload.roles || ['user'],
    permissions: payload.permissions || ['user:read'],
    createdAt: new Date().toISOString(),
  }

  mockUsers.push(newUser)
  return mockResponse(toUserInfo(newUser), 0, '创建成功')
})

registerMock('PUT', '/user/:id', ({ body, url }) => {
  const id = getUserIdFromUrl(url)
  const index = mockUsers.findIndex((u) => u.id === id)
  if (index === -1) return mockError('用户不存在', 404)

  mockUsers[index] = { ...mockUsers[index], ...(body || {}), id }
  return mockResponse(toUserInfo(mockUsers[index]), 0, '更新成功')
})

registerMock('DELETE', '/user/:id', ({ url }) => {
  const id = getUserIdFromUrl(url)
  const index = mockUsers.findIndex((u) => u.id === id)
  if (index === -1) return mockError('用户不存在', 404)

  mockUsers.splice(index, 1)
  return mockResponse(null, 0, '删除成功')
})

registerMock('DELETE', '/user/batch', ({ body }) => {
  const { ids } = (body || {}) as { ids?: number[] }
  if (!Array.isArray(ids) || ids.length === 0) return mockError('请提供要删除的用户ID列表', 400)

  const before = mockUsers.length
  mockUsers = mockUsers.filter((u) => !ids.includes(u.id))
  return mockResponse({ deletedCount: before - mockUsers.length }, 0, `成功删除 ${before - mockUsers.length} 个用户`)
})
