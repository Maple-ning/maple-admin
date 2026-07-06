export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface LoginData {
  token: string
  refreshToken?: string
  expiresIn?: number
  userInfo?: UserInfo
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export interface LoginResult {
  success: boolean
  data?: LoginData
  message?: string
  code?: string
}
