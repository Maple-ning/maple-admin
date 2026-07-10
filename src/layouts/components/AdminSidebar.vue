<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import type { Menu } from '@/types/menu'
import MenuItem from './MenuItem.vue'
import { filterVisibleMenus, isPathInMenu } from '@/utils/permission'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

// 所有菜单树
const menuTree = computed<Menu[]>(() => permissionStore.menuTree)

// 根据当前路由，过滤出当前一级菜单及其子树
const currentMenuTree = computed(() => {
  const topMenu = menuTree.value.find((menu: Menu) => isPathInMenu(menu, route.path))
  // ✅ 返回二级菜单（children），而不是整棵一级菜单
  return topMenu?.children ? filterVisibleMenus(topMenu.children) : []
})

// 选中和展开状态
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

function updateMenuState() {
  const currentPath = route.path
  selectedKeys.value = [currentPath]

  const segments = currentPath.split('/').filter(Boolean)
  const parents: string[] = []
  let accumulated = ''
  // 只取祖先路径（不含自身）
  for (let i = 0; i < segments.length - 1; i++) {
    accumulated += '/' + segments[i]
    parents.push(accumulated)
  }
  openKeys.value = parents
}

watch(() => route.path, updateMenuState, { immediate: true })

function handleMenuSelect({ key }: { key: string }) {
  router.push(key).catch((err) => {
    if (err.name !== 'NavigationDuplicated') console.error(err)
  })
}
</script>

<template>
  <a-layout-sider class="admin-sider" width="248">
    <a-menu
      class="admin-side-menu"
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      :style="{ height: '100%', borderRight: 0 }"
      @select="handleMenuSelect"
    >
      <MenuItem v-for="item in currentMenuTree" :key="item.path" :item="item" />
    </a-menu>
  </a-layout-sider>
</template>

<style lang="scss" scoped>
.admin-sider {
  flex: 0 0 248px !important;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72) !important;
  border-right: 1px solid var(--maple-border);
  backdrop-filter: blur(14px);
}

.admin-side-menu {
  padding: 12px 10px;
  background: transparent;

  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    height: 42px;
    margin: 4px 0;
    color: #52677a;
    border-radius: 8px;
  }

  :deep(.ant-menu-item-selected) {
    color: var(--maple-primary-strong);
    background: linear-gradient(135deg, #e0f7ff, #e7fbf1);
    box-shadow: inset 3px 0 0 #34d399;
  }

  :deep(.ant-menu-submenu-selected > .ant-menu-submenu-title),
  :deep(.ant-menu-submenu-title:hover),
  :deep(.ant-menu-item:hover) {
    color: var(--maple-primary-strong);
    background: rgba(236, 253, 245, 0.82);
  }

  :deep(.ant-menu-sub) {
    background: transparent;
  }
}
</style>
