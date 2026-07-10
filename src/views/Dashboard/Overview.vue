<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const stats = computed(() => [
  { title: '今日访问', value: 12860, suffix: '次' },
  { title: '活跃用户', value: 438, suffix: '人' },
  { title: '订单数量', value: 126, suffix: '单' },
  { title: '异常告警', value: 3, suffix: '条' },
])

const shortcuts = [
  { title: '用户管理', path: '/system/user', permission: 'system:user:list' },
  { title: '订单管理', path: '/business/order/list', permission: 'order:list' },
  { title: '商品管理', path: '/business/product/list', permission: 'product:list' },
  { title: '操作日志', path: '/log/operation', permission: 'log:operation' },
]

const activities = [
  'operator 更新了订单状态',
  'manager 查看了用户详情',
  'admin 调整了菜单权限',
  'viewer 访问了仪表盘总览',
]

function canAccess(permission: string) {
  return userStore.hasPermission(permission)
}
</script>

<template>
  <div class="dashboard-page">
    <a-card class="welcome-card">
      <a-space direction="vertical" :size="4">
        <span class="muted">欢迎回来</span>
        <h2>{{ userStore.nickname || userStore.username || '管理员' }}</h2>
        <span class="muted">当前角色：{{ userStore.roles.join(', ') || '暂无角色' }}，权限数量：{{ userStore.permissions.length }}</span>
      </a-space>
    </a-card>

    <a-row :gutter="[16, 16]">
      <a-col v-for="item in stats" :key="item.title" :xs="24" :sm="12" :lg="6">
        <a-card>
          <a-statistic :title="item.title" :value="item.value" :suffix="item.suffix" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="12">
        <a-card title="快捷入口">
          <a-space wrap>
            <a-button v-for="item in shortcuts" :key="item.path" :disabled="!canAccess(item.permission)" @click="router.push(item.path)">
              {{ item.title }}
            </a-button>
          </a-space>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="最近操作">
          <a-timeline>
            <a-timeline-item v-for="item in activities" :key="item">{{ item }}</a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  display: grid;
  gap: 16px;
}
.welcome-card {
  h2 {
    margin: 0;
  }
}
.muted {
  color: #667085;
}
</style>
