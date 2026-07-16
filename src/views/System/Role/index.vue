<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { assignRolePermissions, createRole, deleteRole, getRoleList, updateRole } from '@/api/system/role'
import { getMenuList } from '@/api/system/menu'
import type { DataScope, SystemRole } from '@/api/system/role'
import type { SystemMenu } from '@/api/system/menu'
import { DeleteOutlined, DownOutlined, EditOutlined, KeyOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons-vue'
import RoleDialog from './components/RoleDialog.vue'
import RolePermissionDialog from './components/RolePermissionDialog.vue'
import type { RoleFormData } from './components/RoleDialog.vue'

type Role = SystemRole
type MenuRow = SystemMenu

const menuList = reactive<MenuRow[]>([])
const roleList = reactive<Role[]>([])
async function loadRoles() {
  try {
    const [roles, loadedMenus] = await Promise.all([getRoleList(), getMenuList()])
    roleList.splice(0, roleList.length, ...roles)
    menuList.splice(0, menuList.length, ...loadedMenus)
  } catch {
    message.error('角色数据加载失败，请确认本地接口已启动')
  }
}
onMounted(loadRoles)

const scopeMap: Record<DataScope, { label: string; color: string }> = { ALL: { label: '全部数据', color: 'purple' }, DEPT_AND_CHILD: { label: '本部门及以下', color: 'blue' }, DEPT: { label: '仅本部门', color: 'cyan' }, SELF: { label: '仅本人', color: 'default' }, CUSTOM: { label: '自定义', color: 'orange' } }
const getScopeMeta = (scope: DataScope) => scopeMap[scope]
const sortById = (a: Role, b: Role) => a.id - b.id
const sortByCreateTime = (a: Role, b: Role) => a.createTime.localeCompare(b.createTime)
const filters = reactive({ roleName: '', status: undefined as boolean | undefined })
const applied = reactive({ roleName: '', status: undefined as boolean | undefined })
const tableData = computed(() => roleList.filter((role) => (!applied.roleName || role.roleName.includes(applied.roleName)) && (applied.status === undefined || role.status === applied.status)))
const page = reactive({ current: 1, size: 10 })
const pagedRoles = computed(() => tableData.value.slice((page.current - 1) * page.size, page.current * page.size))
const dialogOpen = ref(false),
  permissionOpen = ref(false),
  submitting = ref(false)
const editingRole = ref<Role | null>(null),
  permissionRole = ref<Role | null>(null)
function search() {
  Object.assign(applied, filters)
  page.current = 1
  message.success('查询完成')
}
function reset() {
  Object.assign(filters, { roleName: '', status: undefined })
  Object.assign(applied, filters)
  page.current = 1
}
function openCreate() {
  editingRole.value = null
  dialogOpen.value = true
}
function openEdit(role: Role) {
  editingRole.value = role
  dialogOpen.value = true
}
async function saveRole(data: RoleFormData) {
  submitting.value = true
  try {
    if (editingRole.value) Object.assign(editingRole.value, await updateRole(editingRole.value.id, data))
    else roleList.push(await createRole({ ...data, menuIds: [], userCount: 0, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) }))
    dialogOpen.value = false
    message.success(editingRole.value ? '角色编辑成功' : '角色新增成功')
  } finally {
    submitting.value = false
  }
}
function remove(role: Role) {
  Modal.confirm({
    title: '删除角色',
    content: role.userCount > 0 ? `该角色下存在 ${role.userCount} 名关联用户，删除后将解除关联关系，是否继续？` : '确认删除该角色吗？',
    okText: '继续删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      await deleteRole(role.id)
      roleList.splice(
        roleList.findIndex((item) => item.id === role.id),
        1
      )
      message.success('角色删除成功')
    }
  })
}
function openPermission(role: Role) {
  permissionRole.value = role
  permissionOpen.value = true
}
async function savePermissions(menuIds: number[]) {
  if (!permissionRole.value) return
  submitting.value = true
  try {
    Object.assign(permissionRole.value, await assignRolePermissions(permissionRole.value.id, menuIds))
    permissionOpen.value = false
    message.success('权限分配成功！')
  } finally {
    submitting.value = false
  }
}
async function updateRoleStatus(role: Role, status: boolean) {
  const previous = role.status
  role.status = status
  try {
    Object.assign(role, await updateRole(role.id, { status }))
    message.success('角色状态更新成功')
  } catch {
    role.status = previous
  }
}
function handleStatusChange(role: Role, checked: boolean | string | number) {
  return updateRoleStatus(role, Boolean(checked))
}
</script>

