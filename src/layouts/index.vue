<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/stores/user";
import logoUrl from "../assets/icons/vue.svg";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const { logout } = useAuth();
const userStore = useUserStore();

const selectedKeys = ref<string[]>([router.currentRoute.value.path]);
const collapsed = ref(false);

function handleMenuClick({ key }: { key: string }) {
  router.push(key);
}

function handleLogout() {
  logout();
}
</script>

<template>
  <a-layout class="admin-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      theme="dark"
      breakpoint="lg"
      class="admin-sider"
    >
      <div class="logo">
        <img :src="logoUrl" alt="logo" class="logo-img" />
        <span v-show="!collapsed" class="logo-text">枫叶后台</span>
      </div>
      <a-menu
        theme="dark"
        mode="inline"
        :selected-keys="selectedKeys"
        @click="handleMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon><DashboardOutlined /></template>
          <span>仪表盘</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 右侧区域 -->
    <a-layout>
      <a-layout-header class="admin-header">
        <div class="header-left">
          <component
            :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
            class="trigger"
            @click="collapsed = !collapsed"
          />
        </div>
        <div class="header-right">
          <a-dropdown>
            <a-space class="user-info">
              <a-avatar :size="32">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="username">{{ userStore.username || "管理员" }}</span>
            </a-space>
            <template #overlay>
              <a-menu @click="handleLogout">
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  <span style="margin-left: 8px">退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="admin-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
}

.admin-sider {
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    gap: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo-img {
      width: 28px;
      height: 28px;
    }

    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }
  }
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .trigger {
    font-size: 18px;
    cursor: pointer;
    color: #333;

    &:hover {
      color: #165df5;
    }
  }

  .user-info {
    cursor: pointer;

    .username {
      color: #333;
      font-size: 14px;
    }
  }
}

.admin-content {
  margin: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  overflow-y: auto;
}
</style>
