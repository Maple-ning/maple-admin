<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../../stores/user";
import { useRouter } from "vue-router";
import loginBanner from "@assets/images/login_banner.png";

const useStore = useUserStore();
const router = useRouter();
const username = ref("");
const password = ref("");
const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    await useStore.login(username.value, password.value);
    router.push("/dashboard");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="image-wrapper">
      <img :src="loginBanner" alt="登录页图片" class="login-pictrue" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  height: 100%;
  padding: 40px 80px;
  background-color: #dce5f1;
  overflow: hidden;

  .image-wrapper {
    width: 1300px;
    height: 100%;
    border-radius: 40px;
    overflow: hidden;
  }

  .login-pictrue {
    width: 100%;
    height: 100%;
    object-fit: cover;
    // 减右下角：从右边 70% 处斜切到底边 80% 处
    clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 80% 100%, 0% 100%);
  }
}
</style>