<template>
  <section class="page">
    <div class="page-search">
      <a-form layout="inline">
        <a-form-item label="角色名称">
          <a-input v-model:value="filters.roleName" allow-clear placeholder="请输入角色名称" @press-enter="search" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="filters.status"
            :options="[
              { label: '全部', value: undefined },
              { label: '启用', value: true },
              { label: '禁用', value: false }
            ]"
            style="width: 140px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="search">
              <SearchOutlined />
              搜索
            </a-button>
            <a-button @click="reset">重置</a-button>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="openCreate">
                  <a-menu-item key="create">新增角色</a-menu-item>
                </a-menu>
              </template>
              <a-button>
                更多操作
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <div class="page-body">
      <div class="page-table">
        <a-table :data-source="pagedRoles" row-key="id" :pagination="false" :scroll="{ x: 1050, y: '100%' }">
          <a-table-column title="角色编号" data-index="id" :width="100" :sorter="sortById" align="center" />
          <a-table-column title="角色名称" :width="170">
            <template #default="{ record }">
              <div class="role-name">
                <span><TeamOutlined /></span>
                <div>
                  <strong>{{ record.roleName }}</strong>
                  <small>{{ record.userCount }} 名用户</small>
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="角色编码" data-index="roleKey" :width="180">
            <template #default="{ text }">
              <code>{{ text }}</code>
            </template>
          </a-table-column>
          <a-table-column title="数据范围" :width="140">
            <template #default="{ record }">
              <a-tag :color="getScopeMeta(record.dataScope).color">
                {{ getScopeMeta(record.dataScope).label }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #default="{ record }">
              <a-switch :checked="record.status" checked-children="启用" un-checked-children="禁用" @change="handleStatusChange(record, $event)" />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="175" :sorter="sortByCreateTime"/>
          <a-table-column title="操作" :width="230" fixed="right" align="center">
            <template #default="{ record }">
              <a-button type="link" size="small" @click="openEdit(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button type="link" size="small" @click="openPermission(record)">
                <KeyOutlined />
                分配权限
              </a-button>
              <a-button type="link" size="small" danger @click="remove(record)">
                <DeleteOutlined />
                删除
              </a-button>
            </template>
          </a-table-column>
        </a-table>
      </div>
      <div class="page-pagination">
        <a-pagination
          v-model:current="page.current"
          v-model:page-size="page.size"
          :total="tableData.length"
          :page-size-options="['10', '20', '50']"
          show-size-changer
          :show-total="(total: number) => `共 ${total} 条`"
        />
      </div>
    </div>

    <RoleDialog v-model:open="dialogOpen" :roles="roleList" :editing-role="editingRole" :confirm-loading="submitting" @submit="saveRole" />
    <RolePermissionDialog v-model:open="permissionOpen" :role="permissionRole" :menus="menuList" :confirm-loading="submitting" @submit="savePermissions" />
  </section>
</template>

<style lang="scss" scoped>
.role-name {
  display: flex;
  align-items: center;
  gap: 10px;
}
.role-name > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: #008f80;
  background: #eaf7f4;
  border-radius: 9px;
}
.role-name div {
  display: flex;
  flex-direction: column;
}
.role-name strong {
  font-size: 13px;
}
.role-name small {
  margin-top: 3px;
  color: #98a5ad;
  font-size: 10px;
}
code {
  padding: 3px 7px;
  color: #536672;
  font-size: 11px;
  background: #f2f6f6;
  border-radius: 5px;
}
</style>
