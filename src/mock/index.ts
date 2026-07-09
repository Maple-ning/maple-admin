/**
 * Mock 入口 —— 自动发现并加载 src/mock/modules/ 下所有模块
 *
 * 新增接口只需两步：
 *   1. 在 src/mock/modules/ 下新建 xxx.ts
 *   2. 在文件里用 registerMock() 注册接口 + 定义数据
 *
 * 无需手动修改本文件，模块会被自动加载。
 *
 * 仅在 dev 环境 + VITE_USE_MOCK=true 时生效。
 */
const modules = import.meta.glob('./modules/*.ts', { eager: true })

if (import.meta.env.DEV) {
  console.log(`[Mock] 已加载 ${Object.keys(modules).length} 个模块`)
}
