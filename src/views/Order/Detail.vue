<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const goods = [
  { name: 'Maple Pro License', count: 1, price: 299 },
  { name: '权限模板包', count: 2, price: 99 },
]
</script>

<template>
  <div class="page">
    <a-card title="订单详情">
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="订单号">{{ route.query.id || 'SO20260710001' }}</a-descriptions-item>
        <a-descriptions-item label="状态"><a-tag color="blue">已支付</a-tag></a-descriptions-item>
        <a-descriptions-item label="下单用户">manager</a-descriptions-item>
        <a-descriptions-item label="支付金额">￥497</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="商品明细">
      <a-table :data-source="goods" :pagination="false" row-key="name">
        <a-table-column title="商品" data-index="name" />
        <a-table-column title="数量" data-index="count" />
        <a-table-column title="单价" data-index="price">
          <template #default="{ text }">￥{{ text }}</template>
        </a-table-column>
      </a-table>
    </a-card>

    <a-card title="订单时间线">
      <a-timeline>
        <a-timeline-item>创建订单</a-timeline-item>
        <a-timeline-item>完成支付</a-timeline-item>
        <a-timeline-item>等待发货</a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: grid;
  gap: 16px;
}
</style>
