<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getIcon } from '@/utils/iconMap'
import { isPathInMenu } from '@/utils/permission'
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  DownOutlined,
} from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import type { Menu } from '@/types/menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 获取顶级菜单（parentId === 0）
const headerMenus = computed<Menu[]>(() => permissionStore.menuTree.filter((menu) => menu.parentId === 0 && !menu.hidden))

// 当前激活的一级菜单路径
const activeMenuPath = computed(() => {
  const activeMenu = headerMenus.value.find((menu) => isPathInMenu(menu, route.path))
  return activeMenu?.path || ''
})

const canAccessProfile = computed(() => userStore.hasPermission('account:profile'))
const canAccessSettings = computed(() => userStore.hasPermission('account:settings'))

// 点击菜单跳转
const handleMenuClick = (menu: Menu) => {
  if (menu.redirect) {
    router.push(menu.redirect)
  } else if (menu.children && menu.children.length > 0) {
    // 跳转到第一个子菜单
    const firstChild = menu.children[0]
    router.push(firstChild.path)
  } else {
    router.push(menu.path)
  }
}

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
        v-for="menu in headerMenus"
        :key="menu.path"
        :class="['admin-menu-item', { 'active-menu-item': activeMenuPath === menu.path }]"
        @click="handleMenuClick(menu)"
      >
        <component :is="getIcon(menu.icon)" class="menu-icon" v-if="menu.icon" />
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
        <a-dropdown :trigger="['click']">
          <a class="ant-dropdown-link" @click.prevent>
            {{ userStore.username || '管理员' }}
            <DownOutlined />
          </a>
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
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.admin-header {
  display: flex;
  align-items: center;
  flex: 0 0 66px;
  height: 66px;
  padding: 0 clamp(18px, 3vw, 42px);
  background: rgba(255, 255, 255, 0.78);
  border-bottom: 1px solid var(--maple-border);
  box-shadow: 0 10px 30px rgba(31, 102, 117, 0.06);
  backdrop-filter: blur(18px);
  .admin-brand {
    display: flex;
    align-items: center;
    width: 230px;
    height: 100%;
    min-width: 180px;
    gap: 12px;
  }
  .admin-logo-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    overflow: hidden;
    background: linear-gradient(135deg, #ffffff, #e9fbf7);
    border: 1px solid rgba(56, 189, 248, 0.2);
    border-radius: 10px;
    box-shadow: 0 10px 24px rgba(14, 165, 163, 0.14);
    img {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }
  }
  .admin-brand-text {
    display: flex;
    align-items: baseline;
    color: var(--maple-text);
    font-size: 18px;
    line-height: 1;
    white-space: nowrap;
    strong {
      font-weight: 800;
    }
    span {
      margin-left: 4px;
      color: var(--maple-primary-strong);
      font-weight: 700;
    }
  }
  .admin-main-menu {
    width: 0;
    height: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    margin: 0;
    padding: 10px 20px;
    .admin-menu-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      gap: 8px;
      font-weight: 500;
      padding: 0 22px;
      color: #52677a;
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
        color: var(--maple-primary-strong);
        background: rgba(236, 253, 245, 0.8);
        transform: translateY(-1px);
      }
    }
    .active-menu-item {
      background: linear-gradient(135deg, #ecfeff, #ecfdf5);
      color: var(--maple-primary-strong);
      border-color: rgba(45, 212, 191, 0.28);
      box-shadow: 0 10px 24px rgba(20, 184, 166, 0.12);
    }
  }
  .admin-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 270px;
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
    color: #52677a;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.76);
    border: 1px solid var(--maple-border);
    border-radius: 8px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    &:hover {
      color: var(--maple-primary-strong);
      border-color: rgba(45, 212, 191, 0.32);
      box-shadow: 0 8px 18px rgba(20, 184, 166, 0.12);
    }
    &.has-dot::after {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 7px;
      height: 7px;
      content: '';
      background: #34d399;
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
    color: var(--maple-text);
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid var(--maple-border);
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
    background: linear-gradient(135deg, #38bdf8, #34d399);
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
