<script setup lang="ts">
const logs = [
  { id: 1, user: 'admin', module: '菜单管理', action: '更新权限码', ip: '127.0.0.1', result: '成功', time: '2026-07-10 09:12:11' },
  { id: 2, user: 'manager', module: '用户管理', action: '查看详情', ip: '127.0.0.1', result: '成功', time: '2026-07-10 09:36:28' },
  { id: 3, user: 'operator', module: '订单管理', action: '导出订单', ip: '127.0.0.1', result: '成功', time: '2026-07-10 10:02:43' },
]
</script>

<template>
  <a-card title="操作日志">
    <a-table :data-source="logs" row-key="id">
      <a-table-column title="操作人" data-index="user" />
      <a-table-column title="模块" data-index="module" />
      <a-table-column title="操作" data-index="action" />
      <a-table-column title="IP" data-index="ip" />
      <a-table-column title="结果" data-index="result">
        <template #default="{ text }">
          <a-tag color="green">{{ text }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="时间" data-index="time" />
    </a-table>
  </a-card>
</template>
