<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { assignUserRoles, createUser, deleteUser, getUserList, updateUser } from '@/api/system/user'
import { getRoleList } from '@/api/system/role'
import { getDepartmentList } from '@/api/system/department'
import type { SystemUser } from '@/api/system/user'
import type { SystemRole } from '@/api/system/role'
import type { Department } from '@/api/system/department'
import { DeleteOutlined, EditOutlined, KeyOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'

interface Dept {
  value: number
  label: string
  children?: Dept[]
}
type Role = SystemRole
type User = SystemUser
const deptTree = reactive<Dept[]>([])
const roleList = reactive<Role[]>([])
const renderRole = (item: { title: string }) => item.title
function buildDeptTree(items: Department[]): Dept[] {
  const map = new Map(items.map((item) => [item.id, { value: item.id, label: item.name, children: [] as Dept[] }]))
  const roots: Dept[] = []
  items.forEach((item) => (item.parentId === 0 ? roots : map.get(item.parentId)?.children)?.push(map.get(item.id)!))
  return roots
}
async function loadUsers() {
  try {
    const [users, roles, departments] = await Promise.all([getUserList(), getRoleList(), getDepartmentList()])
    userList.splice(0, userList.length, ...users)
    roleList.splice(0, roleList.length, ...roles)
    deptTree.splice(0, deptTree.length, ...buildDeptTree(departments))
  } catch { message.error('用户数据加载失败，请确认本地接口已启动') }
}
onMounted(loadUsers)
const userList = reactive<User[]>([])
const query = reactive({ username: '', phone: '', status: undefined as boolean | undefined, deptId: undefined as number | undefined }),
  applied = reactive({ ...query })
const page = reactive({ current: 1, size: 10 })
function deptIds(id: number): number[] {
  const walk = (nodes: Dept[]): number[] => nodes.flatMap((node) => (node.value === id ? [node.value, ...((node.children && node.children.flatMap((child) => deptIds(child.value))) || [])] : walk(node.children || [])))
  return walk(deptTree)
}
const filtered = computed(() => userList.filter((user) => (!applied.username || user.username.toLowerCase().includes(applied.username.toLowerCase())) && (!applied.phone || user.phone.includes(applied.phone)) && (applied.status === undefined || user.status === applied.status) && (!applied.deptId || deptIds(applied.deptId).includes(user.deptId))))
const paged = computed(() => filtered.value.slice((page.current - 1) * page.size, page.current * page.size))
function deptPath(id: number) {
  const find = (nodes: Dept[], path: string[]): string[] | null => {
    for (const node of nodes) {
      const next = [...path, node.label]
      if (node.value === id) return next
      const hit = find(node.children || [], next)
      if (hit) return hit
    }
    return null
  }
  return find(deptTree, [])?.join(' / ') || '—'
}
function roleName(id: number) {
  return roleList.find((role) => role.id === id)?.roleName || '未知角色'
}
function search() {
  Object.assign(applied, query)
  page.current = 1
  message.success('查询完成')
}
function reset() {
  Object.assign(query, { username: '', phone: '', status: undefined, deptId: undefined })
  Object.assign(applied, query)
  page.current = 1
}

const userOpen = ref(false),
  editingId = ref<number | null>(null),
  formRef = ref<FormInstance>()
const form = reactive({ username: '', nickname: '', phone: '', email: '', deptId: undefined as number | undefined, roleIds: [] as number[], status: true, remark: '', password: '', confirmPassword: '' })
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { pattern: /^[A-Za-z0-9_]{4,20}$/, message: '用户名为 4-20 位字母、数字或下划线' },
    {
      validator: async (_r: unknown, value: string) => {
        if (userList.some((user) => user.username === value && user.id !== editingId.value)) throw new Error('用户名已存在')
      }
    }
  ],
  nickname: [
    { required: true, message: '请输入昵称' },
    { max: 20, message: '昵称最多 20 个字符' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1\d{10}$/, message: '请输入正确的 11 位手机号' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' }
  ],
  deptId: [{ required: true, message: '请选择部门' }],
  password: [
    {
      validator: async (_r: unknown, value: string) => {
        if (!editingId.value && !/^.{6,20}$/.test(value)) throw new Error('密码长度为 6-20 位')
      }
    }
  ],
  confirmPassword: [
    {
      validator: async (_r: unknown, value: string) => {
        if (!editingId.value && value !== form.password) throw new Error('两次输入的密码不一致')
      }
    }
  ]
}
function openCreate() {
  editingId.value = null
  Object.assign(form, { username: '', nickname: '', phone: '', email: '', deptId: undefined, roleIds: [], status: true, remark: '', password: '', confirmPassword: '' })
  userOpen.value = true
}
function openEdit(user: User) {
  editingId.value = user.id
  Object.assign(form, user, { password: '', confirmPassword: '' })
  userOpen.value = true
}
async function saveUser() {
  try {
    await formRef.value?.validate()
    const current = userList.find((user) => user.id === editingId.value)
    const data = { username: form.username, nickname: form.nickname, phone: form.phone, email: form.email, deptId: form.deptId!, roleIds: [...form.roleIds], status: form.status, remark: form.remark }
    if (current) Object.assign(current, await updateUser(current.id, data))
    else userList.push(await createUser({ ...data, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) }))
    userOpen.value = false
    message.success(current ? '用户编辑成功' : '用户新增成功')
  } catch {
    message.error('请检查表单填写内容')
  }
}
function confirmDelete(users: User[]) {
  if (!users.length) return message.warning('请先选择需要删除的用户')
  const admin = users.some((user) => user.username === 'admin')
  Modal.confirm({
    title: admin ? '高风险操作' : '删除用户',
    content: admin ? '该用户为超级管理员，删除后将无法恢复，请谨慎操作！' : users.length > 1 ? `确认删除选中的 ${users.length} 个用户吗？` : '确认删除该用户吗？',
    okText: '继续删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      const ids = new Set(users.map((user) => user.id))
      for (const user of users) await deleteUser(user.id)
      for (let i = userList.length - 1; i >= 0; i--) if (ids.has(userList[i].id)) userList.splice(i, 1)
      message.success('用户删除成功')
    }
  })
}

