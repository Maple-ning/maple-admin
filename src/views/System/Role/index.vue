<script setup lang="ts">
const roles = [
  { key: 'admin', name: '超级管理员', users: 1, status: '启用', permissions: ['*'] },
  { key: 'manager', name: '系统经理', users: 1, status: '启用', permissions: ['system:user:list', 'system:role:list', 'order:list'] },
  { key: 'operator', name: '运营人员', users: 1, status: '启用', permissions: ['dashboard:analytics', 'order:list'] },
  { key: 'viewer', name: '只读用户', users: 1, status: '启用', permissions: ['dashboard:overview'] },
]
</script>

<template>
  <a-card title="角色管理">
    <a-table :data-source="roles" row-key="key">
      <a-table-column title="角色标识" data-index="key" />
      <a-table-column title="角色名称" data-index="name" />
      <a-table-column title="用户数" data-index="users" />
      <a-table-column title="状态" data-index="status">
        <template #default="{ text }">
          <a-tag color="green">{{ text }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="权限示例">
        <template #default="{ record }">
          <a-space wrap>
            <a-tag v-for="permission in record.permissions" :key="permission">{{ permission }}</a-tag>
          </a-space>
        </template>
      </a-table-column>
      <a-table-column title="操作">
        <template #default>
          <a-space>
            <a-button type="link">分配权限</a-button>
            <a-button type="link">编辑</a-button>
          </a-space>
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>
