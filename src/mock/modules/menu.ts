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
  component: string // 组件路径字符串，如 '@/views/System/User/List.vue'
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
        component: '@/views/Dashboard/Overview.vue',
        perms: 'dashboard:overview'
      },
      {
        id: 3,
        parentId: 1,
        title: '分析',
        path: '/dashboard/analytics',
        component: '@/views/Dashboard/Analytics.vue',
        perms: 'dashboard:analytics'
      },
      {
        id: 12,
        parentId: 1,
        title: '系统监控',
        path: '/dashboard/monitor',
        component: '@/views/Dashboard/Monitor.vue',
        perms: 'dashboard:analytics'
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
        component: '@/views/System/User/List.vue',
        icon: 'UserOutlined',
        perms: 'system:user:list'
      },
      {
        id: 7,
        parentId: 4,
        title: '用户详情',
        path: '/system/user/detail',
        component: '@/views/System/User/Detail.vue',
        hidden: true,
        perms: 'system:user:detail'
      },
      {
        id: 8,
        parentId: 4,
        title: '角色管理',
        path: '/system/role',
        component: '@/views/System/Role/index.vue',
        perms: 'system:role:list'
      },
      {
        id: 13,
        parentId: 4,
        title: '菜单管理',
        path: '/system/menu',
        component: '@/views/System/Menu/index.vue',
        perms: 'system:menu:list'
      },
      {
        id: 14,
        parentId: 4,
        title: '权限测试',
        path: '/system/permission-test',
        component: '@/views/System/PermissionTest/index.vue',
        perms: 'system:permission:test'
      }
    ]
  },
  {
    id: 9,
    parentId: 0,
    title: '业务示例',
    path: '/business',
    component: 'Layout',
    icon: 'ShoppingOutlined',
    redirect: '/business/order/list',
    sort: 3,
    children: [
      {
        id: 10,
        parentId: 9,
        title: '订单管理',
        path: '/business/order/list',
        component: '@/views/Order/List.vue',
        perms: 'order:list'
      },
      {
        id: 11,
        parentId: 9,
        title: '订单详情',
        path: '/business/order/detail',
        component: '@/views/Order/Detail.vue',
        hidden: true,
        perms: 'order:detail'
      },
      {
        id: 15,
        parentId: 9,
        title: '商品管理',
        path: '/business/product/list',
        component: '@/views/Product/List.vue',
        perms: 'product:list'
      }
    ]
  },
  {
    id: 16,
    parentId: 0,
    title: '日志审计',
    path: '/log',
    component: 'Layout',
    icon: 'FileSearchOutlined',
    redirect: '/log/operation',
    sort: 4,
    children: [
      {
        id: 17,
        parentId: 16,
        title: '操作日志',
        path: '/log/operation',
        component: '@/views/Log/Operation.vue',
        perms: 'log:operation'
      },
      {
        id: 18,
        parentId: 16,
        title: '登录日志',
        path: '/log/login',
        component: '@/views/Log/Login.vue',
        perms: 'log:login'
      }
    ]
  },
  {
    id: 19,
    parentId: 0,
    title: '个人中心',
    path: '/account',
    component: 'Layout',
    icon: 'UserOutlined',
    redirect: '/account/profile',
    sort: 5,
    children: [
      {
        id: 20,
        parentId: 19,
        title: '个人资料',
        path: '/account/profile',
        component: '@/views/Account/Profile.vue',
        perms: 'account:profile'
      },
      {
        id: 21,
        parentId: 19,
        title: '个人设置',
        path: '/account/settings',
        component: '@/views/Account/Settings.vue',
        perms: 'account:settings'
      }
    ]
  }
  // 继续添加其他模块菜单...
]

// ============================================================
//  工具函数（仅本文件使用）
// ============================================================

// ============================================================
//  菜单接口
// ============================================================

registerMock('GET', '/menu/user-menus', () => {
  return mockResponse(mockMenus)
})

// 后续可追加菜单 CRUD 接口...
// registerMock('POST', '/menu', ({ body }) => { ... })
// registerMock('PUT', '/menu/:id', ({ body, url }) => { ... })
