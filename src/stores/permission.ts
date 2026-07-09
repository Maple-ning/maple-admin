import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import router, { transformMenuToRoutes } from '@/router'
import { getMenuTree } from "@/api/system"
import type { Menu } from "@/types/menu"

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const menuTree = ref<Menu[]>([])

  async function generateRoutes() {
    try {
      const data = await getMenuTree()
      // if (data.code !== 0) {
      //   throw new Error(data.message || '获取菜单失败')
      // }
      const menus = data as unknown as Menu[]
      menuTree.value = menus
      const routesArray = transformMenuToRoutes(menus)
      console.log("routesArray",routesArray)
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
    routes.value = []
    menuTree.value = []
  }

  return { routes, menuTree, generateRoutes, resetRoutes }
})
