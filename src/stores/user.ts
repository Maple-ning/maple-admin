import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo as fetchUserInfo, logout as logoutApi } from '@/api/system/auth'
import type { LoginParams, LoginResult, UserInfo } from '@/types/system'
import { usePermissionStore } from './permission'


export const useUserStore = defineStore('user', () => {
  // ── state ──
  const token = ref<string>(localStorage.getItem('access_token') || '')
  const username = ref<string>('')
  const nickname = ref<string>('')
  const avatar = ref<string>('')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── getters ──
  const isLoggedIn = computed(() => !!token.value)

  // ── actions ──
  const loginAction = async (params: LoginParams): Promise<LoginResult> => {
    if (!params.username?.trim() || !params.password?.trim()) {
      const errorMsg = '用户名和密码不能为空'
      error.value = errorMsg
      return {
        success: false,
        message: errorMsg,
        code: 'VALIDATION_ERROR'
      }
    }

    // 防重复提交
    if (loading.value) {
      return {
        success: false,
        message: '登录请求正在进行中，请勿重复提交',
        code: 'REPEATED_REQUEST'
      }
    }

    try {
      loading.value = true
      error.value = null
      const response = await login({
        username: params.username.trim(),
        password: params.password
      })

      if (!response?.token) {
        throw new Error('登录响应数据异常')
      }

      const { token: accessToken, refreshToken, expiresIn, userInfo } = response

      token.value = accessToken
      localStorage.setItem('access_token', accessToken)

      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }

      if (userInfo) {
        setUserInfo(userInfo)
      }

      if (!userInfo) {
        const currentUserInfo = await fetchUserInfo()
        setUserInfo(currentUserInfo)
      }

      return {
        success: true,
        data: {
          token: accessToken,
          refreshToken,
          expiresIn,
          userInfo: userInfo || {
            id: 0,
            username: params.username,
            nickname: '',
            roles: [],
            permissions: []
          }
        },
        message: '登录成功'
      }
    } catch (err) {
      const errorMsg = handleLoginError(err)
      error.value = errorMsg

      let code = 'LOGIN_ERROR'
      if (err instanceof Error) {
        if (err.message.includes('401')) code = 'UNAUTHORIZED'
        else if (err.message.includes('403')) code = 'FORBIDDEN'
        else if (err.message.includes('429')) code = 'RATE_LIMIT'
      }

      return {
        success: false,
        message: errorMsg,
        code
      }
    } finally {
      loading.value = false
    }
  }

  const handleLoginError = (err: unknown): string => {
    if (err instanceof Error) {
      // HTTP状态码错误处理
      if (err.message.includes('401')) return '用户名或密码错误'
      if (err.message.includes('403')) return '账户已被锁定，请联系管理员'
      if (err.message.includes('429')) return '请求过于频繁，请稍后再试'
      return err.message || '登录失败，请稍后重试'
    }
    return '网络异常，请检查网络连接'
  }

  function setUserInfo(userInfo: UserInfo) {
    username.value = userInfo.username
    nickname.value = userInfo.nickname
    avatar.value = userInfo.avatar || ''
    roles.value = userInfo.roles || []
    permissions.value = userInfo.permissions || []
  }

  async function getUserInfo() {
    if (!token.value) {
      throw new Error('未登录')
    }

    const userInfo = await fetchUserInfo()
    setUserInfo(userInfo)
    return userInfo
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      resetState()
      const permissionStore = usePermissionStore()
      permissionStore.resetRoutes()
    }
  }

  function resetState() {
    token.value = ''
    username.value = ''
    nickname.value = ''
    avatar.value = ''
    roles.value = []
    permissions.value = []
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const hasRole = (role: string | string[]) => {
    const roleList = Array.isArray(role) ? role : [role]
    return roleList.some((r) => roles.value.includes(r))
  }

  const hasPermission = (permission: string | string[]) => {
    const permList = Array.isArray(permission) ? permission : [permission]
    if (roles.value.includes('admin')) return true
    return permList.some((p) => permissions.value.includes(p))
  }

  return {
    token,
    username,
    nickname,
    avatar,
    roles,
    permissions,
    isLoggedIn,
    loginAction,
    getUserInfo,
    logout,
    resetState,
    hasRole,
    hasPermission
  }
})
