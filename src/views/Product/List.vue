<script setup lang="ts">
const products = [
  { id: 1, name: 'Maple Admin 基础版', category: '模板', price: 199, status: '上架' },
  { id: 2, name: '权限系统示例包', category: '模块', price: 99, status: '上架' },
  { id: 3, name: '日志审计组件', category: '模块', price: 129, status: '下架' },
]
</script>

<template>
  <a-card title="商品管理">
    <template #extra>
      <a-button type="primary">新增商品</a-button>
    </template>
    <a-table :data-source="products" row-key="id">
      <a-table-column title="商品名称" data-index="name" />
      <a-table-column title="分类" data-index="category" />
      <a-table-column title="价格" data-index="price">
        <template #default="{ text }">￥{{ text }}</template>
      </a-table-column>
      <a-table-column title="状态" data-index="status">
        <template #default="{ text }">
          <a-tag :color="text === '上架' ? 'green' : 'default'">{{ text }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="操作">
        <template #default>
          <a-space>
            <a-button type="link">编辑</a-button>
            <a-button type="link">上下架</a-button>
          </a-space>
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>
