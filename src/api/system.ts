import { get, post } from '@/utils/request'
import type { LoginParams, LoginData, UserInfo } from '@/types/system'

/**
 * @description 登录接口
 */
export const login = (data: LoginParams): Promise<LoginData> => {
  return post<LoginData>('/auth/login', data)
}

/**
 * @description 获取用户信息接口
 */
export const getUserInfo = (): Promise<UserInfo> => {
  return get<UserInfo>('/auth/user/info')
}

/**
 * @description 登出接口
 */
export const logout = () => {
  return post('/auth/logout')
}
