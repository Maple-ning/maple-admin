import { get, post } from '@/utils/request'
import type { LoginData, LoginParams, UserInfo } from '@/types/system'

/**
 * @description 登录接口
 */
export const login = (data: LoginParams): Promise<LoginData> => {
  return post<LoginData>('/auth/login', data)
}

/**
 * @description 获取当前用户信息接口
 */
export const getUserInfo = (): Promise<UserInfo> => {
  return get<UserInfo>('/auth/user/info')
}

/**
 * @description 退出登录接口
 */
export const logout = (): Promise<unknown> => {
  return post('/auth/logout')
}
