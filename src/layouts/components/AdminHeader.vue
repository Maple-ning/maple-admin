<script setup lang="ts">
import type { Menu } from '@/types/menu'
import { useRoute, useRouter } from 'vue-router'
import { reactive, computed } from 'vue'
import {
  AppstoreOutlined,
  BellOutlined,
  DashboardOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const headerMenu = reactive<Menu[]>([
  { path: '/dashboard', name: 'dashboard', title: '仪表盘', icon: 'dashboard' },
  { path: '/system', name: 'system', title: '系统管理', icon: 'system' },
  { path: '/user', name: 'user', title: '用户中心', icon: 'user' }
])

const menuIconMap = {
  dashboard: DashboardOutlined,
  system: AppstoreOutlined,
  user: UserOutlined
}

const route = useRoute()
const router = useRouter()

// 获取当前路由的第一个path，用户高亮当前一级菜单
const currentFirstLevelPath = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  return segments.length > 0 ? segments[0] : ''
})

// 获取当前的path，用于生成动态高亮class
const currentActiveKey = computed(() => {
  const matchedItem = headerMenu.find((item) => item.path.replace(/^\//, '') === currentFirstLevelPath.value)
  return matchedItem ? matchedItem.path : ''
})

const handleMenuClick = (item: Menu) => {
  router.push(item.path)
}
</script>

<template>
  <nav class="admin-header" aria-label="主导航">
    <div class="admin-brand" aria-label="Maple Admin">
      <span class="admin-logo-mark">
        <img src="/maple.svg" alt="" />
      </span>
      <span class="admin-brand-text">
        <strong>Maple</strong>
        <span>Admin</span>
      </span>
    </div>
    <ul class="admin-main-menu">
      <li
        v-for="menu in headerMenu"
        :key="menu.path"
        :class="['admin-menu-item', { 'active-menu-item': currentActiveKey === menu.path }]"
        @click="handleMenuClick(menu)"
      >
        <component :is="menuIconMap[menu.icon as keyof typeof menuIconMap]" class="menu-icon" />
        <span>{{ menu.title }}</span>
      </li>
    </ul>
    <div class="admin-actions">
      <button class="header-icon-btn" type="button" aria-label="搜索">
        <search-outlined />
      </button>
      <button class="header-icon-btn has-dot" type="button" aria-label="通知">
        <bell-outlined />
      </button>
      <button class="header-icon-btn" type="button" aria-label="设置">
        <setting-outlined />
      </button>
      <div class="admin-user">
        <span class="admin-avatar">M</span>
        <span class="admin-username">管理员</span>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.admin-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 clamp(20px, 4vw, 60px);
  background: linear-gradient(135deg, #ffffff 0%, #f6f8fb 52%, #eef5f3 100%);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  .admin-brand {
    display: flex;
    align-items: center;
    width: 220px;
    height: 100%;
    min-width: 180px;
    gap: 12px;
  }
  .admin-logo-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid rgba(220, 38, 38, 0.14);
    border-radius: 12px;
    box-shadow: 0 10px 24px rgba(216, 30, 6, 0.14);
    img {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }
  }
  .admin-brand-text {
    display: flex;
    align-items: baseline;
    color: #132238;
    font-size: 18px;
    line-height: 1;
    white-space: nowrap;
    strong {
      font-weight: 800;
    }
    span {
      margin-left: 4px;
      color: #d81e06;
      font-weight: 700;
    }
  }
  .admin-main-menu {
    width: 0;
    height: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin: 0;
    padding: 10px 20px;
    .admin-menu-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 42px;
      gap: 8px;
      font-weight: 500;
      padding: 0 24px;
      color: #4a5a72;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 8px;
      transition:
        color 0.2s ease,
        background 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
      .menu-icon {
        font-size: 16px;
      }
      &:hover {
        color: #132238;
        background: rgba(255, 255, 255, 0.72);
        transform: translateY(-1px);
      }
    }
    .active-menu-item {
      background: #ffffff;
      color: #d81e06;
      border-color: rgba(216, 30, 6, 0.12);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    }
  }
  .admin-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 260px;
    height: 100%;
    gap: 10px;
  }
  .header-icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: #52627a;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    &:hover {
      color: #d81e06;
      border-color: rgba(216, 30, 6, 0.18);
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    }
    &.has-dot::after {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 7px;
      height: 7px;
      content: '';
      background: #d81e06;
      border: 2px solid #ffffff;
      border-radius: 50%;
    }
  }
  .admin-user {
    display: flex;
    align-items: center;
    height: 40px;
    gap: 8px;
    padding: 0 12px 0 6px;
    color: #132238;
    background: rgba(255, 255, 255, 0.76);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
  }
  .admin-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    background: linear-gradient(135deg, #d81e06, #f59e0b);
    border-radius: 8px;
  }
  .admin-username {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
}

@media (max-width: 900px) {
  .admin-header {
    padding: 0 16px;
    .admin-brand {
      width: auto;
      min-width: auto;
    }
    .admin-brand-text {
      display: none;
    }
    .admin-main-menu {
      justify-content: center;
      padding: 10px 12px;
      .admin-menu-item {
        padding: 0 14px;
      }
    }
    .admin-actions {
      width: auto;
    }
    .admin-username {
      display: none;
    }
  }
}

@media (max-width: 640px) {
  .admin-header {
    .admin-main-menu {
      overflow-x: auto;
      justify-content: flex-start;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
      .admin-menu-item {
        flex: 0 0 auto;
      }
    }
    .header-icon-btn {
      display: none;
    }
  }
}
</style>
