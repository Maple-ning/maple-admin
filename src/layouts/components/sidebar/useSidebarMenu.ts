import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import { filterVisibleMenus } from '@/utils/permission'
import type { Menu } from '@/types/menu'

function findNearestVisiblePath(menus: Menu[], currentPath: string) {
  let matchedPath = ''

  const walk = (items: Menu[]) => {
    for (const item of items) {
      const isMatched = item.path === currentPath || currentPath.startsWith(`${item.path}/`)
      if (isMatched && item.path.length > matchedPath.length) {
        matchedPath = item.path
      }
      if (item.children?.length) {
        walk(item.children)
      }
    }
  }

  walk(menus)
  return matchedPath
}

function findParentKeys(menus: Menu[], targetPath: string, parents: string[] = []): string[] {
  for (const item of menus) {
    if (item.path === targetPath) return parents
    if (item.children?.length) {
      const result = findParentKeys(item.children, targetPath, [...parents, item.path])
      if (result.length) return result
    }
  }
  return []
}

function findRootKey(menus: Menu[], targetPath: string): string {
  for (const item of menus) {
    if (item.path === targetPath) return item.path
    if (item.children?.length) {
      const matched = findRootKey(item.children, targetPath)
      if (matched) return item.path
    }
  }
  return ''
}

export function useSidebarMenu() {
  const route = useRoute()
  const router = useRouter()
  const permissionStore = usePermissionStore()
  const selectedKeys = ref<string[]>([])
  const openKeys = ref<string[]>([])

  const sidebarMenus = computed<Menu[]>(() => filterVisibleMenus(permissionStore.menuTree))

  function updateMenuState() {
    const selectedPath = findNearestVisiblePath(sidebarMenus.value, route.path)
    selectedKeys.value = selectedPath ? [selectedPath] : []
    const parentKeys = selectedPath ? findParentKeys(sidebarMenus.value, selectedPath) : []
    openKeys.value = parentKeys
  }

  watch([() => route.path, sidebarMenus], updateMenuState, { immediate: true })

  function handleOpenChange(nextOpenKeys: string[]) {
    const latestOpenKey = nextOpenKeys.find((key) => !openKeys.value.includes(key))

    if (!latestOpenKey) {
      openKeys.value = nextOpenKeys
      return
    }

    const activeRootKey = findRootKey(sidebarMenus.value, latestOpenKey) || latestOpenKey
    openKeys.value = nextOpenKeys.filter((key) => {
      const rootKey = findRootKey(sidebarMenus.value, key) || key
      return rootKey === activeRootKey
    })
  }

  async function handleMenuSelect({ key }: { key: string }) {
    if (key === route.path) return
    await router.push(key)
  }

  return {
    sidebarMenus,
    selectedKeys,
    openKeys,
    handleMenuSelect,
    handleOpenChange,
  }
}
