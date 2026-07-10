<script setup lang="ts">
import { reactive, ref } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { useAuth } from "@/hooks/useAuth";
import loginBanner from "../../assets/images/login_banner.png";

const { loading, error, login } = useAuth();

const formRef = ref();
const form = reactive({
  username: "",
  password: "",
  remember: false,
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
};

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  await login(form.username, form.password);
}
</script>

<template>
  <div class="login-container">
    <!-- 左侧品牌图 -->
    <div class="login-banner">
      <div class="banner-mask" />
      <img :src="loginBanner" alt="banner" class="banner-img" />
      <div class="banner-content">
        <h1 class="banner-title">Maple-Admin</h1>
        <p class="banner-desc">高效 · 智能 · 安全</p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-form-wrapper">
      <div class="login-card">
        <h2 class="login-title">欢迎登录</h2>

        <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          layout="vertical"
          size="large"
          @finish="handleSubmit"
        >
          <a-form-item name="username">
            <a-input
              v-model:value="form.username"
              placeholder="请输入用户名"
              autocomplete="username"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password">
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入密码"
              autocomplete="current-password"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <div class="form-footer">
              <a-checkbox v-model:checked="form.remember">记住密码</a-checkbox>
              <a class="forgot-link">忘记密码？</a>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              block
              size="large"
              class="login-btn"
            >
              登 录
            </a-button>
          </a-form-item>
        </a-form>

        <transition name="fade">
          <a-alert
            v-if="error"
            :message="error"
            type="error"
            show-icon
            closable
            class="login-error"
            @close="error = ''"
          />
        </transition>
      </div>

      <p class="login-copyright">
        Copyright &copy; {{ new Date().getFullYear() }} Maple Admin. All Rights Reserved.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(187, 247, 208, 0.52), transparent 32%),
    radial-gradient(circle at 80% 0%, rgba(186, 230, 253, 0.58), transparent 28%),
    #f6fbfa;
}

// ── 左侧品牌区 ──
.login-banner {
  position: relative;
  flex: 0 0 55%;
  overflow: hidden;

  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(14, 165, 163, 0.58) 0%, rgba(56, 189, 248, 0.46) 100%);
    z-index: 1;
  }

  .banner-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    text-align: center;
    color: #fff;
  }

  .banner-title {
    font-size: 42px;
    font-weight: 700;
    letter-spacing: 6px;
    margin: 0 0 16px;
    text-shadow: 0 2px 14px rgba(15, 118, 110, 0.24);
  }

  .banner-desc {
    font-size: 18px;
    letter-spacing: 8px;
    opacity: 0.85;
    margin: 0;
  }
}

// ── 右侧表单区 ──
.login-form-wrapper {
  flex: 0 0 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.42);
  padding: 40px;
  backdrop-filter: blur(12px);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(97, 151, 162, 0.16);
  border-radius: 10px;
  padding: 48px 40px 32px;
  box-shadow: 0 20px 50px rgba(31, 102, 117, 0.12);
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #243447;
  margin-bottom: 40px;
  text-align: center;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-link {
  color: #0ea5a3;
  cursor: pointer;
}

.login-btn {
  height: 46px;
  font-size: 16px;
  letter-spacing: 4px;
  border-radius: 8px;
  background: linear-gradient(135deg, #38bdf8, #34d399);
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(52, 211, 153, 0.24);

  &:hover {
    background: linear-gradient(135deg, #0ea5e9, #10b981);
    border-color: transparent;
  }
}

.login-error {
  margin-top: 8px;
}

.login-copyright {
  margin-top: 24px;
  font-size: 12px;
  color: #8aa0ad;
  text-align: center;
}

// ── 过渡动画 ──
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// ── 响应式 ──
@media (max-width: 992px) {
  .login-banner {
    display: none;
  }
  .login-form-wrapper {
    flex: 1 1 100%;
  }
}
</style>
