<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import type { Menu } from '@/types/menu'
import MenuItem from './MenuItem.vue'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

// 所有菜单树
const menuTree = computed(() => permissionStore.menuTree)

// 根据当前路由，过滤出当前一级菜单及其子树
const currentMenuTree = computed(() => {
  const topRoute = route.matched[0]
  if (!topRoute) return []
  const currentTopPath = topRoute.path
  // 从 menuTree 中查找匹配的一级菜单
  const topMenu = menuTree.value.find((menu: Menu) => menu.path === currentTopPath)
  // ✅ 返回二级菜单（children），而不是整棵一级菜单
  return topMenu?.children || []
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
  <a-layout-sider class="admin-sider" width="200">
    <a-menu
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
.admin-sidebar {
  background: #fff;
}
</style>
