<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { createMenu, deleteMenu, getMenuList, updateMenu } from '@/api/system/menu'
import type { MenuType, SystemMenu } from '@/api/system/menu'
import * as Icons from '@ant-design/icons-vue'
import type { Component } from 'vue'
import MenuDialog from './components/menuDialog.vue'

type MenuRecord = SystemMenu

const { AppstoreOutlined, ApartmentOutlined, BarsOutlined, DashboardOutlined, DeleteOutlined, EditOutlined, FileSearchOutlined, HolderOutlined, KeyOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined, SafetyCertificateOutlined, SettingOutlined, ShoppingCartOutlined, TeamOutlined, UserOutlined } = Icons
const rows = reactive<MenuRecord[]>([])
async function loadMenus() {
  try {
    rows.splice(0, rows.length, ...(await getMenuList()))
  } catch {
    message.error('菜单数据加载失败，请确认本地接口已启动')
  }
}
onMounted(loadMenus)

const iconMap: Record<string, Component> = { AppstoreOutlined, ApartmentOutlined, BarsOutlined, DashboardOutlined, DeleteOutlined, EditOutlined, FileSearchOutlined, KeyOutlined, PlusOutlined, SafetyCertificateOutlined, SettingOutlined, ShoppingCartOutlined, TeamOutlined, UserOutlined }

const typeMeta = { dir: { label: '目录', color: 'blue' }, menu: { label: '菜单', color: 'cyan' }, btn: { label: '按钮', color: 'orange' } } as const
const getTypeMeta = (type: MenuType) => typeMeta[type]
const expandedKeys = ref<number[]>(rows.map((item) => item.id))
const dragId = ref<number | null>(null)
const dropTarget = ref<{ id: number; mode: 'before' | 'inside' | 'after' } | null>(null)

const treeData = computed(() => {
  const map = new Map<number, MenuRecord>()
  rows.forEach((item) => map.set(item.id, { ...item, children: [] }))
  const roots: MenuRecord[] = []
  map.forEach((item) => (item.parentId === 0 ? roots : map.get(item.parentId)?.children)?.push(item))
  const normalizeTree = (list: MenuRecord[]) => {
    list.sort((a, b) => a.orderNum - b.orderNum)
    list.forEach((item) => {
      if (item.children?.length) normalizeTree(item.children)
      else delete item.children
    })
  }
  normalizeTree(roots)
  return roots
})
const findItem = (id: number | null) => rows.find((item) => item.id === id)
function isDescendant(parentId: number | null, id: number) {
  if (!parentId) return false
  let node = findItem(id)
  while (node && node.parentId) {
    if (node.parentId === parentId) return true
    node = findItem(node.parentId)
  }
  return false
}

function normalize(parentId: number) {
  rows
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.orderNum - b.orderNum)
    .forEach((item, i) => (item.orderNum = i + 1))
}

// 新增/修改菜单弹窗 --> start
const modalVisible = ref(false)
const submitLoading = ref(false)
const editingMenu = ref<MenuRecord | null>(null)
const defaultParentId = ref(0)

const openCreate = (parentId = 0) => {
  editingMenu.value = null
  defaultParentId.value = parentId
  modalVisible.value = true
}

const openEdit = (item: MenuRecord) => {
  editingMenu.value = item
  defaultParentId.value = item.parentId
  modalVisible.value = true
}

async function handleDialogSubmit(data: Omit<MenuRecord, 'id' | 'createTime' | 'children'>) {
  submitLoading.value = true
  try {
    if (editingMenu.value) {
      const previousParentId = editingMenu.value.parentId
      Object.assign(editingMenu.value, await updateMenu(editingMenu.value.id, data))
      normalize(previousParentId)
      normalize(data.parentId)
      message.success('菜单编辑成功')
    } else {
      rows.push(await createMenu({ ...data, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) }))
      normalize(data.parentId)
      message.success('菜单新增成功')
    }
    modalVisible.value = false
  } finally {
    submitLoading.value = false
  }
}
// 新增/修改菜单弹窗 --> end

