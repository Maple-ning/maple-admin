import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { constantRoutes } from './constantRoutes'
import Layout from '@/layouts/index.vue'
import type { Component } from 'vue'
import type { Menu } from '@/types/menu'

// 导出 Layout 和转换函数供 store 使用
export { Layout }

/**
 * 将后端菜单树转换为 Vue Router 路由配置
 */
export function transformMenuToRoutes(menus: Menu[]): RouteRecordRaw[] {
  const modules = import.meta.glob<{ default: Component }>('@/views/**/*.vue')

  const loadView = (path: string): (() => Promise<Component>) => {
    const key = path.replace('@/', '/src/')
    const loader = modules[key]
    if (!loader) {
      console.warn(`组件 ${path} 未找到，使用 404 页面`)
      return () => import('@/views/Error-page/404.vue') as Promise<Component>
    }
    return () => loader().then((mod) => (mod.default || mod) as Component)
  }

  return menus.map((menu) => {
    const route: RouteRecordRaw = {
      path: menu.path,
      name: `${menu.title.replace(/\s/g, '')}_${menu.id}`,
      redirect: menu.redirect || undefined,
      children: [],
      meta: {
        title: menu.title,
        icon: menu.icon,
        hidden: menu.hidden || false,
        perms: menu.perms || '',
        requiresAuth: true,
      },
      // 默认空组件，下面根据 component 字段覆盖
      component: { render: () => null } as Component,
    }

    if (menu.component === 'Layout') {
      route.component = Layout as Component
    } else if (menu.component) {
      route.component = loadView(menu.component)
    }

    if (menu.children && menu.children.length) {
      route.children = transformMenuToRoutes(menu.children)
    }

    return route
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
})

const whiteList = ['/login', '/404']

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 未登录
  if (!userStore.token) {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
    return
  }

  // 已登录但访问登录页 → 跳转首页
  if (to.path === '/login') {
    next('/')
    return
  }

  // 动态路由已加载 → 直接放行
  if (permissionStore.routes.length > 0) {
    next()
    return
  }

  // 首次加载动态路由
  try {
    await userStore.getUserInfo()
    const accessRoutes = await permissionStore.generateRoutes()
    accessRoutes.forEach((route) => router.addRoute(route))

    // addRoute 后当前导航已解析，需重新触发以匹配新路由
    next({ ...to, replace: true })
  } catch {
    await userStore.logout()
    next(`/login?redirect=${to.path}`)
  }
})

export default router
