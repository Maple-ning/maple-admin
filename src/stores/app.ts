import { defineStore } from 'pinia'
import { ref } from 'vue'

const SIDEBAR_COLLAPSED_KEY = 'maple-admin-sidebar-collapsed'
const LG_BREAKPOINT_QUERY = '(max-width: 991.98px)'

function readStoredCollapsed() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
}

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(readStoredCollapsed())
  const isMobile = ref(false)
  const mobileSidebarOpen = ref(false)
  let mediaQueryList: MediaQueryList | null = null

  function setCollapsed(value: boolean) {
    collapsed.value = value
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
    }
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed.value)
  }

  function setMobile(value: boolean) {
    isMobile.value = value
    if (!value) {
      mobileSidebarOpen.value = false
    }
  }

  function setMobileSidebarOpen(value: boolean) {
    mobileSidebarOpen.value = value
  }

  function initResponsive() {
    if (typeof window === 'undefined' || mediaQueryList) return

    mediaQueryList = window.matchMedia(LG_BREAKPOINT_QUERY)
    setMobile(mediaQueryList.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMobile(event.matches)
    }

    mediaQueryList.addEventListener('change', handleChange)
  }

  return {
    collapsed,
    isMobile,
    mobileSidebarOpen,
    setCollapsed,
    toggleCollapsed,
    setMobile,
    setMobileSidebarOpen,
    initResponsive,
  }
})
