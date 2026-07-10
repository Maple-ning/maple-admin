# Maple Admin

Maple Admin 是一个基于 Vue 3、Vite、TypeScript、Pinia、Vue Router 和 Ant Design Vue 的后台管理系统模板。项目内置登录、Mock 接口、动态路由、菜单权限、角色权限和基础布局，适合用作中后台项目起步模板。

## 特性

- 基于后端菜单生成动态路由
- 支持角色和权限码控制菜单
- 支持隐藏路由注册但不显示在菜单中
- 登录后自动进入当前用户第一个可访问页面
- 区分 403 无权限和 404 路由不存在
- 内置 Mock 用户、菜单和权限数据
- 顶部一级菜单 + 左侧二级菜单布局

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Ant Design Vue
- Axios
- Sass

## 启动

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

## 环境变量

复制 `.env.example` 为 `.env.development` 或按环境自行配置。

```env
VITE_USE_MOCK=true
VITE_API_BASE_URL=
```

## Mock 账号

| 用户名 | 密码 | 角色 | 可访问菜单 |
| --- | --- | --- | --- |
| admin | 123456 | admin | 全部菜单 |
| viewer | 123456 | viewer | 仪表盘 / 总览 |
| operator | 123456 | operator | 仪表盘、用户列表、订单列表、商品管理、个人中心 |
| manager | 123456 | manager | 仪表盘、系统管理、业务示例、日志审计、个人中心 |

切换账号测试权限时，请先登出，确保动态路由和菜单状态被重置。

## 权限模型

菜单数据使用 `perms` 表示权限码：

```ts
{
  title: '用户管理',
  path: '/system/user',
  component: '@/views/System/User/List.vue',
  perms: 'system:user:list'
}
```

规则：

- `admin` 角色或 `*` 权限拥有全部访问权。
- 叶子菜单必须满足自身 `perms` 才会注册为路由。
- 目录菜单只有在过滤后仍存在可访问子菜单时才显示。
- `hidden: true` 的路由会注册，但不会显示在菜单中，适合详情页。
- 没有任何可访问菜单时跳转到 `/403`。

## 菜单字段

| 字段 | 说明 |
| --- | --- |
| id | 菜单 ID |
| parentId | 父级菜单 ID |
| title | 菜单标题 |
| path | 路由路径 |
| component | 组件路径，顶级布局使用 `Layout` |
| icon | Ant Design Vue 图标名 |
| redirect | 默认跳转地址 |
| hidden | 是否隐藏菜单，仅注册路由 |
| sort | 排序字段 |
| perms | 权限码，多个权限可用英文逗号分隔 |
| children | 子菜单 |

## 目录结构

```text
src
├── api              接口定义
├── directives       权限指令
├── hooks            登录和权限 Hooks
├── layouts          后台布局
├── mock             Mock 接口和数据
├── router           路由和动态路由转换
├── stores           Pinia 状态
├── types            类型定义
├── utils            请求、图标、权限工具
└── views            页面
```

## 后端接入约定

真实后端只需要按当前菜单结构返回用户可见的菜单树，或者返回全量菜单后由前端根据用户权限过滤。推荐后端同时返回：

- token
- userInfo
- roles
- permissions
- menu tree

如果后端已经过滤菜单，前端过滤逻辑仍可以作为兜底校验。
