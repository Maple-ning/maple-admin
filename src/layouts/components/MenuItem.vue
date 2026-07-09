<script setup lang="ts">
import { computed } from 'vue'
import { getIcon } from '@/utils/iconMap'

// 为了递归，需要显式声明组件名
defineOptions({ name: 'MenuItem' })

interface MenuItemType {
  path: string
  title: string
  icon?: string
  children?: MenuItemType[]
}

const props = defineProps<{
  item: MenuItemType
}>()

// 判断是否有子菜单（注意：children 可能为空数组，也需要判断长度）
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

// 根据图标名称获取组件
const iconComponent = computed(() => getIcon(props.item.icon))
</script>

<template>
  <a-sub-menu v-if="hasChildren" :key="item.path">
    <template #title>
      <span>
        <component :is="iconComponent" v-if="iconComponent" />
        <span>{{ item.title }}</span>
      </span>
    </template>
    <MenuItem v-for="child in item.children" :key="child.path" :item="child" />
  </a-sub-menu>

  <a-menu-item v-else :key="item.path">
    <component :is="iconComponent" v-if="iconComponent" />
    <span>{{ item.title }}</span>
  </a-menu-item>
</template>

<style lang="scss" scoped>
.container {
}
</style>
