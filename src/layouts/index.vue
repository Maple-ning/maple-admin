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
        <div class="admin-content-shell">
          <a-breadcrumb class="admin-breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          <router-view />
        </div>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 18%, rgba(190, 242, 232, 0.68), transparent 30%),
    radial-gradient(circle at 88% 0%, rgba(219, 234, 254, 0.72), transparent 28%),
    var(--maple-bg);
}
.admin-basic {
  flex: 1;
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
  overflow-y: scroll;
  background: transparent;
  scrollbar-gutter: stable;
}
.admin-content-shell {
  min-height: 100%;
  padding: 18px 22px 28px;
}
.admin-breadcrumb {
  margin-bottom: 16px;
  color: var(--maple-muted);
}
</style>
