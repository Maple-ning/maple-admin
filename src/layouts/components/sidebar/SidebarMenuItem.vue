<script setup lang="ts">
import { computed } from 'vue'
import { getIcon } from '@/utils/iconMap'
import type { Menu } from '@/types/menu'

defineOptions({ name: 'SidebarMenuItem' })

const props = defineProps<{
  item: Menu
}>()

const hasChildren = computed(() => Boolean(props.item.children?.length))
const iconComponent = computed(() => getIcon(props.item.icon))
</script>

<template>
  <a-sub-menu v-if="hasChildren" :key="item.path">
    <template #title>
      <span class="sidebar-menu-title">
        <component :is="iconComponent" v-if="iconComponent" />
        <span>{{ item.title }}</span>
      </span>
    </template>
    <SidebarMenuItem v-for="child in item.children" :key="child.path" :item="child" />
  </a-sub-menu>

  <a-menu-item v-else :key="item.path">
    <component :is="iconComponent" v-if="iconComponent" />
    <span>{{ item.title }}</span>
  </a-menu-item>
</template>

<style lang="scss" scoped>
.sidebar-menu-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
</style>
