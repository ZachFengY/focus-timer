# FocusFlow — Claude 工作规范

## 原有规则（保留）

- never edit generated SDK
- always add idempotency test for payments
- migration must include rollback

---

## 项目概览

**FocusFlow** 是一款时间追踪 App，核心闭环：计时 → 统计 → 目标 → AI 分析。

**技术栈：**

- Monorepo: Turborepo + pnpm workspaces
- 后端: Hono + TypeScript（`services/api/`）
- 移动端: Expo + React Native（`apps/mobile/`）
- 共享类型: Zod schemas（`packages/types/`）
- API 客户端: TanStack Query hooks（`packages/api-client/`）
- 设计系统: NativeWind + 主题 tokens（`packages/ui/`）

---

## 关键命令

```bash
cp .env.example .env          # 首次配置
pnpm install                  # 安装依赖
# 国内网络超时时改用：
pnpm install --registry https://registry.npmmirror.com

pnpm dev:api                  # 启动后端 → localhost:3000
pnpm dev:mobile               # 启动 Expo
pnpm --filter @focusflow/api test          # 后端测试（Vitest）
pnpm --filter @focusflow/mobile test       # 前端测试（Jest）
pnpm typecheck                # 全项目类型检查
pnpm lint                     # 全项目 lint
```

**调试端点（无需登录）：**

- `GET /health/detail` — 所有子系统状态
- `GET /openapi.json` — API 文档（dev 模式）

**测试账号（seed 数据自动注入）：**

- email: `test@focusflow.app` / password: `Test123456`

---

## 架构决策（不要随意改动）

### 薄客户端（Thin Client）原则

前端 **只负责 UI 渲染**，业务逻辑全部在后端。

- ✅ 组件从 `@focusflow/api-client` hooks 拉数据
- ✅ `timerStore` 只管 UI 状态（计时显示）
- ❌ 禁止在 React 组件里写业务计算（统计、进度、目标等）
- ❌ 禁止前端直连数据库

### 计时器关键逻辑（核心，改动需跑完整测试）

```typescript
// ✅ 正确：基于时间戳计算，防止后台漂移
duration = Date.now() - startTime - totalPausedMs;

// ❌ 错误：不能只依赖 setInterval
```

### 内存存储（本地开发）

`services/api/src/db/memory-store.ts` — 零依赖本地 DB，服务重启数据重置。
迁移到 Supabase 时**只需替换** `db/client.ts` 和各 service 文件，路由/中间件/测试不动。

### 软删除规则

Subject（分类）只能软删除：`isDeleted = true`，历史数据必须保留。
**禁止硬删 subjects**，会破坏历史 time_records 的外键关联。

---

## 数据库结构

```
users(id, email, passwordHash)
  └─ subjects(id, userId, name, color, isDeleted)
  └─ time_records(id, userId, subjectId, mode, duration, startTime, endTime)
       └─ pause_records(id, timeRecordId, startTime, endTime)
  └─ goals(id, userId, type, targetDuration, subjectId)
```

Supabase 迁移文件：`services/supabase/migrations/`，执行顺序：001 → 002 → 003。

---

## 测试规范（生产要求，不可妥协）

### 覆盖率门槛

| 范围           | 行覆盖 | 函数覆盖 |
| -------------- | ------ | -------- |
| 后端（Vitest） | ≥ 80%  | ≥ 80%    |
| 前端（Jest）   | ≥ 75%  | ≥ 75%    |

### 每次新功能必须覆盖的场景

1. **用户隔离** — 用户 A 不能读/写用户 B 的数据
2. **软删除** — 删除后数据仍在 store，不出现在列表
3. **计时器后台漂移** — `getElapsedSeconds` 必须有时间戳测试
4. **Auth 边界** — 无 token、错误 token 均测 401
5. **Zod 校验** — 无效入参测 422

### 测试隔离

每个后端测试前 `db.clear()`，已在 `src/__tests__/setup.ts` 全局配置，不要手动调用。

---

## 日志与调试规范

```typescript
// ✅ 结构化日志，带上下文
log.info({ userId, recordId, duration }, "✓ Time record saved");
log.warn({ requestId, path }, "Auth failed: missing token");
log.error({ err, requestId }, "Unhandled error");

// ❌ 禁止用 console.log（ESLint 报错）
```

每个请求有唯一 `x-request-id`，可跨日志追踪完整链路。
慢请求（> 500ms）自动 warn 日志，无需手动加。

### 常见报错速查

| 错误                                   | 原因              | 解法                                           |
| -------------------------------------- | ----------------- | ---------------------------------------------- |
| `401 Missing authorization token`      | 没带 Bearer       | 检查 `setAuthToken()` 在登录后是否调用         |
| `422 VALIDATION_ERROR`                 | Zod 校验失败      | 看响应的 `details.fieldErrors`                 |
| `JWT_SECRET must be at least 32 chars` | .env 未配置       | `cp .env.example .env`                         |
| `pnpm i` Socket timeout                | npm registry 不稳 | 加 `--registry https://registry.npmmirror.com` |

---

## 代码规范

### 跨包引用

```typescript
// ✅ 正确
import { useColors } from "@focusflow/ui";
import type { TimeRecord } from "@focusflow/types";

// ❌ 禁止跨包用相对路径
import { useColors } from "../../packages/ui/src/...";
```

### Service 层规则

- Service 类负责业务逻辑；路由文件只解析参数、格式化响应
- Service 抛 `HTTPException`，不抛 `Error`
- 用 `createLogger({ service: 'XxxService' })` 创建子 logger

### 新增 API 路由 Checklist

- [ ] Zod schema 写在 `packages/types/src/` 里
- [ ] 路由用 `AuthContext` 类型，`c.get('userId')` 取用户 ID
- [ ] Service 文件写业务逻辑
- [ ] 在 `src/index.ts` 注册路由
- [ ] 写路由测试（正常 + 无权限 + 无效参数）

---

## 响应式布局

`useBreakpoint()` 返回的 `navType` 决定导航组件：

- `tabbar` → `PhoneTabBar`（< 768px）
- `drawer` → `TabletDrawer`（768–1279px）
- `sidebar` → `DesktopSidebar`（≥ 1280px）

**禁止用 `Platform.OS` 判断布局**，应基于尺寸断点。

---

## 设计系统

颜色用 `useColors()` 获取，禁止硬编码颜色值。

```typescript
// ✅
const c = useColors()
style={{ backgroundColor: c('bg-card'), borderColor: c('border-subtle') }}

// ❌
style={{ backgroundColor: '#16161A' }}
```

设计稿：`pencil-new.pen`（Pencil 工具），5 个暗色页面 + 1 个亮色 Home + Design System 文档。

---

## 尚未实现（TODO）

- [ ] `apps/mobile/app/(auth)/sign-in.tsx` — 登录/注册页
- [ ] `apps/mobile/app/(app)/stats/` — 统计页
- [ ] `apps/mobile/app/(app)/calendar/` — 日历页
- [ ] `apps/mobile/app/(app)/goals/` — 目标页
- [ ] `apps/mobile/app/(app)/settings/` — 设置页
- [ ] Supabase 迁移（替换内存存储）
- [ ] EAS Build 配置
- [ ] AI 分析完整接入
- [ ] 数据导出（图片/PDF）
