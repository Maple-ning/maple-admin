<script setup lang="ts">
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import { useSidebarMenu } from './sidebar/useSidebarMenu'
import SidebarMenuItem from './sidebar/SidebarMenuItem.vue'

const appStore = useAppStore()
const { sidebarMenus, selectedKeys, openKeys, handleMenuSelect, handleOpenChange } = useSidebarMenu()

async function handleSelect(payload: { key: string }) {
  await handleMenuSelect(payload)
  appStore.setMobileSidebarOpen(false)
}

</script>

<template>
  <aside class="admin-sidebar" :class="{ 'is-collapsed': appStore.collapsed }">
    <div class="admin-sidebar-brand">
      <span class="admin-sidebar-logo">
        <img src="/maple.svg" alt="" />
      </span>
      <span>
        <strong>Maple Admin</strong>
      </span>
    </div>

    <div class="admin-sidebar-scroll">
      <a-menu
        class="admin-side-menu"
        v-model:selectedKeys="selectedKeys"
        :openKeys="openKeys"
        :inline-collapsed="appStore.collapsed"
        mode="inline"
        :style="{ borderRight: 0 }"
        @openChange="handleOpenChange"
        @select="handleSelect"
      >
        <SidebarMenuItem v-for="item in sidebarMenus" :key="item.path" :item="item" />
      </a-menu>

      <a-empty v-if="sidebarMenus.length === 0" class="admin-side-empty" description="暂无菜单" />
    </div>

    <button
      class="admin-sidebar-toggle"
      type="button"
      :aria-label="appStore.collapsed ? '展开侧边栏' : '折叠侧边栏'"
      :title="appStore.collapsed ? '展开侧边栏' : '折叠侧边栏'"
      @click="appStore.toggleCollapsed"
    >
      <RightOutlined v-if="appStore.collapsed" />
      <LeftOutlined v-else />
    </button>
  </aside>

  <a-drawer
    v-if="appStore.isMobile"
    class="admin-sidebar-drawer"
    :open="appStore.mobileSidebarOpen"
    placement="left"
    :width="208"
    :closable="false"
    :body-style="{ padding: 0 }"
    @close="appStore.setMobileSidebarOpen(false)"
  >
    <div class="admin-sider-drawer-body">
      <a-menu
        class="admin-side-menu"
        v-model:selectedKeys="selectedKeys"
        :openKeys="openKeys"
        mode="inline"
        :style="{ height: '100%', borderRight: 0 }"
        @openChange="handleOpenChange"
        @select="handleSelect"
      >
        <SidebarMenuItem v-for="item in sidebarMenus" :key="item.path" :item="item" />
      </a-menu>

      <a-empty v-if="sidebarMenus.length === 0" class="admin-side-empty" description="暂无菜单" />
    </div>
  </a-drawer>
</template>

<style lang="scss" scoped>
.admin-sidebar {
  position: relative;
  z-index: 4;
  display: flex;
  width: 204px;
  min-width: 204px;
  height: 100%;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.94);
  border-right: 1px solid rgba(97, 151, 162, 0.22);
  transition:
    width 0.2s ease,
    min-width 0.2s ease;

  &.is-collapsed {
    width: 72px;
    min-width: 72px;
  }
}

.admin-sidebar-brand {
  display: flex;
  align-items: center;
  height: 96px;
  gap: 10px;
  padding: 0 18px;
  overflow: hidden;

  span:last-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  strong {
    color: #006b63;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.12;
  }

  em {
    margin-top: 4px;
    color: #5f7284;
    font-size: 11px;
    font-style: normal;
    line-height: 1.2;
  }
}

.admin-sidebar.is-collapsed .admin-sidebar-brand {
  justify-content: center;
  padding: 0;

  > span:last-child {
    display: none;
  }
}

.admin-sidebar-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  overflow: hidden;
  background: #00c7ad;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 128, 113, 0.18);

  img {
    width: 22px;
    height: 22px;
    filter: brightness(0) invert(1);
  }
}

