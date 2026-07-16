<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { createUser, deleteUser, getUserList, updateUser } from '@/api/system/user'
import { getRoleList } from '@/api/system/role'
import { useDepartmentStore } from '@/stores/department'
import type { SystemUser } from '@/api/system/user'
import type { SystemRole } from '@/api/system/role'
import { DeleteOutlined, EditOutlined, KeyOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import UserDialog from './components/UserDialog.vue'
import PasswordResetDialog from './components/PasswordResetDialog.vue'
import type { UserFormData } from './components/UserDialog.vue'

type Role = SystemRole
type User = SystemUser
const departmentStore = useDepartmentStore()
const roleList = reactive<Role[]>([])
async function loadUsers() {
  try {
    const [users, roles] = await Promise.all([getUserList(), getRoleList(), departmentStore.loadDepartments()])
    userList.splice(0, userList.length, ...users)
    roleList.splice(0, roleList.length, ...roles)
  } catch {
    message.error('用户数据加载失败，请确认本地接口已启动')
  }
}
onMounted(loadUsers)
const userList = reactive<User[]>([])
const query = reactive({ username: '', phone: '', status: undefined as boolean | undefined, deptId: undefined as number | undefined }),
  applied = reactive({ ...query })
const page = reactive({ current: 1, size: 10 })
const filtered = computed(() => userList.filter((user) => (!applied.username || user.username.toLowerCase().includes(applied.username.toLowerCase())) && (!applied.phone || user.phone.includes(applied.phone)) && (applied.status === undefined || user.status === applied.status) && (!applied.deptId || departmentStore.getDescendantIds(applied.deptId).includes(user.deptId))))
const paged = computed(() => filtered.value.slice((page.current - 1) * page.size, page.current * page.size))
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
  passwordOpen = ref(false),
  submitting = ref(false)
const editingUser = ref<User | null>(null),
  passwordUser = ref<User | null>(null)
function openCreate() {
  editingUser.value = null
  userOpen.value = true
}
function openEdit(user: User) {
  editingUser.value = user
  userOpen.value = true
}
async function saveUser(data: UserFormData) {
  submitting.value = true
  try {
    if (editingUser.value) Object.assign(editingUser.value, await updateUser(editingUser.value.id, data))
    else userList.push(await createUser({ username: data.username, nickname: data.nickname, phone: data.phone, email: data.email, deptId: data.deptId, roleIds: data.roleIds, status: data.status, remark: data.remark, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) }))
    userOpen.value = false
    message.success(editingUser.value ? '用户编辑成功' : '用户新增成功')
  } finally {
    submitting.value = false
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

function openPassword(user: User) {
  passwordUser.value = user
  passwordOpen.value = true
}
function resetPassword() {
  passwordOpen.value = false
  message.success('密码已重置为 ******')
}
async function updateUserStatus(user: User, status: boolean) {
  const previous = user.status
  user.status = status
  try {
    Object.assign(user, await updateUser(user.id, { status }))
    message.success('用户状态更新成功')
  } catch {
    user.status = previous
  }
}
function handleStatusChange(user: User, checked: boolean | string | number) {
  return updateUserStatus(user, Boolean(checked))
}
</script>

<template>
  <section class="page">
    <div class="page-search">
      <a-form layout="inline">
        <a-form-item label="用户名">
          <a-input
            v-model:value="query.username"
            allow-clear
            placeholder="模糊搜索"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="query.status"
            :options="[
              { label: '全部', value: undefined },
              { label: '启用', value: true },
              { label: '禁用', value: false }
            ]"
            style="width: 120px"
          />
        </a-form-item>
        <a-form-item label="部门">
          <a-cascader
            v-model:value="query.deptId"
            :options="departmentStore.treeOptions"
            change-on-select
            allow-clear
            placeholder="请选择部门"
            style="width: 190px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button
              type="primary"
              @click="search"
            >
              <SearchOutlined />
              搜索
            </a-button>
            <a-button @click="reset">
              重置
            </a-button>
            <a-button @click="openCreate">
              <PlusOutlined />
              新增用户
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <div class="page-body">
      <div class="page-table">
        <a-table
          :data-source="paged"
          row-key="id"
          :pagination="false"
          :scroll="{ x: 1450, y: '100%' }"
        >
          <a-table-column
            title="序号"
            :width="70"
            align="center"
          >
            <template #default="{ index }">
              {{ (page.current - 1) * page.size + index + 1 }}
            </template>
          </a-table-column>
          <a-table-column
            title="用户名"
            :width="160"
            align="center"
          >
            <template #default="{ record }">
              <div class="user-name">
                <strong>{{ record.username }}</strong>
              </div>
            </template>
          </a-table-column>
          <a-table-column
            title="昵称"
            data-index="nickname"
            :width="110"
          />
          <a-table-column
            title="部门"
            :width="230"
            align="center"
          >
            <template #default="{ record }">
              <span class="dept-path">{{ departmentStore.getPath(record.deptId) }}</span>
            </template>
          </a-table-column>
          <a-table-column
            title="角色"
            :width="100"
          >
            <template #default="{ record }">
              <div class="role-tags">
                <a-tag
                  v-for="id in record.roleIds.slice(0, 2)"
                  :key="id"
                  color="cyan"
                >
                  {{ roleName(id) }}
                </a-tag>
                <a-tooltip
                  v-if="record.roleIds.length > 2"
                  :title="record.roleIds.slice(2).map(roleName).join('、')"
                >
                  <a-tag>+{{ record.roleIds.length - 2 }}</a-tag>
                </a-tooltip>
              </div>
            </template>
          </a-table-column>
          <a-table-column
            title="状态"
            :width="100"
            align="center"
          >
            <template #default="{ record }">
              <a-switch
                :checked="record.status"
                checked-children="启用"
                un-checked-children="禁用"
                @change="handleStatusChange(record, $event)"
              />
            </template>
          </a-table-column>
          <a-table-column
            title="创建时间"
            data-index="createTime"
            :width="175"
          />
          <a-table-column
            title="操作"
            :width="220"
            fixed="right"
            align="center"
          >
            <template #default="{ record }">
              <a-button
                type="link"
                size="small"
                @click="openEdit(record)"
              >
                <EditOutlined />
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="openPassword(record)"
              >
                <KeyOutlined />
                重置密码
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="confirmDelete([record])"
              >
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
          :total="filtered.length"
          :page-size-options="['10', '20', '50']"
          show-size-changer
          :show-total="(total: number) => `共 ${total} 条`"
        />
      </div>
    </div>

    <UserDialog
      v-model:open="userOpen"
      :users="userList"
      :roles="roleList"
      :editing-user="editingUser"
      :confirm-loading="submitting"
      @submit="saveUser"
    />
    <PasswordResetDialog
      v-model:open="passwordOpen"
      :user="passwordUser"
      :confirm-loading="submitting"
      @submit="resetPassword"
    />
  </section>
</template>

<style lang="scss" scoped>
.user-name {
  display: flex;
  justify-content: center;
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
  overflow: hidden;
}
</style>