const roleOpen = ref(false),
  roleUserId = ref<number | null>(null),
  assignedRoles = ref<number[]>([])
function openRoles(user: User) {
  roleUserId.value = user.id
  assignedRoles.value = [...user.roleIds]
  roleOpen.value = true
}
function saveRoles() {
  const user = userList.find((item) => item.id === roleUserId.value)
  if (!user) return message.error('用户不存在')
  assignUserRoles(user.id, assignedRoles.value).then((updated) => {
    Object.assign(user, updated)
    roleOpen.value = false
    message.success('角色分配成功')
  })
}
const passwordOpen = ref(false),
  passwordUser = ref<User | null>(null),
  password = reactive({ value: '', confirm: '' })
function openPassword(user: User) {
  passwordUser.value = user
  Object.assign(password, { value: '', confirm: '' })
  passwordOpen.value = true
}
function resetPassword() {
  if (password.value.length < 6 || password.value.length > 20) return message.warning('密码长度为 6-20 位')
  if (password.value !== password.confirm) return message.warning('两次输入的密码不一致')
  passwordOpen.value = false
  message.success('密码已重置为 ******')
}
async function updateUserStatus(user: User) {
  try { Object.assign(user, await updateUser(user.id, { status: user.status })); message.success('用户状态更新成功') }
  catch { user.status = !user.status }
}
</script>