.admin-sidebar-scroll {
  min-height: 0;
  flex: 1;
  padding: 12px 12px 20px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.admin-sidebar.is-collapsed .admin-sidebar-scroll {
  padding-right: 8px;
  padding-left: 8px;
}

.admin-sidebar-toggle {
  position: absolute;
  z-index: 2;
  top: 50%;
  right: -20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 44px;
  padding: 0;
  color: #8a9aa5;
  font-size: 9px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(97, 151, 162, 0.22);
  border-left: 0;
  border-radius: 0 10px 10px 0;
  box-shadow: 4px 2px 10px rgba(31, 102, 117, 0.035);
  transform: translateY(-50%);
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;

  &::before {
    position: absolute;
    top: -1px;
    bottom: -1px;
    left: -1px;
    width: 2px;
    content: '';
    background: rgba(255, 255, 255, 0.94);
  }

  :deep(.anticon) {
    position: relative;
    z-index: 1;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: #00796b;
    background: #f1faf8;
    border-color: rgba(0, 121, 107, 0.22);

    &::before {
      background: #f1faf8;
    }

    :deep(.anticon) {
      transform: scale(1.12);
    }
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 121, 107, 0.35);
    outline-offset: 2px;
  }
}

.admin-sider-drawer-body {
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 253, 251, 0.78)),
    var(--maple-surface);
}

.admin-side-menu {
  padding: 0;
  background: transparent;

  :deep(.ant-menu-item::after),
  :deep(.ant-menu-submenu-title::after) {
    display: none;
  }

  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    width: 100%;
    height: 44px;
    margin: 4px 0;
    color: #5f6572;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    transition:
      color 0.2s ease,
      background 0.2s ease;
  }

  :deep(.ant-menu-item .anticon),
  :deep(.ant-menu-submenu-title .anticon) {
    color: #5e6c79;
    font-size: 16px;
  }

  :deep(.ant-menu-title-content) {
    min-width: 0;
  }

  :deep(.ant-menu-item-active),
  :deep(.ant-menu-submenu-title:hover) {
    color: #00796b;
    background: rgba(198, 230, 225, 0.58);
  }

  :deep(.ant-menu-submenu-selected > .ant-menu-submenu-title),
  :deep(.ant-menu-submenu-open > .ant-menu-submenu-title) {
    color: #5f6572;
    background: transparent;
    font-weight: 600;
  }

  :deep(.ant-menu-submenu-selected > .ant-menu-submenu-title .anticon),
  :deep(.ant-menu-submenu-open > .ant-menu-submenu-title .anticon) {
    color: #5e6c79;
  }

  :deep(.ant-menu-item-selected) {
    color: #00796b;
    background: rgba(198, 230, 225, 0.92);
    font-weight: 750;
    box-shadow: inset 3px 0 0 #00796b;
  }

  :deep(.ant-menu-item-selected .anticon) {
    color: #00796b;
  }

  :deep(.ant-menu-submenu-arrow) {
    color: #7b8794;
  }

  :deep(.ant-menu-sub.ant-menu-inline) {
    margin: 2px 0 6px;
    background: transparent;
  }

  :deep(.ant-menu-sub.ant-menu-inline .ant-menu-item) {
    height: 38px;
    margin: 2px 0;
    padding-left: 42px !important;
    color: #6c7784;
    font-size: 12px;
    font-weight: 500;
  }

  :deep(.ant-menu-sub.ant-menu-inline .ant-menu-item-selected) {
    color: #00796b;
  }

  :deep(.ant-menu-sub),
  :deep(.ant-menu) {
    background: transparent;
  }
}

.admin-sidebar.is-collapsed .admin-side-menu {
  width: 100%;

  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 0 !important;
  }

  :deep(.ant-menu-item > .ant-menu-title-content) {
    display: none;
  }

  :deep(.ant-menu-submenu-title > .ant-menu-title-content) {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    opacity: 1;
  }

  :deep(.anticon) {
    margin-inline: 0 !important;
    line-height: 1;
  }

  :deep(.sidebar-menu-title) {
    width: 100%;
    justify-content: center;
    gap: 0;
  }

  :deep(.sidebar-menu-title > span:not(.anticon)) {
    display: none;
  }
}

.admin-side-empty {
  margin-top: 48px;

  :deep(.ant-empty-description) {
    color: var(--maple-muted);
  }
}

.admin-sidebar-drawer {
  :deep(.ant-drawer-content) {
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(16px);
  }
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    display: none;
  }
}
</style>
