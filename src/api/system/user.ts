import { del, get, post, put } from '@/utils/request'

export interface SystemUser {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  deptId: number
  roleIds: number[]
  status: boolean
  createTime: string
  remark: string
}

export type UserPayload = Omit<SystemUser, 'id'>

/**
 * @description 获取用户列表接口
 */
export const getUserList = (params?: object): Promise<SystemUser[]> => {
  return get<SystemUser[]>('/users', params)
}

/**
 * @description 新增用户接口
 */
export const createUser = (data: Omit<SystemUser, 'id'>): Promise<SystemUser> => {
  return post<SystemUser>('/users', data)
}

/**
 * @description 编辑用户接口
 */
export const updateUser = (id: number, data: Partial<SystemUser>): Promise<SystemUser> => {
  return put<SystemUser>(`/users/${id}`, data)
}

/**
 * @description 删除用户接口
 */
export const deleteUser = (id: number): Promise<SystemUser> => {
  return del<SystemUser>(`/users/${id}`)
}

/**
 * @description 分配用户角色接口
 */
export const assignUserRoles = (id: number, roleIds: number[]): Promise<SystemUser> => {
  return put<SystemUser>(`/users/${id}/roles`, { roleIds })
}
