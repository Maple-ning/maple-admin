import type { Menu } from '@/types/menu'

interface PermissionContext {
  roles: string[]
  permissions: string[]
}

export function hasAccessPermission(menu: Menu, context: PermissionContext) {
  if (context.roles.includes('admin') || context.permissions.includes('*')) return true
  if (!menu.perms) return true
  return menu.perms.split(',').some((perm) => context.permissions.includes(perm.trim()))
}

export function filterMenusByPermission(menus: Menu[], context: PermissionContext): Menu[] {
  return menus.reduce<Menu[]>((result, menu) => {
    const children = menu.children ? filterMenusByPermission(menu.children, context) : []
    const hasChildren = Boolean(menu.children?.length)

    if (hasChildren && children.length === 0) return result
    if (!hasChildren && !hasAccessPermission(menu, context)) return result

    result.push({
      ...menu,
      children: children.length > 0 ? children : undefined,
    })

    return result
  }, [])
}

export function filterVisibleMenus(menus: Menu[]): Menu[] {
  return menus
    .filter((menu) => !menu.hidden)
    .map((menu) => ({
      ...menu,
      children: menu.children ? filterVisibleMenus(menu.children) : undefined,
    }))
}

export function isPathInMenu(menu: Menu, path: string): boolean {
  if (menu.path === path || path.startsWith(`${menu.path}/`)) return true
  return menu.children?.some((child) => isPathInMenu(child, path)) || false
}

export function getFirstAccessiblePath(menus: Menu[]): string {
  for (const menu of menus) {
    if (menu.hidden) continue
    if (menu.redirect) return menu.redirect
    if (menu.children?.length) {
      const childPath = getFirstAccessiblePath(menu.children)
      if (childPath) return childPath
    }
    if (menu.path) return menu.path
  }

  return ''
}
