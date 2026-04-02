# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- 移动端: Expo SDK 51 + React Native 0.74（`apps/mobile/`）
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
pnpm --filter @focusflow/api test -- --reporter=verbose src/__tests__/routes/auth.test.ts  # 单文件测试（后端）
pnpm --filter @focusflow/mobile test -- --testPathPattern=timerStore  # 单文件测试（前端）
pnpm typecheck                # 全项目类型检查
pnpm lint                     # 全项目 lint
```

**调试端点（无需登录）：**

- `GET /health/detail` — 所有子系统状态
- `GET /openapi.json` — API 文档（dev 模式）

**测试账号（seed 数据自动注入）：**

- email: `test@focusflow.app` / password: `Test123456`

**iOS 模拟器注意：** 如果本机开了代理（如 Clash），Metro 连接会被拦截。需在 `AppDelegate.mm` 把 localhost 硬编码为本机 LAN IP（如 `192.168.x.x:8081`），或临时关闭代理。

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

`timerStore` 的 `getElapsedSeconds()` 始终从 `startTime` 时间戳计算，`setInterval` 只用于强制 re-render（每秒 tick）。

### 内存存储（本地开发）

`services/api/src/db/memory-store.ts` — 零依赖本地 DB，服务重启数据重置。
迁移到 Supabase 时**只需替换** `db/client.ts` 和各 service 文件，路由/中间件/测试不动。

### 软删除规则

Subject（分类）只能软删除：`isDeleted = true`，历史数据必须保留。
**禁止硬删 subjects**，会破坏历史 time_records 的外键关联。

### 深色模式切换

用 `Appearance.setColorScheme()` 覆盖系统主题，`useColorScheme()` 会在全 app 范围内自动重渲染。
用户偏好持久化在 `apps/mobile/stores/preferencesStore.ts`（AsyncStorage），App 启动时通过 `onRehydrateStorage` 恢复。
**不要**改用 React Context 方案——`packages/ui` 没有 `@types/react`，会 TS7016 报错。

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

### 前端 Jest 注意事项

- `transformIgnorePatterns` 必须包含 `\\.pnpm`，否则 pnpm 虚拟链接路径的包（如 `@react-native/js-polyfills`）不会被 Babel 转译
- `@expo/vector-icons` 需在 `jest.setup.ts` 中 mock，用 `React.createElement(Text, ...)` 而非直接调用（Text 在 Jest 中是 class）

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

`useBreakpoint()` 返回的 `navType` 决定导航组件（见 `app/(app)/_layout.tsx`）：

- `tabbar` → `PhoneTabBar`（< 768px）
- `drawer` → `TabletDrawer`（768–1279px）
- `sidebar` → `DesktopSidebar`（≥ 1280px）

**禁止用 `Platform.OS` 判断布局**，应基于尺寸断点。

### Expo Router 路径注意

`usePathname()` 会剥去路由组前缀：`/(app)/stats` → `/stats`，`/(app)` → `/`。
做路由匹配（如 tab bar 的 active 判断）时需先用 `strip` 函数标准化：

```typescript
const strip = (p: string) => p.replace(/^\/\([^)]+\)/, "") || "/";
```

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

主要 token（`packages/ui/src/theme/tokens.ts`）：

| Token           | Dark      | Light     |
| --------------- | --------- | --------- |
| `bg-page`       | `#0B0B0E` | `#F4F4F8` |
| `bg-card`       | `#16161A` | `#FFFFFF` |
| `bg-elevated`   | `#1A1A1E` | `#EEEEF3` |
| `border-subtle` | `#2A2A2E` | `#E5E5EA` |
| `accent-indigo` | `#6366F1` | `#6366F1` |
| `text-tertiary` | `#4A4A50` | `#9E9EA5` |

设计稿：`pencil-new.pen`（Pencil 工具），5 个暗色页面 + 1 个亮色 Home + Design System 文档。

---

## 尚未实现（TODO）

- [ ] `apps/mobile/app/(auth)/sign-in.tsx` — 登录/注册页（文件存在但为空壳）
- [ ] Supabase 迁移（替换内存存储）
- [ ] EAS Build 配置
- [ ] AI 分析完整接入（`/v1/ai` 路由已存在，前端未接入）
- [ ] 数据导出（图片/PDF）
- [ ] 统计/日历/目标页接真实 API（当前使用 `apps/mobile/lib/mock.ts` mock 数据）
