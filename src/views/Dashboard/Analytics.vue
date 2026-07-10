<script setup lang="ts">
const trends = [
  { day: '周一', visits: 3200, orders: 86 },
  { day: '周二', visits: 4200, orders: 92 },
  { day: '周三', visits: 3900, orders: 74 },
  { day: '周四', visits: 5200, orders: 108 },
  { day: '周五', visits: 6100, orders: 126 },
]

const roleData = [
  { role: 'admin', count: 1 },
  { role: 'manager', count: 1 },
  { role: 'operator', count: 1 },
  { role: 'viewer', count: 1 },
]
</script>

<template>
  <div class="analytics-page">
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="16">
        <a-card title="访问与订单趋势">
          <a-table :data-source="trends" :pagination="false" row-key="day" size="middle">
            <a-table-column title="日期" data-index="day" />
            <a-table-column title="访问量" data-index="visits" />
            <a-table-column title="订单数" data-index="orders" />
          </a-table>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="角色分布">
          <a-list :data-source="roleData">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.role" :description="`${item.count} 个账号`" />
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="scss" scoped>
.analytics-page {
  display: grid;
  gap: 16px;
}
</style>
