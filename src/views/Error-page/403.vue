<script setup lang="ts"></script>

<template>
  <div class="error-page">
    <a-result status="403" title="403" sub-title="暂无可访问菜单，请联系管理员开通权限">
      <template #extra>
        <router-link to="/login">
          <a-button type="primary">返回登录</a-button>
        </router-link>
      </template>
    </a-result>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
