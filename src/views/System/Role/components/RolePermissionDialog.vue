<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TreeProps } from 'ant-design-vue'
import type { SystemMenu } from '@/api/system/menu'
import type { SystemRole } from '@/api/system/role'

interface TreeNode { key: number; title: string; type: SystemMenu['type']; children?: TreeNode[] }
const props = withDefaults(defineProps<{ role?: SystemRole | null; menus: SystemMenu[]; confirmLoading?: boolean }>(), { role: null, confirmLoading: false })
const emit = defineEmits<{ submit: [menuIds: number[]] }>()
const open = defineModel<boolean>('open', { default: false })
const checkedKeys = ref<number[]>([]), halfCheckedKeys = ref<number[]>([]), expandedKeys = ref<number[]>([])

const treeData = computed(() => {
  const map = new Map<number, TreeNode>(props.menus.map((item) => [item.id, { key: item.id, title: item.name, type: item.type, children: [] }]))
  const roots: TreeNode[] = []
  props.menus.forEach((item) => (item.parentId === 0 ? roots : map.get(item.parentId)?.children)?.push(map.get(item.id)!))
  map.forEach((node) => { if (!node.children?.length) delete node.children })
  return roots
})
const allIds = computed(() => props.menus.map((item) => item.id))
watch(open, (visible) => { if (visible) { checkedKeys.value = [...(props.role?.menuIds || [])]; halfCheckedKeys.value = []; expandedKeys.value = treeData.value.map((node) => node.key) } })
const handleCheck: TreeProps['onCheck'] = (keys, info) => { checkedKeys.value = (Array.isArray(keys) ? keys : keys.checked).map(Number); halfCheckedKeys.value = (info.halfCheckedKeys || []).map(Number) }
function toggleTree() { expandedKeys.value = expandedKeys.value.length ? [] : [...allIds.value] }
function toggleAll() { checkedKeys.value = checkedKeys.value.length === allIds.value.length ? [] : [...allIds.value]; halfCheckedKeys.value = [] }
function submit() { emit('submit', [...new Set([...checkedKeys.value, ...halfCheckedKeys.value])]) }
</script>

<template>
  <a-modal
    v-model:open="open"
    title="分配菜单权限"
    width="900px"
    ok-text="确认分配"
    cancel-text="取消"
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    @ok="submit"
  >
    <div class="permission-head">
      <div><strong>{{ role?.roleName }}</strong><span>已选择 {{ checkedKeys.length }} 个权限节点</span></div><a-space>
        <a-button
          size="small"
          @click="toggleTree"
        >
          {{ expandedKeys.length ? '折叠全部' : '展开全部' }}
        </a-button><a-button
          size="small"
          @click="toggleAll"
        >
          {{ checkedKeys.length === allIds.length ? '取消全选' : '全选' }}
        </a-button>
      </a-space>
    </div>
    <div class="permission-tree">
      <a-tree
        v-model:expanded-keys="expandedKeys"
        :checked-keys="checkedKeys"
        :tree-data="treeData"
        checkable
        block-node
        @check="handleCheck"
      >
        <template #title="node">
          <span class="tree-title"><span :class="['node-type',node.type]">{{ node.type==='dir'?'目录':node.type==='menu'?'菜单':'按钮' }}</span>{{ node.title }}</span>
        </template>
      </a-tree>
    </div>
  </a-modal>
</template>

<style scoped lang="scss">
.permission-head{display:flex;align-items:center;justify-content:space-between;padding:2px 0 16px}.permission-head>div{display:flex;flex-direction:column;gap:4px}.permission-head span{color:#8a989f;font-size:12px}.permission-tree{height:min(58vh,520px);padding:14px 18px;overflow:auto;background:#f8fbfa;border:1px solid #e5eeee;border-radius:10px}.tree-title{display:inline-flex;align-items:center;gap:8px}.node-type{padding:1px 6px;color:#168b7e;font-size:10px;background:#e6f6f3;border-radius:4px}.node-type.btn{color:#b46d16;background:#fff4df}.node-type.dir{color:#386fb5;background:#eaf2ff}@media(max-width:720px){.permission-head{align-items:flex-start;flex-direction:column;gap:12px}}
</style>