<template>
  <section class="page">
    <div class="page-search">
      <a-form layout="inline">
        <a-form-item label="用户名"><a-input v-model:value="query.username" allow-clear placeholder="模糊搜索" /></a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="query.status"
            :options="[
              { label: '全部', value: undefined },
              { label: '启用', value: true },
              { label: '禁用', value: false }
            ]"
            style="width: 120px" />
        </a-form-item>
        <a-form-item label="部门"><a-cascader v-model:value="query.deptId" :options="deptTree" change-on-select allow-clear placeholder="请选择部门" style="width: 190px" /></a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="search">
              <SearchOutlined />
              搜索
            </a-button>
            <a-button @click="reset">重置</a-button>
            <a-button @click="openCreate"><PlusOutlined />新增用户</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <div class="page-body">
      <div class="page-table">
        <a-table :data-source="paged" row-key="id" :pagination="false" :scroll="{ x: 1450, y: '100%' }">
          <a-table-column title="序号" :width="70" align="center">
            <template #default="{ index }">{{ (page.current - 1) * page.size + index + 1 }}</template>
          </a-table-column>
          <a-table-column title="用户名" :width="160">
            <template #default="{ record }">
              <div class="user-name">
                <a-avatar :size="34">{{ record.username.slice(0, 1).toUpperCase() }}</a-avatar>
                <strong>{{ record.username }}</strong>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="昵称" data-index="nickname" :width="110" align="center" />
          <a-table-column title="部门" :width="230" align="center">
            <template #default="{ record }">
              <span class="dept-path">{{ deptPath(record.deptId) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="角色" :width="210" align="center">
            <template #default="{ record }">
              <div class="role-tags">
                <a-tag v-for="id in record.roleIds.slice(0, 2)" :key="id" color="cyan">{{ roleName(id) }}</a-tag>
                <a-tooltip v-if="record.roleIds.length > 2" :title="record.roleIds.slice(2).map(roleName).join('、')">
                  <a-tag>+{{ record.roleIds.length - 2 }}</a-tag>
                </a-tooltip>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #default="{ record }"><a-switch v-model:checked="record.status" checked-children="启用" un-checked-children="禁用" @change="updateUserStatus(record)" /></template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="175" align="center" />
          <a-table-column title="操作" :width="300" fixed="right" align="center">
            <template #default="{ record }">
              <a-button type="link" size="small" @click="openEdit(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-button type="link" size="small" @click="openRoles(record)">
                <UserOutlined />
                分配角色
              </a-button>
              <a-button type="link" size="small" @click="openPassword(record)">
                <KeyOutlined />
                重置密码
              </a-button>
              <a-button type="link" size="small" danger @click="confirmDelete([record])">
                <DeleteOutlined />
                删除
              </a-button>
            </template>
          </a-table-column>
        </a-table>
      </div>

      <div class="page-pagination">
        <a-pagination v-model:current="page.current" v-model:page-size="page.size" :total="filtered.length" :page-size-options="['10', '20', '50']" show-size-changer show-total />
      </div>
    </div>

    <a-modal v-model:open="userOpen" :title="editingId ? '编辑用户' : '新增用户'" width="720px" ok-text="保存" cancelText="取消" @ok="saveUser">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="user-form">
        <div class="form-grid">
          <a-form-item label="用户名" name="username"><a-input v-model:value="form.username" :disabled="!!editingId" /></a-form-item>
          <a-form-item label="昵称" name="nickname"><a-input v-model:value="form.nickname" :maxlength="20" show-count /></a-form-item>
        </div>
        <div class="form-grid">
          <a-form-item label="手机号" name="phone"><a-input v-model:value="form.phone" /></a-form-item>
          <a-form-item label="邮箱" name="email"><a-input v-model:value="form.email" /></a-form-item>
        </div>
        <div class="form-grid">
          <a-form-item label="部门" name="deptId"><a-cascader v-model:value="form.deptId" :options="deptTree" :change-on-select="false" /></a-form-item>
          <a-form-item label="角色"><a-select v-model:value="form.roleIds" mode="multiple" :options="roleList.map((role) => ({ label: role.roleName, value: role.id }))" /></a-form-item>
        </div>
        <div v-if="!editingId" class="form-grid">
          <a-form-item label="密码" name="password"><a-input-password v-model:value="form.password" /></a-form-item>
          <a-form-item label="确认密码" name="confirmPassword"><a-input-password v-model:value="form.confirmPassword" /></a-form-item>
        </div>
        <a-alert v-else message="如需修改密码，请使用列表中的“重置密码”操作" type="info" show-icon class="edit-tip" />
        <a-form-item label="状态"><a-switch v-model:checked="form.status" checked-children="启用" un-checked-children="禁用" /></a-form-item>
        <a-form-item label="备注"><a-textarea v-model:value="form.remark" :maxlength="200" :rows="3" show-count /></a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:open="roleOpen" title="分配角色" width="720px" ok-text="确认分配" @ok="saveRoles"><a-transfer v-model:target-keys="assignedRoles" :data-source="roleList.map((role) => ({ key: role.id, title: `${role.roleName}（${role.roleKey}）` }))" :render="renderRole" :titles="['全部角色', '已分配角色']" show-search /></a-modal>
    <a-modal v-model:open="passwordOpen" title="重置密码" width="480px" ok-text="确认重置" @ok="resetPassword">
      <a-alert :message="`正在重置 ${passwordUser?.nickname || ''} 的密码`" type="warning" show-icon />
      <a-form layout="vertical" class="password-form">
        <a-form-item label="新密码" required><a-input-password v-model:value="password.value" placeholder="6-20 位密码" /></a-form-item>
        <a-form-item label="确认密码" required><a-input-password v-model:value="password.confirm" /></a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<style lang="scss" scoped>
.user-name {
  display: flex;
  align-items: center;
  gap: 9px;
}
.user-name :deep(.ant-avatar) {
  color: #fff;
  background: linear-gradient(135deg, #00796b, #00bfa5);
}
.user-name strong {
  font-size: 12px;
}
.dept-path {
  color: #60747e;
  font-size: 12px;
}
.role-tags {
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.user-form {
  padding-top: 10px;
}
.edit-tip {
  margin-bottom: 18px;
}
.password-form {
  margin-top: 18px;
}
@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
