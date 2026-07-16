<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormProps } from 'ant-design-vue'
import type { SystemUser } from '@/api/system/user'
const {user=null,confirmLoading=false}=defineProps<{user?:SystemUser|null;confirmLoading?:boolean}>();const emit=defineEmits<{submit:[password:string]}>();const open=defineModel<boolean>('open',{default:false});const formRef=ref<FormInstance>();const form=reactive({password:'',confirmPassword:''})
const rules:FormProps['rules']={password:[{required:true,message:'请输入新密码'},{min:6,max:20,message:'密码长度为 6-20 位'}],confirmPassword:[{required:true,message:'请确认新密码'},{validator:async(_r,value)=>{if(value!==form.password)throw new Error('两次输入的密码不一致')}}]};watch(open,visible=>{if(visible){Object.assign(form,{password:'',confirmPassword:''});formRef.value?.clearValidate()}},{flush:'post'});async function submit(){await formRef.value?.validate();emit('submit',form.password)}
</script>
<template>
  <a-modal
    v-model:open="open"
    title="重置密码"
    width="480px"
    ok-text="确认重置"
    cancel-text="取消"
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    @ok="submit"
  >
    <a-alert
      :message="`正在重置 ${user?.nickname||''} 的密码`"
      type="warning"
      show-icon
    /><a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      layout="vertical"
      class="password-form"
    >
      <a-form-item
        label="新密码"
        name="password"
      >
        <a-input-password
          v-model:value="form.password"
          placeholder="6-20 位密码"
        />
      </a-form-item><a-form-item
        label="确认密码"
        name="confirmPassword"
      >
        <a-input-password v-model:value="form.confirmPassword" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<style scoped>.password-form{margin-top:18px}</style>
