<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { MenuType, SystemMenu } from '@/api/system/menu'
import * as Icons from '@ant-design/icons-vue'
import type { Component } from 'vue'
import type { FormInstance, FormProps } from 'ant-design-vue'

type MenuFormData = Pick<SystemMenu, 'parentId' | 'name' | 'type' | 'path' | 'component' | 'permission' | 'icon' | 'orderNum' | 'status'>

const props = withDefaults(defineProps<{
  menus: SystemMenu[]
  editingMenu?: SystemMenu | null
  defaultParentId?: number
  confirmLoading?: boolean
}>(), {
  editingMenu: null,
  defaultParentId: 0,
  confirmLoading: false,
})

const emit = defineEmits<{
  submit: [data: MenuFormData]
}>()

const open = defineModel<boolean>('open', { default: false })
const formRef = ref<FormInstance>()
const isEdit = computed(() => Boolean(props.editingMenu))
const dialogTitle = computed(() => isEdit.value ? '编辑菜单' : '新增菜单')

const { AppstoreOutlined, ApartmentOutlined, BarsOutlined, DashboardOutlined, DeleteOutlined, EditOutlined, FileSearchOutlined, KeyOutlined, PlusOutlined, SafetyCertificateOutlined, SettingOutlined, ShoppingCartOutlined, TeamOutlined, UserOutlined } = Icons
const iconMap: Record<string, Component> = { AppstoreOutlined, ApartmentOutlined, BarsOutlined, DashboardOutlined, DeleteOutlined, EditOutlined, FileSearchOutlined, KeyOutlined, PlusOutlined, SafetyCertificateOutlined, SettingOutlined, ShoppingCartOutlined, TeamOutlined, UserOutlined }
const iconOptions = Object.keys(iconMap).map((value) => ({ value, label: value.replace('Outlined', '') }))

const form = reactive<MenuFormData>(createInitialForm())

function createInitialForm(): MenuFormData {
  return { parentId: props.defaultParentId, name: '', type: 'menu', path: '', component: '', permission: '', icon: 'BarsOutlined', orderNum: siblingCount(props.defaultParentId) + 1, status: true }
}

function siblingCount(parentId: number) {
  return props.menus.filter((item) => item.parentId === parentId).length
}

function isDescendant(parentId: number, id: number) {
  let node = props.menus.find((item) => item.id === id)
  while (node && node.parentId !== 0) {
    if (node.parentId === parentId) return true
    node = props.menus.find((item) => item.id === node?.parentId)
  }
  return false
}

const cascaderOptions = computed(() => {
  const map = new Map(props.menus.map((item) => [item.id, { value: item.id, label: item.name, disabled: item.type === 'btn' || item.id === props.editingMenu?.id || Boolean(props.editingMenu && isDescendant(props.editingMenu.id, item.id)), children: [] as Array<Record<string, unknown>> }]))
  const roots: Array<Record<string, unknown>> = []
  props.menus.forEach((item) => (item.parentId === 0 ? roots : map.get(item.parentId)?.children)?.push(map.get(item.id)!))
  return [{ value: 0, label: '顶级菜单' }, ...roots]
})

const rules: FormProps['rules'] = {
  parentId: [{ required: true, message: '请选择父级菜单' }],
  type: [{ required: true, message: '请选择菜单类型' }],
  name: [{ required: true, whitespace: true, message: '请输入菜单名称' }, { max: 30, message: '菜单名称最多 30 个字符' }],
  path: [{ validator: async () => { if (form.type !== 'btn' && !form.path.trim()) throw new Error('请输入路由地址') } }],
  orderNum: [{ required: true, message: '请输入排序号' }],
}

watch(open, (visible) => {
  if (!visible) return
  Object.assign(form, props.editingMenu ? {
    parentId: props.editingMenu.parentId,
    name: props.editingMenu.name,
    type: props.editingMenu.type,
    path: props.editingMenu.path,
    component: props.editingMenu.component,
    permission: props.editingMenu.permission,
    icon: props.editingMenu.icon,
    orderNum: props.editingMenu.orderNum,
    status: props.editingMenu.status,
  } : createInitialForm())
  formRef.value?.clearValidate()
}, { flush: 'post' })

watch(() => form.type, (type: MenuType) => {
  if (type === 'btn') {
    form.path = ''
    form.component = ''
    formRef.value?.clearValidate(['path'])
  }
})

async function handleSubmit() {
  await formRef.value?.validate()
  emit('submit', { ...form })
}

function handleAfterClose() {
  formRef.value?.resetFields()
}
</script>

<template>
  <a-modal v-model:open="open" :title="dialogTitle" width="680px" ok-text="保存" cancel-text="取消" :confirm-loading="confirmLoading" :mask-closable="false" @ok="handleSubmit" @after-close="handleAfterClose">
    <a-form ref="formRef" class="menu-form" :model="form" :rules="rules" layout="vertical">
      <div class="form-grid">
        <a-form-item label="父级菜单" name="parentId"><a-cascader v-model:value="form.parentId" :options="cascaderOptions" change-on-select placeholder="请选择父级菜单" /></a-form-item>
        <a-form-item label="菜单类型" name="type">
          <a-radio-group v-model:value="form.type" button-style="solid">
            <a-radio-button value="dir">目录</a-radio-button>
            <a-radio-button value="menu">菜单</a-radio-button>
            <a-radio-button value="btn">按钮</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </div>
      <div class="form-grid">
        <a-form-item label="菜单名称" name="name"><a-input v-model:value="form.name" :maxlength="30" show-count placeholder="请输入菜单名称" /></a-form-item>
        <a-form-item label="权限标识" name="permission"><a-input v-model:value="form.permission" placeholder="例如 agent:list" /></a-form-item>
      </div>
      <div v-if="form.type !== 'btn'" class="form-grid">
        <a-form-item label="路由地址" name="path"><a-input v-model:value="form.path" placeholder="例如 /system/menu" /></a-form-item>
        <a-form-item label="组件路径" name="component"><a-input v-model:value="form.component" placeholder="例如 @/views/System/Menu/index.vue" /></a-form-item>
      </div>
      <div class="form-grid">
          <a-form-item label="菜单图标" name="icon">
          <a-select v-model:value="form.icon" :options="iconOptions" show-search>
            <template #option="option">
              <component :is="iconMap[String(option.value)]" />
              <span class="icon-label">{{ option.label }}</span>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="排序号" name="orderNum"><a-input-number v-model:value="form.orderNum" :min="1" :max="999" style="width: 100%" /></a-form-item>
      </div>
      <a-form-item label="状态" name="status"><a-switch v-model:checked="form.status" checked-children="启用" un-checked-children="禁用" /></a-form-item>
    </a-form>
  </a-modal>
</template>

<style lang="scss" scoped>
.menu-form {
  padding-top: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.icon-label {
  margin-left: 8px;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
