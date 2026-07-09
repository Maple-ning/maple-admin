<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from './components/AdminHeader.vue'
import AdminSidebar from './components/AdminSidebar.vue'

const route = useRoute()

const breadcrumbs = computed(() => {
  return route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({ title: r.meta.title as string, path: r.path }))
})
</script>

<template>
  <a-layout class="admin-layout">
    <admin-header />
    <a-layout class="admin-basic">
      <admin-sidebar />
      <a-layout class="admin-main">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
            {{ item.title }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <router-view />
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
}
</style>
