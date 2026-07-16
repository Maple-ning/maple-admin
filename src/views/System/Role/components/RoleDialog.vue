<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormProps } from 'ant-design-vue'
import type { DataScope, SystemRole } from '@/api/system/role'

export type RoleFormData = Pick<SystemRole, 'roleName' | 'roleKey' | 'dataScope' | 'status' | 'orderNum' | 'remark'>

const props = withDefaults(defineProps<{
  roles: SystemRole[]
  editingRole?: SystemRole | null
  confirmLoading?: boolean
}>(), { editingRole: null, confirmLoading: false })

const emit = defineEmits<{ submit: [data: RoleFormData] }>()
const open = defineModel<boolean>('open', { default: false })
const formRef = ref<FormInstance>()
const form = reactive<RoleFormData>(initialForm())
const title = computed(() => props.editingRole ? '编辑角色' : '新增角色')
const scopeOptions: Array<{ label: string; value: DataScope }> = [
  { label: '全部数据', value: 'ALL' },
  { label: '本部门及以下', value: 'DEPT_AND_CHILD' },
  { label: '仅本部门', value: 'DEPT' },
  { label: '仅本人', value: 'SELF' },
  { label: '自定义', value: 'CUSTOM' },
]

function initialForm(): RoleFormData {
  return { roleName: '', roleKey: '', dataScope: 'DEPT', status: true, orderNum: props.roles.length + 1, remark: '' }
}

const rules: FormProps['rules'] = {
  roleName: [{ required: true, whitespace: true, message: '请输入角色名称' }, { max: 30, message: '角色名称最多 30 个字符' }],
  roleKey: [
    { required: true, message: '请输入角色编码' },
    { pattern: /^[A-Z][A-Z_]*$/, message: '仅支持大写字母和下划线，例如 ROLE_DEVELOPER' },
    { validator: async (_rule, value) => { if (props.roles.some((role) => role.roleKey === value && role.id !== props.editingRole?.id)) throw new Error('角色编码已存在') } },
  ],
  dataScope: [{ required: true, message: '请选择数据范围' }],
  orderNum: [{ required: true, message: '请输入排序号' }],
}

watch(open, (visible) => {
  if (!visible) return
  Object.assign(form, props.editingRole ? {
    roleName: props.editingRole.roleName, roleKey: props.editingRole.roleKey, dataScope: props.editingRole.dataScope,
    status: props.editingRole.status, orderNum: props.editingRole.orderNum, remark: props.editingRole.remark,
  } : initialForm())
  formRef.value?.clearValidate()
}, { flush: 'post' })

async function submit() {
  await formRef.value?.validate()
  emit('submit', { ...form })
}
</script>

<template>
  <a-modal
    v-model:open="open"
    :title="title"
    width="660px"
    ok-text="保存"
    cancel-text="取消"
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    @ok="submit"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      layout="vertical"
      class="dialog-form"
    >
      <div class="form-grid">
        <a-form-item
          label="角色名称"
          name="roleName"
        >
          <a-input
            v-model:value="form.roleName"
            :maxlength="30"
            show-count
          />
        </a-form-item>
        <a-form-item
          label="角色编码"
          name="roleKey"
        >
          <a-input
            v-model:value="form.roleKey"
            placeholder="例如 ROLE_DEVELOPER"
          />
        </a-form-item>
      </div>
      <div class="form-grid">
        <a-form-item
          label="数据范围"
          name="dataScope"
        >
          <a-select
            v-model:value="form.dataScope"
            :options="scopeOptions"
          />
        </a-form-item>
        <a-form-item
          label="排序号"
          name="orderNum"
        >
          <a-input-number
            v-model:value="form.orderNum"
            :min="1"
            :max="999"
            style="width:100%"
          />
        </a-form-item>
      </div>
      <a-form-item
        label="状态"
        name="status"
      >
        <a-switch
          v-model:checked="form.status"
          checked-children="启用"
          un-checked-children="禁用"
        />
      </a-form-item>
      <a-form-item
        label="备注"
        name="remark"
      >
        <a-textarea
          v-model:value="form.remark"
          :rows="3"
          :maxlength="200"
          show-count
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped lang="scss">
.dialog-form{padding-top:10px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}@media(max-width:720px){.form-grid{grid-template-columns:1fr;gap:0}}
</style>
