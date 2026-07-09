export interface Menu {
  id: number
  parentId: number
  title: string
  path: string
  component: string
  icon?: string
  redirect?: string
  hidden?: boolean
  sort?: number
  perms?: string
  children?: Menu[]
}