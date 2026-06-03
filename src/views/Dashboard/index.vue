<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import {
  TeamOutlined,
  SafetyOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons-vue";

const userStore = useUserStore();
</script>

<template>
  <div class="dashboard">
    <a-page-header title="仪表盘" sub-title="欢迎回到枫叶后台管理系统" />

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable>
          <a-statistic title="用户角色" :value="userStore.roles.length">
            <template #prefix><TeamOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable>
          <a-statistic title="权限数量" :value="userStore.permissions.length">
            <template #prefix><SafetyOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable>
          <a-statistic title="当前用户" :value="userStore.username" :value-style="{ fontSize: '18px' }">
            <template #prefix><UserOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card hoverable>
          <a-statistic title="系统状态" value="运行中" :value-style="{ fontSize: '18px', color: '#52c41a' }">
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  :deep(.ant-statistic-title) {
    font-size: 13px;
    color: #999;
  }
}
</style>
