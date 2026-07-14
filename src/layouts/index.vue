<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AdminHeader from './components/AdminHeader.vue'
import AdminSidebar from './components/AdminSidebar.vue'

const appStore = useAppStore()

onMounted(() => {
  appStore.initResponsive()
})
</script>

<template>
  <a-layout class="admin-layout">
    <admin-sidebar />
    <a-layout class="admin-basic">
      <admin-header />
      <a-layout class="admin-main">
        <div class="admin-content-shell">
          <router-view />
        </div>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
.admin-layout {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: #f4f6f7;
}
.admin-basic {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  width: 0;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: transparent;
}
.admin-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  max-height: 100%;
  overflow-x: hidden;
  background: #f4f6f7;
  scrollbar-gutter: stable;
}
.admin-content-shell {
  min-height: 100%;
  padding: 24px;
}
@media (max-width: 900px) {
  .admin-content-shell {
    padding: 18px;
  }
}
</style>
