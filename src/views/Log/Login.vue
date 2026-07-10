<script setup lang="ts">
const logs = [
  { id: 1, username: 'admin', ip: '127.0.0.1', browser: 'Chrome', status: '成功', time: '2026-07-10 08:55:01' },
  { id: 2, username: 'viewer', ip: '127.0.0.1', browser: 'Edge', status: '成功', time: '2026-07-10 09:04:18' },
  { id: 3, username: 'unknown', ip: '127.0.0.1', browser: 'Chrome', status: '失败', time: '2026-07-10 09:20:34' },
]
</script>

<template>
  <a-card title="登录日志">
    <a-table :data-source="logs" row-key="id">
      <a-table-column title="用户名" data-index="username" />
      <a-table-column title="IP" data-index="ip" />
      <a-table-column title="浏览器" data-index="browser" />
      <a-table-column title="状态" data-index="status">
        <template #default="{ text }">
          <a-tag :color="text === '成功' ? 'green' : 'red'">{{ text }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="时间" data-index="time" />
    </a-table>
  </a-card>
</template>
