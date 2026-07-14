import { del, get, post, put } from '@/utils/request'
import type { Menu } from '@/types/menu'

export type MenuType = 'dir' | 'menu' | 'btn'
export interface SystemMenu {
  id: number
  parentId: number
  name: string
  type: MenuType
  path: string
  component: string
  permission: string
  icon: string
  orderNum: number
  status: boolean
  createTime: string
  children?: SystemMenu[]
}

/**
 * @description 获取当前用户菜单树接口
 */
export const getMenuTree = (): Promise<Menu[]> => {
  return get<Menu[]>('/menu/user-menus')
}

/**
 * @description 获取菜单列表接口
 */
export const getMenuList = (): Promise<SystemMenu[]> => {
  return get<SystemMenu[]>('/menus')
}

/**
 * @description 新增菜单接口
 */
export const createMenu = (data: Omit<SystemMenu, 'id'>): Promise<SystemMenu> => {
  return post<SystemMenu>('/menus', data)
}

/**
 * @description 编辑菜单接口
 */
export const updateMenu = (id: number, data: Partial<SystemMenu>): Promise<SystemMenu> => {
  return put<SystemMenu>(`/menus/${id}`, data)
}

/**
 * @description 删除菜单接口
 */
export const deleteMenu = (id: number): Promise<SystemMenu> => {
  return del<SystemMenu>(`/menus/${id}`)
}
