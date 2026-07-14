<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useAppStore } from '@/stores/app'
import { filterVisibleMenus, isPathInMenu } from '@/utils/permission'
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  MenuOutlined,
} from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import type { Menu } from '@/types/menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

// 获取顶级菜单（parentId === 0）
const headerMenus = computed<Menu[]>(() => permissionStore.menuTree.filter((menu) => menu.parentId === 0 && !menu.hidden))

// 当前激活的一级菜单路径
const activeMenuPath = computed(() => {
  const activeMenu = headerMenus.value.find((menu) => isPathInMenu(menu, route.path))
  return activeMenu?.path || ''
})

const activeTopMenu = computed(() => headerMenus.value.find((menu) => menu.path === activeMenuPath.value))
const headerSubMenus = computed<Menu[]>(() => filterVisibleMenus(activeTopMenu.value?.children || []))
const activeSubMenuPath = computed(() => {
  const activeMenu = headerSubMenus.value.find((menu) => isPathInMenu(menu, route.path))
  return activeMenu?.path || ''
})
const activeSubMenu = computed(() => headerSubMenus.value.find((menu) => menu.path === activeSubMenuPath.value))

const canAccessProfile = computed(() => userStore.hasPermission('account:profile'))
const canAccessSettings = computed(() => userStore.hasPermission('account:settings'))

// 用户下拉菜单点击
const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
  if (key === 'logout') {
    await userStore.logout()
    router.replace('/login')
    return
  }
  if (key === 'profile') router.push('/account/profile')
  if (key === 'settings') router.push('/account/settings')
}
</script>

<template>
  <header class="admin-header">
    <div class="admin-header-left">
      <button class="mobile-menu-btn" type="button" aria-label="打开菜单" @click="appStore.setMobileSidebarOpen(true)">
        <MenuOutlined />
      </button>
      <div class="admin-header-path">
        <span>{{ activeTopMenu?.title || 'Dashboard' }}</span>
        <i>/</i>
        <strong>{{ activeSubMenu?.title || 'Home' }}</strong>
      </div>
    </div>

    <div class="admin-header-right">
      <div class="admin-search">
        <SearchOutlined />
        <input type="search" placeholder="Search data..." />
      </div>
      <button class="header-icon-btn has-dot" type="button" aria-label="通知">
        <BellOutlined />
      </button>
      <button class="header-icon-btn" type="button" aria-label="帮助">
        <QuestionCircleOutlined />
      </button>
      <button class="header-icon-btn" type="button" aria-label="设置" @click="router.push('/account/settings')">
        <SettingOutlined />
      </button>
      <a-dropdown :trigger="['click']">
        <button class="profile-trigger" type="button" aria-label="用户菜单">
          <span class="profile-copy">
            <strong>{{ userStore.username || '管理员' }}</strong>
            <em>{{ userStore.nickname }}</em>
          </span>
          <span class="admin-avatar">M<i /></span>
          <DownOutlined class="profile-arrow" />
        </button>
        <template #overlay>
          <a-menu @click="handleUserMenuClick">
            <a-menu-item key="profile" :disabled="!canAccessProfile">个人中心</a-menu-item>
            <a-menu-item key="settings" :disabled="!canAccessSettings">设置</a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout">登出</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.admin-header {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  min-height: 56px;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(97, 151, 162, 0.18);
  backdrop-filter: blur(16px);
}

.admin-header-left {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 22px;
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  color: #344052;
  cursor: pointer;
  background: rgba(198, 230, 225, 0.6);
  border: 1px solid rgba(0, 121, 107, 0.12);
  border-radius: 10px;
}

.admin-header-path {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #6b7785;
  font-size: 11px;
  white-space: nowrap;

  i {
    color: #9aa8b5;
    font-style: normal;
  }

  strong {
    color: #00796b;
    font-weight: 750;
  }
}

.admin-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  gap: 14px;
}

.admin-search {
  display: flex;
  align-items: center;
  width: min(250px, 24vw);
  height: 34px;
  gap: 10px;
  padding: 0 14px;
  color: #71808f;
  background: rgba(241, 246, 247, 0.86);
  border: 1px solid rgba(97, 151, 162, 0.1);
  border-radius: 999px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-within {
    background: #ffffff;
    border-color: rgba(0, 121, 107, 0.22);
    box-shadow: 0 8px 24px rgba(31, 102, 117, 0.08);
  }

  input {
    width: 100%;
    min-width: 0;
    color: var(--maple-text);
    font-size: 12px;
    outline: none;
    background: transparent;
    border: 0;

    &::placeholder {
      color: #8995a1;
    }
  }
}

.header-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  padding: 0;
  color: #344052;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    color: #00796b;
    background: rgba(198, 230, 225, 0.68);
    border-color: rgba(0, 121, 107, 0.12);
  }

  &.has-dot::after {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 7px;
    height: 7px;
    content: '';
    background: #e53935;
    border: 2px solid #ffffff;
    border-radius: 50%;
  }
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 0 0 16px;
  color: var(--maple-text);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-left: 1px solid rgba(97, 151, 162, 0.22);
}

.profile-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 86px;

  strong {
    color: #1d2939;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.1;
  }

  em {
    margin-top: 4px;
    color: #6b7785;
    font-size: 10px;
    font-style: normal;
    line-height: 1.1;
  }
}

.admin-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  background: linear-gradient(135deg, #00796b, #00bfa5);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(0, 121, 107, 0.18);

  i {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 10px;
    height: 10px;
    background: #26c281;
    border: 2px solid #ffffff;
    border-radius: 999px;
  }
}

.profile-arrow {
  color: #6b7785;
  font-size: 10px;
}

@media (max-width: 991.98px) {
  .admin-header {
    height: auto;
    min-height: 72px;
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 16px;
  }

  .admin-header-left,
  .admin-header-right {
    width: 100%;
    justify-content: space-between;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }

  .admin-search {
    width: min(320px, 48vw);
  }
}

@media (max-width: 640px) {
  .admin-header-path,
  .profile-copy,
  .profile-arrow {
    display: none;
  }

  .admin-search {
    width: 100%;
    flex: 1;
  }
}
</style>
