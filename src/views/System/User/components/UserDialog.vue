<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormProps } from 'ant-design-vue'
import { useDepartmentStore } from '@/stores/department'
import type { SystemRole } from '@/api/system/role'
import type { SystemUser } from '@/api/system/user'

export interface UserFormData { username:string;nickname:string;phone:string;email:string;deptId:number;roleIds:number[];status:boolean;remark:string;password?:string }
const props=withDefaults(defineProps<{users:SystemUser[];roles:SystemRole[];editingUser?:SystemUser|null;confirmLoading?:boolean}>(),{editingUser:null,confirmLoading:false})
const departmentStore=useDepartmentStore()
const emit=defineEmits<{submit:[data:UserFormData]}>();const open=defineModel<boolean>('open',{default:false});const formRef=ref<FormInstance>()
const form=reactive({username:'',nickname:'',phone:'',email:'',departmentPath:[] as number[],roleIds:[] as number[],status:true,remark:'',password:'',confirmPassword:''})
const title=computed(()=>props.editingUser?'编辑用户':'新增用户');const roleOptions=computed(()=>props.roles.map(role=>({label:role.roleName,value:role.id})))
const rules:FormProps['rules']={username:[{required:true,message:'请输入用户名'},{pattern:/^[A-Za-z0-9_]{4,20}$/,message:'用户名为 4-20 位字母、数字或下划线'},{validator:async(_r,value)=>{if(props.users.some(user=>user.username===value&&user.id!==props.editingUser?.id))throw new Error('用户名已存在')}}],nickname:[{required:true,message:'请输入昵称'},{max:20,message:'昵称最多 20 个字符'}],phone:[{required:true,message:'请输入手机号'},{pattern:/^1\d{10}$/,message:'请输入正确的 11 位手机号'}],email:[{required:true,message:'请输入邮箱'},{type:'email',message:'邮箱格式不正确'}],departmentPath:[{required:true,type:'array',min:1,message:'请选择部门'}],password:[{validator:async(_r,value)=>{if(!props.editingUser&&!/^.{6,20}$/.test(value))throw new Error('密码长度为 6-20 位')}}],confirmPassword:[{validator:async(_r,value)=>{if(!props.editingUser&&value!==form.password)throw new Error('两次输入的密码不一致')}}]}
watch(open,visible=>{if(!visible)return;Object.assign(form,props.editingUser?{...props.editingUser,departmentPath:departmentStore.getIdPath(props.editingUser.deptId),password:'',confirmPassword:''}:{username:'',nickname:'',phone:'',email:'',departmentPath:[],roleIds:[],status:true,remark:'',password:'',confirmPassword:''});formRef.value?.clearValidate()},{flush:'post'})
async function submit(){await formRef.value?.validate();emit('submit',{username:form.username,nickname:form.nickname,phone:form.phone,email:form.email,deptId:form.departmentPath.at(-1)!,roleIds:[...form.roleIds],status:form.status,remark:form.remark,...(!props.editingUser?{password:form.password}:{})})}
</script>
<template>
  <a-modal
    v-model:open="open"
    :title="title"
    width="720px"
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
          label="用户名"
          name="username"
        >
          <a-input
            v-model:value="form.username"
            :disabled="!!editingUser"
          />
        </a-form-item><a-form-item
          label="昵称"
          name="nickname"
        >
          <a-input
            v-model:value="form.nickname"
            :maxlength="20"
            show-count
          />
        </a-form-item>
      </div><div class="form-grid">
        <a-form-item
          label="手机号"
          name="phone"
        >
          <a-input v-model:value="form.phone" />
        </a-form-item><a-form-item
          label="邮箱"
          name="email"
        >
          <a-input v-model:value="form.email" />
        </a-form-item>
      </div><div class="form-grid">
        <a-form-item
          label="部门"
          name="departmentPath"
        >
          <a-cascader
            v-model:value="form.departmentPath"
            :options="departmentStore.treeOptions"
          />
        </a-form-item><a-form-item
          label="角色"
          name="roleIds"
        >
          <a-select
            v-model:value="form.roleIds"
            mode="multiple"
            :options="roleOptions"
          />
        </a-form-item>
      </div><div
        v-if="!editingUser"
        class="form-grid"
      >
        <a-form-item
          label="密码"
          name="password"
        >
          <a-input-password v-model:value="form.password" />
        </a-form-item><a-form-item
          label="确认密码"
          name="confirmPassword"
        >
          <a-input-password v-model:value="form.confirmPassword" />
        </a-form-item>
      </div><a-alert
        v-else
        message="如需修改密码，请使用列表中的“重置密码”操作"
        type="info"
        show-icon
        class="edit-tip"
      /><a-form-item
        label="状态"
        name="status"
      >
        <a-switch
          v-model:checked="form.status"
          checked-children="启用"
          un-checked-children="禁用"
        />
      </a-form-item><a-form-item
        label="备注"
        name="remark"
      >
        <a-textarea
          v-model:value="form.remark"
          :maxlength="200"
          :rows="3"
          show-count
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<style scoped lang="scss">.dialog-form{padding-top:10px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.edit-tip{margin-bottom:18px}@media(max-width:720px){.form-grid{grid-template-columns:1fr;gap:0}}</style>
