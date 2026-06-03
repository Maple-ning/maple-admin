# 项目规范

## 一、技术栈
- Vue 3（组合式 API + `<script setup>`）
- Pinia（状态管理）
- TypeScript（严格模式）
- Vite（推荐）

## 二、组件规范
### 1. 必须使用 `<script setup>` 语法
```vue
<script setup lang="ts">
// 组件逻辑
</script>
```

### 2. 组件命名
文件名：PascalCase，如 UserProfile.vue

在模板中使用：PascalCase 或 kebab-case（推荐统一用 PascalCase）
### 3. Props 定义（必须带类型）
```typescript
// ✅ 推荐
interface Props {
  title: string
  count?: number
  onUpdate?: (value: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
```

### 4. Emits 定义（必须带类型）
```typescript
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'close'): void
}>()
```

### 5. 组件内部结构顺序（从上到下）
1.<script setup> 中的类型导入
2.defineProps / defineEmits
3.defineExpose（仅在必要时）
4.组合式函数调用（useXxx）
5.ref / reactive / computed
6.普通函数 / 事件处理函数
7.watch / watchEffect
8.生命周期钩子（onMounted 等）

## 三、TypeScript 规范
- 禁止使用 any（若必须用 unknown + 类型守卫）

- 为所有 ref / reactive / computed 声明类型

- 优先使用 interface 定义对象类型，使用 type 定义联合/工具类型

- 导出公共类型到 types/ 目录

```typescript
// ✅ ref 类型
const count = ref<number>(0)

// ✅ reactive 类型
interface State {
  name: string
  age: number
}
const state = reactive<State>({ name: '', age: 0 })
```

## 四、Pinia 状态管理规范

### 1.Store 命名

- 文件名：`useXxxStore.ts`（如 `useUserStore.ts`）
- store 定义：使用 `defineStore`，id 与文件名一致



### 2.Store 模板（选项式或组合式，推荐组合式）

```typescript
// stores/useCounterStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  
  // getters
  const doubleCount = computed(() => count.value * 2)
  
  // actions
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

### 3.使用规范

- 在组件中使用：`const store = useCounterStore()`

- 解构时保持响应式：使用 `storeToRefs`

  ```typescript
  import { storeToRefs } from 'pinia'
  const { count, doubleCount } = storeToRefs(useCounterStore())
  const { increment } = useCounterStore()
  ```

  

## 五、组合式函数（Composables）

- 文件名：`useXxx.ts`，放在 `composables/` 目录
- 返回值用对象包裹，便于解构
- 内部使用 `ref` / `reactive` / `watch` / 生命周期

```typescript
// composables/useLocalStorage.ts
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const data = ref<T>(initialValue)
  watch(data, () => {
    localStorage.setItem(key, JSON.stringify(data.value))
  })
  return { data }
}
```

## 六、样式规范

- 使用 `<style scoped>` 避免样式泄漏

- 语言：`<style scoped lang="scss">`（推荐 SCSS）

- 类名：**kebab-case**（如 `.user-card`）

- 全局样式放在 `src/styles/` 中，使用 `:root` 定义 CSS 变量

  ```typescript
  <style scoped lang="scss">
  .user-card {
    padding: 16px;
    border-radius: 8px;
  }
  </style>
  ```

## 七、目录结构（最小要求）

```tex
src/
├── assets/          # 静态资源
├── components/      # 公共组件
├── composables/     # 组合式函数
├── layouts/         # 布局组件
├── pages/           # 页面组件（路由目标）
├── router/          # 路由配置
├── stores/          # Pinia store
├── types/           # 全局 TS 类型
├── utils/           # 工具函数
├── App.vue
└── main.ts
```

## 八、代码格式化（推荐配置）

- 使用 ESLint + Prettier
- 缩进：2 空格
- 单引号
- 分号：必须
- 每行最大长度：100 字符



## 九、禁止事项

- ❌ 在模板中使用复杂表达式（提取到 computed）
- ❌ 直接修改 props
- ❌ 在 watch 中修改监听的数据（除非配置 `flush: 'post'`）
- ❌ 滥用 `nextTick`（优先使用 `watch` 或 `onUpdated`）
- ❌ 在组件中直接导入 store 并解构（忘记 `storeToRefs` 会丢失响应式）





## 十、响应要求（针对 AI）

- 生成代码时，必须遵循上述规范
- 提供完整可运行的组件或 store
- 如果需求不明确，先提出澄清问题
- 输出代码块时标注语言（`vue` / `ts` / `scss`）