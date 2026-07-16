import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getDepartmentList } from '@/api/system/department'
import type { Department } from '@/api/system/department'

export interface DepartmentOption {
  value: number
  label: string
  children?: DepartmentOption[]
}

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  const departmentMap = computed(() => new Map(departments.value.map((item) => [item.id, item])))
  const childrenMap = computed(() => {
    const map = new Map<number, Department[]>()
    departments.value.forEach((item) => {
      const children = map.get(item.parentId) || []
      children.push(item)
      map.set(item.parentId, children)
    })
    return map
  })

  const treeOptions = computed<DepartmentOption[]>(() => {
    const build = (parentId: number): DepartmentOption[] => (childrenMap.value.get(parentId) || []).map((item) => {
      const children = build(item.id)
      return { value: item.id, label: item.name, ...(children.length ? { children } : {}) }
    })
    return build(0)
  })

  async function loadDepartments(force = false) {
    if (loaded.value && !force) return departments.value
    if (loading.value) return departments.value
    loading.value = true
    try {
      departments.value = await getDepartmentList()
      loaded.value = true
      return departments.value
    } finally {
      loading.value = false
    }
  }

  function getName(id: number) {
    return departmentMap.value.get(id)?.name || '未知部门'
  }

  function getPath(id: number) {
    const names: string[] = []
    const visited = new Set<number>()
    let current = departmentMap.value.get(id)
    while (current && !visited.has(current.id)) {
      visited.add(current.id)
      names.unshift(current.name)
      current = departmentMap.value.get(current.parentId)
    }
    return names.length ? names.join(' / ') : '—'
  }

  function getIdPath(id: number) {
    const ids: number[] = []
    const visited = new Set<number>()
    let current = departmentMap.value.get(id)
    while (current && !visited.has(current.id)) {
      visited.add(current.id)
      ids.unshift(current.id)
      current = departmentMap.value.get(current.parentId)
    }
    return ids
  }

  function getDescendantIds(id: number) {
    const result: number[] = []
    const visit = (parentId: number) => {
      for (const child of childrenMap.value.get(parentId) || []) {
        result.push(child.id)
        visit(child.id)
      }
    }
    result.push(id)
    visit(id)
    return result
  }

  return { departments, loaded, loading, treeOptions, loadDepartments, getName, getPath, getIdPath, getDescendantIds }
})
