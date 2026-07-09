/**
 * 菜单模块 Mock
 *
 * 一个文件搞定：数据定义 + 接口注册。
 * 新增同一业务领域的接口直接在这个文件里追加 registerMock() 即可。
 *
 * URL 路径请与 src/api/ 中的真实接口路径保持一致。
 */
import { registerMock, mockResponse } from '@/utils/request'

// ============================================================
//  数据定义
// ============================================================

export interface MockMenu {
  id: number
  parentId: number
  title: string
  path: string
  component: string // 组件路径字符串，如 '@/views/System/User/index.vue'
  icon?: string // 图标名称，如 'SettingOutlined'
  redirect?: string
  hidden?: boolean
  sort?: number
  perms?: string // 权限标识
  children?: MockMenu[]
}

export let mockMenus: MockMenu[] = [
  {
    id: 1,
    parentId: 0,
    title: '仪表盘',
    path: '/dashboard',
    component: 'Layout',
    icon: 'DashboardOutlined',
    redirect: '/dashboard/overview',
    sort: 1,
    children: [
      // ✅ 添加子菜单
      {
        id: 2,
        parentId: 1,
        title: '总览',
        path: '/dashboard/overview',
        component: '@/views/Dashboard/Overview.vue'
      },
      {
        id: 3,
        parentId: 1,
        title: '分析',
        path: '/dashboard/analytics',
        component: '@/views/Dashboard/Analytics.vue'
      }
    ]
  },
  {
    id: 4,
    parentId: 0,
    title: '系统管理',
    path: '/system',
    component: 'Layout',
    icon: 'SettingOutlined',
    redirect: '/system/user',
    sort: 2,
    children: [
      {
        id: 5,
        parentId: 4,
        title: '用户管理',
        path: '/system/user',
        component: '@/views/System/User/index.vue',
        icon: 'UserOutlined',
        children: [
          {
            id: 6,
            parentId: 5,
            title: '用户列表',
            path: '/system/user/list',
            component: '@/views/System/User/List.vue',
            perms: 'system:user:list'
          },
          {
            id: 7,
            parentId: 5,
            title: '用户详情',
            path: '/system/user/detail',
            component: '@/views/System/User/Detail.vue',
            hidden: true,
            perms: 'system:user:detail'
          }
        ]
      },
      {
        id: 8,
        parentId: 4,
        title: '角色管理',
        path: '/system/role',
        component: '@/views/System/Role/index.vue'
      }
    ]
  }
  // 继续添加其他模块菜单...
]

// ============================================================
//  工具函数（仅本文件使用）
// ============================================================

function filterHiddenMenus(menus: MockMenu[]): MockMenu[] {
  return menus
    .filter((m) => !m.hidden)
    .map((m) => ({
      ...m,
      children: m.children ? filterHiddenMenus(m.children) : []
    }))
}

// ============================================================
//  菜单接口
// ============================================================

registerMock('GET', '/menu/user-menus', () => {
  return mockResponse(filterHiddenMenus(mockMenus))
})

// 后续可追加菜单 CRUD 接口...
// registerMock('POST', '/menu', ({ body }) => { ... })
// registerMock('PUT', '/menu/:id', ({ body, url }) => { ... })
