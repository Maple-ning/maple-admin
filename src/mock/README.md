# Mock 接口维护说明

## 概述

项目通过 `VITE_USE_MOCK=true`（在 `.env.development` 中配置）开启 Mock。
**仅在 dev 环境生效**，打包后自动走真实服务器接口，无需手动切换。

## 核心思路

> **一个模块一个文件，数据 + 接口写在一起。**

打开 `src/mock/modules/user.ts` 看一眼就懂了：
最上面是数据定义，下面是 `registerMock()` 注册的接口，所有相关的东西都在同一个文件里。

## 目录约定

```
src/mock/
  index.ts             ← 入口，自动加载 modules/ 下所有文件（无需手动引入）
  modules/
    user.ts            ← 用户 & 认证的数据 + 接口
    menu.ts            ← 菜单的数据 + 接口
    ...                 ← 继续添加新模块
```

## 新增接口（只需两步）

### 第 1 步

在 `src/mock/modules/` 下新建文件，比如 `product.ts`：

```ts
import { registerMock, mockResponse, mockError } from '@/utils/request'

// ── 数据定义 ──────────────────────────
let products = [
  { id: 1, name: '商品A', price: 99 },
  { id: 2, name: '商品B', price: 199 },
]

// ── 接口注册 ──────────────────────────
registerMock('GET', '/product/list', ({ query }) => {
  const keyword = query?.get('keyword') || ''
  const list = keyword
    ? products.filter(p => p.name.includes(keyword))
    : products
  return mockResponse(list)
})

registerMock('POST', '/product', ({ body }) => {
  const newProduct = { id: Date.now(), ...body }
  products.push(newProduct)
  return mockResponse(newProduct, 0, '创建成功')
})

registerMock('DELETE', '/product/:id', ({ url }) => {
  const id = Number(url.split('/').pop())
  products = products.filter(p => p.id !== id)
  return mockResponse(null, 0, '删除成功')
})
```

### 第 2 步

**不需要做任何事** —— `src/mock/index.ts` 会自动发现并加载所有 `modules/*.ts` 文件。

## 返回格式

| 工具函数 | 用途 | 示例 |
|---|---|---|
| `mockResponse(data)` | 正常返回 | `mockResponse({ id: 1 })` |
| `mockResponse(data, code, msg)` | 带状态码 | `mockResponse(null, 0, '成功')` |
| `mockError(msg, code)` | 错误返回 | `mockError('参数错误', 400)` |
| `mockPaginatedResponse(list, page, pageSize)` | 分页返回 | `mockPaginatedResponse(users, 1, 10)` |

请求层（`src/utils/request.ts`）会自动解包 `{ code, data, message }`，业务代码只拿到 `data`。

## 核心 API

```ts
// 精确匹配
registerMock('GET', '/user/list', handler)

// 动态路由参数（:id 匹配任意数字）
registerMock('GET', '/user/:id', handler)
registerMock('PUT', '/user/:id', handler)

// 批量操作
registerMock('DELETE', '/user/batch', handler)
```

## 环境说明

| 环境 | VITE_USE_MOCK | 行为 |
|---|---|---|
| `npm run dev` | `true` | Mock 生效，请求被 axios 适配器拦截 |
| `npm run build` | `false` | Mock 代码被 tree-shake 移除，请求发往真实服务器 |
