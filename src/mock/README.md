# Mock 接口维护说明

项目开发环境通过 `VITE_USE_MOCK=true` 开启 Mock。入口在 `src/mock/index.ts`，由 `src/main.ts` 在应用挂载前加载，确保首屏请求前接口已经注册完成。

## 目录约定

- `src/mock/index.ts`：统一注册入口，只负责调用各模块的 `registerXxxMocks`。
- `src/mock/handlers/`：按业务模块放接口，例如 `auth.ts`、`user.ts`。
- `src/mock/data/`：按业务模块放接口需要复用或持久变更的默认数据，例如 `user.ts`、`menu.ts`、`dict.ts`。
- `src/utils/request.ts`：提供 `registerMock`、`mockResponse`、`mockError`、`mockPaginatedResponse`。

## 新增接口步骤

1. 如果接口需要默认数据，先在 `src/mock/data/` 新建或扩展同名业务数据文件，例如用户数据放 `data/user.ts`。
2. 在 `src/mock/handlers/` 中按同名业务模块新增 handler 文件，或追加到已有业务模块。
3. 使用 `registerMock(method, url, handler)` 注册接口。
4. 在 `src/mock/index.ts` 引入并调用新的 `registerXxxMocks()`。
5. 保持 URL 与 `src/api/` 中真实接口路径一致。

## 示例

```ts
// src/mock/data/product.ts
export const mockProducts = [
  { id: 1, name: "示例商品", status: "enabled" },
];
```

```ts
// src/mock/handlers/product.ts
import { mockProducts } from "../data/product";
import { mockResponse, registerMock } from "@/utils/request";

export function registerProductMocks() {
  registerMock("GET", "/product/list", () => {
    return mockResponse(mockProducts);
  });
}
```

```ts
// src/mock/index.ts
import { registerProductMocks } from "./handlers/product";

registerProductMocks();
```

## 返回格式

正常响应统一使用：

```ts
mockResponse(data);
```

错误响应统一使用：

```ts
mockError("错误信息", 400);
```

分页响应统一使用：

```ts
mockResponse(mockPaginatedResponse(list, page, pageSize));
```

请求层会自动解包 `{ code, data, message }`，业务代码拿到的是 `data` 字段。
