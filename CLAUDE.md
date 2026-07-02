# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 角色

资深财经产品经理助手并且有全栈开发能力，产出中文。

## 核心规则

- 永远使用中文进行文档撰写和交流
- 需求模糊或矛盾时用提问澄清，禁止猜测
- 宽泛指令时先梳理大纲确认范围再细化
- 发现可优化点时用商量语气提出，不强行改变需求
- **只改我让你修改的部分，其他的不要修改**

## 开发流程

- 每次开发前必须先生成测试验收标准
- 复杂/大量改动时必须走 TDD 流程
- 优先使用项目已有的组件和模式
- 页面改动后运行 `pnpm build` 确保零错误

## Git 发布规则

- 日常改动：提交到功能分支
- 正式发布：等用户明确指令后再合并

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 16.1 (App Router + Turbopack) |
| UI 组件库 | shadcn/ui (纽约风格) + Radix UI + Lucide Icons |
| 样式 | Tailwind CSS v4 + CSS 变量 (Clean Blue 设计系统) + next-themes 暗色模式 |
| 状态管理 | React Context + useReducer |
| 表单 | react-hook-form + Zod |
| 数据库 | Drizzle ORM + sql.js (WASM SQLite) |
| 持久化 | data/ims.db — 每 5s 自动存盘 |
| 测试 | Playwright E2E |
| 包管理 | pnpm 9.0 |

## 命令

```bash
pnpm dev         # 启动开发服务器 (localhost:5002)
pnpm build       # 生产构建
pnpm start       # 启动生产服务器 (localhost:5002)
pnpm ts-check    # TypeScript 类型检查
pnpm lint        # ESLint 代码检查
```

## 项目结构

```text
保险系统/
├── CLAUDE.md                              # 本文件
├── package.json
├── next.config.ts
├── tsconfig.json
├── components.json                        # shadcn/ui 配置
├── postcss.config.mjs
├── src/
│   ├── instrumentation.ts                 # 服务启动钩子（autoMigrate + autoSave）
│   ├── app/
│   │   ├── globals.css                    # Clean Blue 设计系统 + 暗色模式
│   │   ├── layout.tsx                     # 根布局（ThemeProvider > AppProvider > AppLayout）
│   │   ├── page.tsx                       # 首页 → 重定向到 /policy-manage/applications
│   │   ├── basic-info/                    # 基础信息模块
│   │   │   ├── exchange-rates/page.tsx    # 保费汇率配置
│   │   │   └── insurance-rates/page.tsx   # 保费费率配置
│   │   ├── policy-manage/                 # 保单管理模块
│   │   │   └── applications/
│   │   │       ├── page.tsx              # 投保申请列表（33 列 + 列设置 + 导出）
│   │   │       └── [id]/
│   │   │           ├── page.tsx          # 投保单详情（7 段 + 历史面板 + 版本对比）
│   │   │           └── edit/page.tsx     # 编辑投保单（7 段表单 + 差异高亮）
│   │   ├── claims/                        # 报案理赔模块
│   │   │   └── reports/
│   │   │       ├── page.tsx              # 报案列表 + 理赔确认
│   │   │       ├── new/page.tsx          # 新增报案
│   │   │       └── [id]/page.tsx         # 报案详情（Descriptions 3 段）
│   │   └── api/
│   │       ├── applications/route.ts      # 投保申请 CRUD
│   │       ├── claims/route.ts            # 报案理赔 CRUD
│   │       ├── exchange-rates/route.ts    # 汇率配置 CRUD
│   │       ├── insurance-rates/route.ts   # 费率配置 CRUD + 批量操作
│   │       ├── history/route.ts           # 历史版本/审批/修改日志
│   │       ├── dict/route.ts              # 下拉选项字典
│   │       ├── column-configs/route.ts    # 用户列配置
│   │       └── export/route.ts            # Excel 导出
│   ├── components/
│   │   ├── layout/AppLayout.tsx           # 全局布局（深色侧栏 + 顶栏面包屑）
│   │   ├── ThemeProvider.tsx              # 主题 Provider
│   │   ├── ThemeToggle.tsx                # 主题切换按钮
│   │   ├── SectionHead.tsx                # 段落标题（蓝色左边框）
│   │   ├── ColumnSettings.tsx             # 列设置 Popover（勾选/拖拽排序/置顶）
│   │   ├── HistoryPanel.tsx               # 历史面板（版本/审批/日志 三标签）
│   │   └── ui/                            # shadcn/ui 组件
│   │       ├── button.tsx, card.tsx, input.tsx, badge.tsx
│   │       ├── table.tsx, select.tsx, textarea.tsx, dialog.tsx
│   │       ├── alert-dialog.tsx, checkbox.tsx, label.tsx
│   │       ├── popover.tsx, tabs.tsx, dropdown-menu.tsx
│   │       ├── form.tsx, separator.tsx, sonner.tsx
│   │       ├── timeline.tsx               # 自定义 Timeline
│   │       ├── descriptions.tsx           # CSS Grid 描述列表（替代 Ant Design Descriptions）
│   │       └── file-upload.tsx            # 文件上传组件
│   ├── db/
│   │   ├── schema.ts                      # Drizzle ORM Schema（8 个表）
│   │   ├── index.ts                       # DB 初始化 + CRUD 辅助函数
│   │   └── seed.ts                        # 建表 + 种子数据 + autoMigrate
│   ├── hooks/
│   │   └── usePersistedConfig.ts          # 列配置持久化（API + localStorage 双写）
│   ├── lib/
│   │   ├── types.ts                       # 全部类型定义 + 下拉选项常量
│   │   ├── store.tsx                      # Context + useReducer 全局状态
│   │   ├── navigation.tsx                 # 导航配置（3 模块）
│   │   ├── utils.ts                       # cn() 工具函数
│   │   ├── field-defs.ts                  # 共享字段定义（SectionDef[] + JSON 段落映射）
│   │   └── field-registry.tsx             # 字段渲染器注册表（只读/编辑）
│   └── types/
│       └── sql-js.d.ts                    # sql.js 类型声明
├── data/
│   └── ims.db                             # SQLite 数据库文件（不提交 Git）
├── e2e/                                   # Playwright E2E 测试
└── docs/                                  # 设计文档
```

