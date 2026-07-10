<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = reactive({
  keyword: '',
  status: undefined as string | undefined,
})

const orders = [
  { id: 'SO20260710001', user: 'viewer', amount: 299, status: '已支付', createdAt: '2026-07-10 09:12' },
  { id: 'SO20260710002', user: 'operator', amount: 158, status: '待发货', createdAt: '2026-07-10 10:24' },
  { id: 'SO20260710003', user: 'manager', amount: 899, status: '已完成', createdAt: '2026-07-10 11:30' },
]
</script>

<template>
  <div class="page">
    <a-card>
      <a-form layout="inline" :model="query">
        <a-form-item label="订单号">
          <a-input v-model:value="query.keyword" placeholder="请输入订单号" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="query.status" placeholder="全部状态" allow-clear style="width: 140px">
            <a-select-option value="已支付">已支付</a-select-option>
            <a-select-option value="待发货">待发货</a-select-option>
            <a-select-option value="已完成">已完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item><a-button type="primary">查询</a-button></a-form-item>
        <a-form-item><a-button>导出</a-button></a-form-item>
      </a-form>
    </a-card>

    <a-card>
      <a-table :data-source="orders" row-key="id">
        <a-table-column title="订单号" data-index="id" />
        <a-table-column title="用户" data-index="user" />
        <a-table-column title="金额" data-index="amount">
          <template #default="{ text }">￥{{ text }}</template>
        </a-table-column>
        <a-table-column title="状态" data-index="status">
          <template #default="{ text }">
            <a-tag color="blue">{{ text }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createdAt" />
        <a-table-column title="操作">
          <template #default="{ record }">
            <a-button type="link" @click="router.push(`/business/order/detail?id=${record.id}`)">详情</a-button>
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