function descendants(id: number): number[] {
  return rows.filter((item) => item.parentId === id).flatMap((item) => [item.id, ...descendants(item.id)])
}
function remove(item: MenuRecord) {
  const children = descendants(item.id)
  Modal.confirm({
    title: '确认删除菜单？',
    content: children.length ? `该菜单下有 ${children.length} 个子菜单，删除将一并移除。` : `删除后无法恢复“${item.name}”。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      const ids = new Set([item.id, ...children])
      for (const id of ids) await deleteMenu(id)
      for (let i = rows.length - 1; i >= 0; i--) if (ids.has(rows[i].id)) rows.splice(i, 1)
      normalize(item.parentId)
      message.success('菜单删除成功')
    }
  })
}
function toggleAll() {
  const parentIds = rows.filter((item) => rows.some((child) => child.parentId === item.id)).map((item) => item.id)
  expandedKeys.value = expandedKeys.value.length ? [] : parentIds
}
function customRow(record: MenuRecord) {
  return {
    draggable: true,
    onDragstart: (event: DragEvent) => {
      dragId.value = record.id
      event.dataTransfer?.setData('text/plain', String(record.id))
    },
    onDragover: (event: DragEvent) => {
      event.preventDefault()
      const el = event.currentTarget as HTMLElement
      const ratio = (event.clientY - el.getBoundingClientRect().top) / el.offsetHeight
      dropTarget.value = { id: record.id, mode: ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside' }
    },
    onDragleave: () => {
      if (dropTarget.value?.id === record.id) dropTarget.value = null
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      handleDrop(record)
    },
    onDragend: () => {
      dragId.value = null
      dropTarget.value = null
    },
    class: [dragId.value === record.id && 'is-dragging', dropTarget.value?.id === record.id && `drop-${dropTarget.value.mode}`].filter(Boolean).join(' ')
  }
}
function handleDrop(target: MenuRecord) {
  const source = findItem(dragId.value),
    mode = dropTarget.value?.mode
  if (!source || !mode || source.id === target.id || isDescendant(source.id, target.id)) return message.warning('不能移动到自身或子菜单中')
  const oldParent = source.parentId
  if (mode === 'inside') {
    if (target.type === 'btn') return message.warning('按钮不能作为父级菜单')
    source.parentId = target.id
    source.orderNum = rows.filter((item) => item.parentId === target.id).length + 1
    expandedKeys.value = [...new Set([...expandedKeys.value, target.id])]
  } else {
    source.parentId = target.parentId
    const siblings = rows.filter((item) => item.parentId === target.parentId && item.id !== source.id).sort((a, b) => a.orderNum - b.orderNum)
    siblings.splice(siblings.findIndex((item) => item.id === target.id) + (mode === 'after' ? 1 : 0), 0, source)
    siblings.forEach((item, i) => (item.orderNum = i + 1))
  }
  normalize(oldParent)
  normalize(source.parentId)
  const changedItems = rows.filter((item) => item.parentId === oldParent || item.parentId === source.parentId)
  changedItems.reduce((task, item) => task.then(() => updateMenu(item.id, { parentId: item.parentId, orderNum: item.orderNum })).then(() => undefined), Promise.resolve()).catch(() => message.error('菜单顺序保存失败'))
  dropTarget.value = null
  message.success('菜单顺序已更新')
}
async function updateMenuStatus(item: MenuRecord, status: boolean) {
  const source = findItem(item.id)
  if (!source) return
  const previousStatus = source.status
  source.status = status
  try {
    Object.assign(source, await updateMenu(source.id, { status }))
    message.success('状态更新成功')
  } catch {
    source.status = previousStatus
  }
}
function handleStatusChange(item: MenuRecord, checked: boolean | string | number) {
  return updateMenuStatus(item, Boolean(checked))
}
</script>

<template>
  <section class="page">
    <div class="page-search">
      <a-space wrap>
        <a-button type="primary" @click="openCreate()">
          <PlusOutlined />
          新增菜单
        </a-button>
        <a-button @click="toggleAll">
          <MenuFoldOutlined v-if="expandedKeys.length" />
          <MenuUnfoldOutlined v-else />
          {{ expandedKeys.length ? '折叠全部' : '展开全部' }}
        </a-button>
      </a-space>
      <div class="drag-tip">
        <HolderOutlined />
        拖拽行可调整层级与顺序
      </div>
    </div>
    <div class="page-body">
      <div class="page-table">
        <a-table v-model:expanded-row-keys="expandedKeys" class="menu-table" :data-source="treeData" :pagination="false" :custom-row="customRow" row-key="id" :scroll="{ x: 1180, y: '100%' }">
          <a-table-column title="菜单名称" :width="250">
            <template #default="{ record }">
              <span class="menu-name">
                <HolderOutlined class="drag-handle" />
                <component :is="iconMap[record.icon] || BarsOutlined" class="menu-icon" />
                <strong>{{ record.name }}</strong>
              </span>
            </template>
          </a-table-column>
          <a-table-column title="菜单类型" :width="90">
            <template #default="{ record }">
              <a-tag :color="getTypeMeta(record.type).color">{{ getTypeMeta(record.type).label }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="权限标识" data-index="permission" :width="190">
            <template #default="{ text }">
              <code v-if="text">{{ text }}</code>
              <span v-else class="empty">—</span>
            </template>
          </a-table-column>
          <a-table-column title="组件路径" data-index="component" :width="250">
            <template #default="{ text }">
              <span :class="text ? 'path' : 'empty'">{{ text || '—' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="orderNum" :width="70" align="center" />
          <a-table-column title="状态" :width="100" align="center">
            <template #default="{ record }"><a-switch :checked="record.status" checked-children="启用" un-checked-children="禁用" @change="handleStatusChange(record, $event)" /></template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right" align="center">
            <template #default="{ record }">
              <a-button type="link" size="small" @click="openEdit(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button type="link" size="small" danger @click="remove(record)">
                <DeleteOutlined />
                删除
              </a-button>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </div>
    <MenuDialog
      v-model:open="modalVisible"
      :menus="rows"
      :editing-menu="editingMenu"
      :default-parent-id="defaultParentId"
      :confirm-loading="submitLoading"
      @submit="handleDialogSubmit"
    />
  </section>
</template>

<style lang="scss" scoped>
.drag-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #93a0a9;
  font-size: 12px;
}
.page-search {
  display: flex;
  justify-content: space-between;
}
.menu-name {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 9px;
  strong {
    overflow: hidden;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.drag-handle {
  color: #b4c0c6;
  cursor: grab;
}
.menu-icon {
  color: #008f80;
  font-size: 15px;
}
code {
  padding: 3px 7px;
  color: #536672;
  font-size: 11px;
  background: #f2f6f6;
  border-radius: 5px;
}
.path {
  color: #657682;
  font-size: 12px;
}
.empty {
  color: #b3bec4;
}
.menu-table :deep(.is-dragging > td) {
  opacity: 0.45;
}
.menu-table :deep(.drop-inside > td) {
  background: #e8f7f4 !important;
}
.menu-table :deep(.drop-before > td) {
  box-shadow: inset 0 2px #00a891;
}
.menu-table :deep(.drop-after > td) {
  box-shadow: inset 0 -2px #00a891;
}

@media (max-width: 720px) {
  .page-search {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .drag-tip {
    display: none;
  }
}
</style>
