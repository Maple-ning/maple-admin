<script setup lang="ts">
const services = [
  { name: 'JSON API 服务', status: '运行中', latency: '23ms' },
  { name: '权限守卫', status: '正常', latency: '4ms' },
  { name: '动态路由', status: '正常', latency: '8ms' },
]
</script>

<template>
  <div class="monitor-page">
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="8">
        <a-card><a-statistic title="在线用户" :value="28" suffix="人" /></a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card><a-statistic title="接口成功率" :value="99.7" suffix="%" /></a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card><a-statistic title="平均响应" :value="42" suffix="ms" /></a-card>
      </a-col>
    </a-row>

    <a-card title="服务状态">
      <a-table :data-source="services" :pagination="false" row-key="name">
        <a-table-column title="服务" data-index="name" />
        <a-table-column title="状态" data-index="status">
          <template #default="{ text }">
            <a-tag color="green">{{ text }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="延迟" data-index="latency" />
      </a-table>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
.monitor-page {
  display: grid;
  gap: 16px;
}
</style>
