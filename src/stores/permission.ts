import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import router, { transformMenuToRoutes } from '@/router'
import { getMenuTree } from '@/api/system/menu'
import { useUserStore } from './user'
import { filterMenusByPermission, getFirstAccessiblePath } from '@/utils/permission'
import type { Menu } from '@/types/menu'

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const menuTree = ref<Menu[]>([])
  const defaultPath = ref('')

  async function generateRoutes() {
    try {
      const data = await getMenuTree()
      // if (data.code !== 0) {
      //   throw new Error(data.message || '获取菜单失败')
      // }
      const userStore = useUserStore()
      const menus = filterMenusByPermission(data as Menu[], {
        roles: userStore.roles,
        permissions: userStore.permissions,
      })
      menuTree.value = menus
      defaultPath.value = getFirstAccessiblePath(menus)
      const routesArray = transformMenuToRoutes(menus)
      routes.value = routesArray
      return routesArray
    } catch (error) {
      console.error('生成动态路由失败:', error)
      throw error
    }
  }

  function resetRoutes() {
    routes.value.forEach((route) => {
      if (route.name) {
        try {
          router.removeRoute(route.name)
        } catch (_) {
          // 忽略
        }
      }
    })
    if (router.hasRoute('NotFound')) {
      router.removeRoute('NotFound')
    }
    routes.value = []
    menuTree.value = []
    defaultPath.value = ''
  }

  return { routes, menuTree, defaultPath, generateRoutes, resetRoutes }
})
