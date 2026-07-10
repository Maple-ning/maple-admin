<script setup lang="ts"></script>

<template>
  <a-card title="个人设置">
    <a-form layout="vertical">
      <a-form-item label="主题色">
        <a-radio-group default-value="red">
          <a-radio-button value="red">枫叶红</a-radio-button>
          <a-radio-button value="blue">科技蓝</a-radio-button>
          <a-radio-button value="green">清新绿</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="菜单密度">
        <a-radio-group default-value="default">
          <a-radio-button value="compact">紧凑</a-radio-button>
          <a-radio-button value="default">默认</a-radio-button>
          <a-radio-button value="loose">宽松</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="消息通知">
        <a-switch checked />
      </a-form-item>
      <a-form-item>
        <a-button type="primary">保存设置</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>
