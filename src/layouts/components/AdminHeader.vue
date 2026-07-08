<script setup lang="ts">
import type { Menu } from '@/types/menu'
import { useRoute, useRouter } from 'vue-router'
import { reactive, computed } from 'vue'

const headerMenu = reactive<Menu[]>([
  { path: '/dashboard', name: 'dashboard', title: '测试', icon: '' },
  { path: '/system', name: 'system', title: '系统', icon: '' },
  { path: '/user', name: 'user', title: '用户', icon: '' }
])

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
    <div class="admin-logo"></div>
    <ul class="admin-main-menu">
      <li v-for="menu in headerMenu" :key="menu.path" :class="['admin-menu-item', { 'active-menu-item': currentActiveKey === menu.path }]" @click="handleMenuClick(menu)">
        {{ menu.title }}
      </li>
    </ul>
    <div class="admin-setting"></div>
  </nav>
</template>

<style lang="scss" scoped>
.admin-header {
  display: flex;
  height: 56px;
  padding: 0 60px;
  background-color: #f1f4f9;
  .admin-logo {
    width: 140px;
    height: 100%;
  }
  .admin-main-menu {
    width: 0;
    height: 100%;
    flex: 1;
    padding: 10px 20px;
    gap: 5px;
    display: flex;
    .admin-menu-item {
      display: flex;
      align-items: center;
      font-weight: 500;
      padding: 0 40px;
      color: #4a5a72;
      cursor: pointer;
      border-radius: 10px;
      &:hover {
        color: #0b1a33;
        background: rgba(255, 255, 255, 0.5);
      }
    }
    .active-menu-item {
      background: #ffffff;
      color: #0b1a33;
    }
  }
  .admin-setting {
    width: 200px;
    height: 100%;
  }
}
</style>
