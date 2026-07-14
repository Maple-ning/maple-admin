import { get } from '@/utils/request'

export interface Department {
  id: number
  parentId: number
  name: string
}

/**
 * @description 获取部门列表接口
 */
export const getDepartmentList = (): Promise<Department[]> => {
  return get<Department[]>('/departments')
}
