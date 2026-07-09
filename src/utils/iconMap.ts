/**
 * @description 由于后端返回的 icon 是字符串（如 'DashboardOutlined'），我们需要在前端将其映射为实际的图标组件。
 */
import { DashboardOutlined, SettingOutlined, ShoppingOutlined, UserOutlined, AppstoreOutlined, TeamOutlined } from '@ant-design/icons-vue'
import type { Component } from 'vue'

// 图标映射表
const iconMap: Record<string, Component> = {
  DashboardOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
  AppstoreOutlined,
  TeamOutlined
  // 如果还有其他图标，在这里添加
}

/**
 * 根据图标名称返回对应的组件
 * @param iconName 图标名称（字符串）
 * @returns 图标组件或 undefined
 */
export function getIcon(iconName?: string): Component | undefined {
  if (!iconName) return undefined
  return iconMap[iconName]
}
