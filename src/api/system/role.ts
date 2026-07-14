import { del, get, post, put } from '@/utils/request'

export type DataScope = 'ALL' | 'DEPT_AND_CHILD' | 'DEPT' | 'SELF' | 'CUSTOM'
export interface SystemRole {
  id: number
  roleName: string
  roleKey: string
  dataScope: DataScope
  status: boolean
  orderNum: number
  menuIds: number[]
  userCount: number
  createTime: string
  remark: string
}

/**
 * @description 获取角色列表接口
 */
export const getRoleList = (params?: object): Promise<SystemRole[]> => {
  return get<SystemRole[]>('/roles', params)
}

/**
 * @description 新增角色接口
 */
export const createRole = (data: Omit<SystemRole, 'id'>): Promise<SystemRole> => {
  return post<SystemRole>('/roles', data)
}

/**
 * @description 编辑角色接口
 */
export const updateRole = (id: number, data: Partial<SystemRole>): Promise<SystemRole> => {
  return put<SystemRole>(`/roles/${id}`, data)
}

/**
 * @description 删除角色接口
 */
export const deleteRole = (id: number): Promise<SystemRole> => {
  return del<SystemRole>(`/roles/${id}`)
}

/**
 * @description 分配角色菜单权限接口
 */
export const assignRolePermissions = (id: number, menuIds: number[]): Promise<SystemRole> => {
  return put<SystemRole>(`/roles/${id}/permissions`, { menuIds })
}
