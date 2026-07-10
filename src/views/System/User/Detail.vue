<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const user = computed(() => ({
  id: route.query.id || 1,
  username: 'manager',
  nickname: '系统经理',
  roles: ['manager'],
  permissions: ['system:user:list', 'system:role:list', 'order:list', 'order:detail'],
  lastLogin: '2026-07-10 09:30:12',
}))
</script>

<template>
  <div class="page">
    <a-card title="用户详情">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="用户 ID">{{ user.id }}</a-descriptions-item>
        <a-descriptions-item label="用户名">{{ user.username }}</a-descriptions-item>
        <a-descriptions-item label="昵称">{{ user.nickname }}</a-descriptions-item>
        <a-descriptions-item label="最近登录">{{ user.lastLogin }}</a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-tag v-for="role in user.roles" :key="role" color="blue">{{ role }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="权限数量">{{ user.permissions.length }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="拥有权限">
      <a-space wrap>
        <a-tag v-for="permission in user.permissions" :key="permission">{{ permission }}</a-tag>
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