## 路由表

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 重定向到投保申请列表 |
| `/basic-info/exchange-rates` | 保费汇率配置 | 汇率 CRUD |
| `/basic-info/insurance-rates` | 保费费率配置 | 费率 CRUD + 批量启用/禁用 |
| `/policy-manage/applications` | 投保申请表 | 33 列大表 + 列设置 + 版本切换 + 导出 |
| `/policy-manage/applications/[id]` | 投保单详情 | 7 段只读 + HistoryPanel + 版本对比 |
| `/policy-manage/applications/[id]/edit` | 编辑投保单 | 7 段表单 + 差异高亮 + 未保存保护 |
| `/claims/reports` | 报案理赔管理 | 列表 + 搜索 + 理赔确认 |
| `/claims/reports/new` | 新增报案 | 3 段表单 |
| `/claims/reports/[id]` | 报案详情 | Descriptions 3 段 |

## 关键设计模式

### 字段定义共享（field-defs.ts）

详情页和编辑页共享 `lib/field-defs.ts` 中的 `sections: SectionDef[]` 配置。每个 Section 包含标题和字段数组，通过 `SECTION_JSON_MAP` 映射字段到对应 JSON 段落。修改字段只需改一处，两页同步生效。

### 乐观双重写入（store.tsx）

CIM2.0 模式：`dispatch(action)` 立即更新 UI + `fetch('/api/...')` 异步同步后端。API 错误静默忽略。

### JSON 列存储（schema.ts）

投保申请的 65 个字段按 7 个段落分组为 JSON 文本列（applicant_info / transport_info / cargo_info / insurance_info / backfill_info / correction_info），高频搜索字段保留为独立列。

### 列配置双写（usePersistedConfig）

`usePersistedConfig` hook：API 保存 + localStorage 同步写入（离线降级）。

### 版本管理

insurance_applications 表通过 `version` / `is_latest` / `previous_id` 三字段管理多版本。列表支持"当前有效"/"全部记录"视图切换，详情/编辑页支持版本间字段级差异对比。
