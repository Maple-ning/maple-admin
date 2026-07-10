<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usePermission } from '@/hooks/usePermission'

const router = useRouter()
const { hasPermission } = usePermission()

const query = reactive({
  keyword: '',
  role: undefined as string | undefined,
})

const users = [
  { id: 1, username: 'admin', nickname: '超级管理员', roles: ['admin'], status: '启用', createdAt: '2024-01-01' },
  { id: 2, username: 'viewer', nickname: '只读用户', roles: ['viewer'], status: '启用', createdAt: '2024-01-02' },
  { id: 3, username: 'operator', nickname: '运营人员', roles: ['operator'], status: '启用', createdAt: '2024-01-03' },
  { id: 4, username: 'manager', nickname: '系统经理', roles: ['manager'], status: '启用', createdAt: '2024-01-04' },
]

const filteredUsers = computed(() => {
  return users.filter((user) => {
    const matchKeyword = !query.keyword || user.username.includes(query.keyword) || user.nickname.includes(query.keyword)
    const matchRole = !query.role || user.roles.includes(query.role)
    return matchKeyword && matchRole
  })
})
</script>

<template>
  <div class="page">
    <a-card>
      <a-form layout="inline" :model="query">
        <a-form-item label="关键词">
          <a-input v-model:value="query.keyword" placeholder="用户名 / 昵称" allow-clear />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="query.role" placeholder="全部角色" allow-clear style="width: 160px">
            <a-select-option value="admin">admin</a-select-option>
            <a-select-option value="manager">manager</a-select-option>
            <a-select-option value="operator">operator</a-select-option>
            <a-select-option value="viewer">viewer</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button :disabled="!hasPermission('system:user:create')">新增用户</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card>
      <a-table :data-source="filteredUsers" row-key="id">
        <a-table-column title="用户名" data-index="username" />
        <a-table-column title="昵称" data-index="nickname" />
        <a-table-column title="角色">
          <template #default="{ record }">
            <a-space>
              <a-tag v-for="role in record.roles" :key="role" color="blue">{{ role }}</a-tag>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status">
          <template #default="{ text }">
            <a-tag color="green">{{ text }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createdAt" />
        <a-table-column title="操作">
          <template #default="{ record }">
            <a-space>
              <a-button type="link" @click="router.push(`/system/user/detail?id=${record.id}`)">详情</a-button>
              <a-button type="link" :disabled="!hasPermission('system:user:update')">编辑</a-button>
              <a-button type="link" danger :disabled="!hasPermission('system:user:delete')">删除</a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: grid;
  gap: 16px;
}
</style>
