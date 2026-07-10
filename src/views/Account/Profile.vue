<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div class="page">
    <a-card title="个人资料">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="用户名">{{ userStore.username }}</a-descriptions-item>
        <a-descriptions-item label="昵称">{{ userStore.nickname }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ userStore.roles.join(', ') }}</a-descriptions-item>
        <a-descriptions-item label="权限数量">{{ userStore.permissions.length }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="权限清单">
      <a-space wrap>
        <a-tag v-for="permission in userStore.permissions" :key="permission">{{ permission }}</a-tag>
      </a-space>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: grid;
  gap: 16px;
}
</style>
