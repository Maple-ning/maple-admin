<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const tests = [
  { label: '用户列表权限', permission: 'system:user:list' },
  { label: '角色管理权限', permission: 'system:role:list' },
  { label: '订单列表权限', permission: 'order:list' },
  { label: '操作日志权限', permission: 'log:operation' },
]
</script>

<template>
  <div class="page">
    <a-card title="当前用户权限">
      <a-descriptions bordered>
        <a-descriptions-item label="用户名">{{ userStore.username }}</a-descriptions-item>
        <a-descriptions-item label="昵称">{{ userStore.nickname }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ userStore.roles.join(', ') }}</a-descriptions-item>
        <a-descriptions-item label="权限数量">{{ userStore.permissions.length }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="按钮权限验证">
      <a-space wrap>
        <a-button v-for="item in tests" :key="item.permission" :disabled="!userStore.hasPermission(item.permission)">
          {{ item.label }}
        </a-button>
      </a-space>
    </a-card>

    <a-card title="权限码">
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
