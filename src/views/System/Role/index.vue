<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { assignRolePermissions, createRole, deleteRole, getRoleList, updateRole } from '@/api/system/role'
import { getMenuList } from '@/api/system/menu'
import type { DataScope, SystemRole } from '@/api/system/role'
import type { SystemMenu } from '@/api/system/menu'
import { DeleteOutlined, DownOutlined, EditOutlined, KeyOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons-vue'
import type { FormInstance, TreeProps } from 'ant-design-vue'

type Role = SystemRole
interface MenuNode {
  key: number
  title: string
  type: 'dir' | 'menu' | 'btn'
  children?: MenuNode[]
}
type MenuRow = SystemMenu

const menuTree = reactive<MenuNode[]>([])
const allMenuIds = computed(() => menuTree.flatMap(function flatten(node): number[] {
  return [node.key, ...(node.children?.flatMap(flatten) || [])]
}))
const roleList = reactive<Role[]>([])
function buildMenuTree(items: MenuRow[]): MenuNode[] {
  const map = new Map(items.map((item) => [item.id, { key: item.id, title: item.name, type: item.type, children: [] as MenuNode[] }]))
  const roots: MenuNode[] = []
  items.forEach((item) => (item.parentId === 0 ? roots : map.get(item.parentId)?.children)?.push(map.get(item.id)!))
  return roots
}
async function loadRoles() {
  try {
    const [roles, menus] = await Promise.all([getRoleList(), getMenuList()])
    roleList.splice(0, roleList.length, ...roles)
    menuTree.splice(0, menuTree.length, ...buildMenuTree(menus))
  } catch { message.error('角色数据加载失败，请确认本地接口已启动') }
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
const modalOpen = ref(false),
  permissionOpen = ref(false),
  editingId = ref<number | null>(null),
  permissionRoleId = ref<number | null>(null)
const formRef = ref<FormInstance>(),
  form = reactive({ roleName: '', roleKey: '', dataScope: 'DEPT' as DataScope, status: true, orderNum: 1, remark: '' })
const checkedKeys = ref<number[]>([]),
  halfCheckedKeys = ref<number[]>([]),
  expandedKeys = ref<number[]>(menuTree.map((node) => node.key))
const rules = {
  roleName: [
    { required: true, message: '请输入角色名称' },
    { max: 30, message: '角色名称最多 30 个字符' }
  ],
  roleKey: [
    { required: true, message: '请输入角色编码' },
    { pattern: /^[A-Z][A-Z_]*$/, message: '仅支持大写字母和下划线，例如 ROLE_DEVELOPER' },
    {
      validator: async (_rule: unknown, value: string) => {
        if (roleList.some((item) => item.roleKey === value && item.id !== editingId.value)) throw new Error('角色编码已存在')
      }
    }
  ]
}
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
  editingId.value = null
  Object.assign(form, { roleName: '', roleKey: '', dataScope: 'DEPT', status: true, orderNum: roleList.length + 1, remark: '' })
  modalOpen.value = true
}
function openEdit(role: Role) {
  editingId.value = role.id
  Object.assign(form, role)
  modalOpen.value = true
}
async function save() {
  try {
    await formRef.value?.validate()
    const current = roleList.find((item) => item.id === editingId.value)
    if (current) Object.assign(current, await updateRole(current.id, form))
    else roleList.push(await createRole({ ...form, menuIds: [], userCount: 0, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) }))
    modalOpen.value = false
    message.success(current ? '角色编辑成功' : '角色新增成功')
  } catch {
    message.error('请检查表单填写内容')
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
  permissionRoleId.value = role.id
  checkedKeys.value = [...role.menuIds]
  halfCheckedKeys.value = []
  expandedKeys.value = menuTree.map((node) => node.key)
  permissionOpen.value = true
}
const handleCheck: TreeProps['onCheck'] = (keys, info) => {
  checkedKeys.value = (Array.isArray(keys) ? keys : keys.checked).map(Number)
  halfCheckedKeys.value = (info.halfCheckedKeys || []).map(Number)
}
function toggleTree() {
  expandedKeys.value = expandedKeys.value.length ? [] : [...allMenuIds.value]
}
function toggleSelectAll() {
  checkedKeys.value = checkedKeys.value.length === allMenuIds.value.length ? [] : [...allMenuIds.value]
  halfCheckedKeys.value = []
}
async function assignPermission() {
  const role = roleList.find((item) => item.id === permissionRoleId.value)
  if (!role) return message.error('角色不存在')
  Object.assign(role, await assignRolePermissions(role.id, [...new Set([...checkedKeys.value, ...halfCheckedKeys.value])]))
  permissionOpen.value = false
  message.success('权限分配成功！')
}
async function updateRoleStatus(role: Role) {
  try { Object.assign(role, await updateRole(role.id, { status: role.status })); message.success('角色状态更新成功') }
  catch { role.status = !role.status }
}
</script>

<template>
  <section class="page">
    <div class="page-search">
      <a-form layout="inline">
        <a-form-item label="角色名称"><a-input v-model:value="filters.roleName" allow-clear placeholder="请输入角色名称" @press-enter="search" /></a-form-item>
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
              <template #overlay><a-menu @click="openCreate"><a-menu-item key="create">新增角色</a-menu-item></a-menu></template>
              <a-button>更多操作<DownOutlined /></a-button>
            </a-dropdown>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <div class="page-body">
      <div class="page-table">
      <a-table :data-source="pagedRoles" row-key="id" :pagination="false" :scroll="{ x: 1050, y: '100%' }">
        <a-table-column title="角色编号" data-index="id" :width="100" :sorter="sortById" align="center"/>
        <a-table-column title="角色名称" :width="170" align="center">
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
        <a-table-column title="角色编码" data-index="roleKey" :width="180" align="center">
          <template #default="{ text }">
            <code>{{ text }}</code>
          </template>
        </a-table-column>
        <a-table-column title="数据范围" :width="140" align="center">
          <template #default="{ record }">
            <a-tag :color="getScopeMeta(record.dataScope).color">{{ getScopeMeta(record.dataScope).label }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="状态" :width="100" align="center">
          <template #default="{ record }"><a-switch v-model:checked="record.status" checked-children="启用" un-checked-children="禁用" @change="updateRoleStatus(record)" /></template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" :width="175" :sorter="sortByCreateTime" align="center"/>
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
        <a-pagination v-model:current="page.current" v-model:page-size="page.size" :total="tableData.length" :page-size-options="['10', '20', '50']" show-size-changer show-total />
      </div>
    </div>

    <a-modal v-model:open="modalOpen" :title="editingId ? '编辑角色' : '新增角色'" width="660px" ok-text="保存" cancel-text="取消" @ok="save">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="role-form">
        <div class="form-grid">
          <a-form-item label="角色名称" name="roleName"><a-input v-model:value="form.roleName" :maxlength="30" show-count /></a-form-item>
          <a-form-item label="角色编码" name="roleKey"><a-input v-model:value="form.roleKey" placeholder="例如 ROLE_DEVELOPER" /></a-form-item>
        </div>
        <div class="form-grid">
          <a-form-item label="数据范围">
            <a-select v-model:value="form.dataScope">
              <a-select-option v-for="(item, key) in scopeMap" :key="key" :value="key">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="排序号"><a-input-number v-model:value="form.orderNum" :min="1" :max="999" style="width: 100%" /></a-form-item>
        </div>
        <a-form-item label="状态"><a-switch v-model:checked="form.status" checked-children="启用" un-checked-children="禁用" /></a-form-item>
        <a-form-item label="备注"><a-textarea v-model:value="form.remark" :rows="3" :maxlength="200" show-count placeholder="请输入角色说明" /></a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="permissionOpen" title="分配菜单权限" width="900px" wrap-class-name="permission-modal" ok-text="确认分配" cancel-text="取消" @ok="assignPermission">
      <div class="permission-head">
        <div>
          <strong>{{ roleList.find((item) => item.id === permissionRoleId)?.roleName }}</strong>
          <span>已选择 {{ checkedKeys.length }} 个权限节点</span>
        </div>
        <a-space>
          <a-button size="small" @click="toggleTree">{{ expandedKeys.length ? '折叠全部' : '展开全部' }}</a-button>
          <a-button size="small" @click="toggleSelectAll">{{ checkedKeys.length === allMenuIds.length ? '取消全选' : '全选' }}</a-button>
        </a-space>
      </div>
      <div class="permission-tree">
        <a-tree v-model:expanded-keys="expandedKeys" :checked-keys="checkedKeys" :tree-data="menuTree" checkable block-node @check="handleCheck">
          <template #title="node">
            <span class="tree-title">
              <span :class="['node-type', node.type]">{{ node.type === 'dir' ? '目录' : node.type === 'menu' ? '菜单' : '按钮' }}</span>
              {{ node.title }}
            </span>
          </template>
        </a-tree>
      </div>
    </a-modal>
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
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.role-form {
  padding-top: 10px;
}
.permission-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0 16px;
}
.permission-head > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.permission-head span {
  color: #8a989f;
  font-size: 12px;
}
.permission-tree {
  height: min(58vh, 520px);
  padding: 14px 18px;
  overflow: auto;
  background: #f8fbfa;
  border: 1px solid #e5eeee;
  border-radius: 10px;
}
.tree-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.node-type {
  padding: 1px 6px;
  color: #168b7e;
  font-size: 10px;
  background: #e6f6f3;
  border-radius: 4px;
}
.node-type.btn {
  color: #b46d16;
  background: #fff4df;
}
.node-type.dir {
  color: #386fb5;
  background: #eaf2ff;
}
@media (max-width: 720px) {
  .permission-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
