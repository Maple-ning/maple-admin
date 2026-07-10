<script setup lang="ts">
const menus = [
  { id: 1, title: '仪表盘', path: '/dashboard', type: '目录', perms: '', hidden: false },
  { id: 2, title: '总览', path: '/dashboard/overview', type: '菜单', perms: 'dashboard:overview', hidden: false },
  { id: 4, title: '系统管理', path: '/system', type: '目录', perms: '', hidden: false },
  { id: 5, title: '用户管理', path: '/system/user', type: '菜单', perms: 'system:user:list', hidden: false },
  { id: 7, title: '用户详情', path: '/system/user/detail', type: '隐藏路由', perms: 'system:user:detail', hidden: true },
  { id: 16, title: '日志审计', path: '/log', type: '目录', perms: '', hidden: false },
]
</script>

<template>
  <a-card title="菜单管理">
    <template #extra>
      <a-button type="primary">新增菜单</a-button>
    </template>
    <a-table :data-source="menus" row-key="id">
      <a-table-column title="名称" data-index="title" />
      <a-table-column title="类型" data-index="type">
        <template #default="{ text }">
          <a-tag :color="text === '隐藏路由' ? 'orange' : 'blue'">{{ text }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="路径" data-index="path" />
      <a-table-column title="权限码" data-index="perms">
        <template #default="{ text }">
          <a-tag v-if="text">{{ text }}</a-tag>
          <span v-else class="muted">目录继承子权限</span>
        </template>
      </a-table-column>
      <a-table-column title="隐藏">
        <template #default="{ record }">
          <a-switch :checked="record.hidden" disabled />
        </template>
      </a-table-column>
      <a-table-column title="操作">
        <template #default>
          <a-space>
            <a-button type="link">新增子级</a-button>
            <a-button type="link">编辑</a-button>
            <a-button type="link" danger>删除</a-button>
          </a-space>
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>

<style lang="scss" scoped>
.muted {
  color: #98a2b3;
}
</style>
