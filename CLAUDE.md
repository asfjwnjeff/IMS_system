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

- **每次开发前必须先生成测试验收标准**，列出功能点、边界情况、交互状态（加载/空/错误/极端数据）。验收时逐条对照通过，未通过标准前不得宣布完成
- **复杂/大量改动时必须走 TDD 流程**（先写 Playwright E2E → 验证失败 → 实现 → 通过）
- 优先使用项目已有的组件和模式，不引入不必要的第三方依赖
- 页面改动后运行 `npm run build` 确保零错误

## Git 发布规则

- **日常改动**：提交到功能分支（如 `feat/xxx`、`fix/xxx`），**禁止直接推 main**
- **正式发布**：必须等用户明确说"正式发布"/"发布上线"等指令后，再合并到 main 并推送
- 用户的"提交"、"保存"、"推送"等指令只表示推到当前分支，不表示发布

## 技能索引

| 触发场景 | Skill |
| -------- | ----- |
| 写 PRD、定义页面字段/按钮/接口 | `prd-write` |
| 需求调研、引导式设计、调研记录 | `requirements-research` |
| 生成可交互 HTML 原型 | `prototype-design` |

## 项目概览

**IMS 保险管理系统** — 基于原系统（`scf.hmglog.com`）的前端复刻升级版。覆盖基础信息配置、保单管理（投保申请）、报案理赔三大业务模块。

### 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 + TypeScript 6.0 |
| 构建 | Vite 8.0 |
| UI 组件库 | Ant Design 6.5 |
| 路由 | React Router 7 |
| 样式 | CSS 变量 + Ant Design token（Clean Blue 设计系统） |
| 持久化 | localStorage（搜索/列自定义配置） |
| Lint | oxlint |

### 命令

```bash
npm run dev         # 启动开发服务器（默认 localhost:5173）
npm run build       # tsc 类型检查 + Vite 生产构建
npm run preview     # 预览生产构建
npm run lint        # oxlint 代码检查
```

## 项目结构

```text
保险系统/
├── CLAUDE.md                              # 本文件
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── docs/
│   └── superpowers/specs/                 # 功能设计文档
│       └── 2026-06-29-clean-blue-ui-design.md
├── src/
│   ├── main.tsx                           # 应用入口
│   ├── App.tsx                            # 路由配置（BrowserRouter + 7 条路由）
│   ├── styles/
│   │   └── global.css                     # Clean Blue 设计系统（CSS 变量 + 组件全局样式）
│   ├── types/
│   │   └── index.ts                       # 全部类型定义（ExchangeRate / InsuranceRate / InsuranceApplication / ClaimReport）
│   ├── mock/
│   │   └── data.ts                        # Mock 数据 + 下拉选项常量
│   ├── hooks/
│   │   └── usePersistedConfig.ts          # localStorage 持久化配置 hook（字段显隐/排序）
│   ├── components/
│   │   └── ColumnSettings.tsx             # 列设置 Popover（勾选/拖拽排序/上下箭头/置顶）
│   ├── layouts/
│   │   └── MainLayout.tsx                 # 全局布局（深色侧栏 + 顶栏面包屑 + 用户菜单 + 内容区）
│   └── pages/
│       ├── basic-info/                    # 基础信息模块
│       │   ├── ExchangeRateConfig.tsx     # 保费汇率配置（搜索 + 新增/编辑弹窗 + 分页表格）
│       │   └── RateConfig.tsx             # 保费费率配置（搜索 + 新增/编辑弹窗 + 批量启用/禁用 + 分页表格）
│       ├── policy-manage/                 # 保单管理模块
│       │   ├── InsuranceApplication.tsx   # 投保申请表（自定义查询组 + 自定义列 + 搜索/导出 + 更多操作）
│       │   ├── InsuranceApplicationDetail.tsx # 投保单详情（7 段 Card 布局，与编辑页字段顺序一致）
│       │   ├── InsuranceApplicationEdit.tsx   # 编辑投保单（7 段 Card 表单，Row/Col 3 列网格）
│       │   └── fields.tsx                 # 详情/编辑共享字段定义（SectionDef[]）
│       └── claims/                        # 报案理赔模块
│           ├── ReportClaims.tsx           # 报案理赔管理（搜索 + 新增/理赔确认弹窗 + 操作按钮）
│           ├── ClaimAdd.tsx               # 新增报案（3 段 Card 表单：保单/客户/货物运输信息）
│           └── ClaimDetail.tsx            # 报案详情（Descriptions 2 列 + 状态 Tag）
```

## 路由表

| 路由 | 页面 | 说明 |
|------|------|------|
| `/policyManage/insuranceapplication` | 投保申请表 | 默认首页，33 列大表 + 自定义查询 + 自定义列 |
| `/policyManage/insuranceapplicationDetail/:id` | 投保单详情 | 点击业务参考号进入，7 段只读展示 |
| `/policyManage/insuranceapplicationEdit/:id` | 编辑投保单 | 7 段可编辑表单，与详情字段布局对齐 |
| `/base/premiumexchangerateallocation` | 保费汇率配置 | 汇率 CRUD |
| `/base/detailsoftheinsurancerateconfiguration` | 保费费率配置 | 费率 CRUD + 批量启用/禁用 |
| `/claimsManage/reportClaims` | 报案理赔管理 | 报案列表 + 理赔确认弹窗 |
| `/claimsManage/reportClaimsAdd` | 新增报案 | 3 段式表单 |
| `/claimsManage/reportClaimsDetail/:id` | 报案详情 | Descriptions 2 列详情 |

## 关键设计模式

### 字段顺序一致性

详情页和编辑页共享 `fields.tsx` 中的 `sections` 配置。每个 Section 包含标题和字段数组，统一 `key` / `label` / `type` / `span` 定义。修改字段只需改一处，两页同步生效。

### 持久化用户配置

`usePersistedConfig(key, defaults)` hook：
- 读取 localStorage → 返回当前配置
- `toggle(key)` 切换字段显隐并自动保存
- `reorder(from, to)` 拖拽排序并自动保存
- `reset()` 恢复默认配置
- 两个实例：`ims_search_fields`（搜索字段）、`ims_table_columns`（表格列）

### Clean Blue 设计系统

全局 CSS 变量定义在 `:root`（`--blue` / `--text` / `--radius` / `--shadow` 等），全局覆盖 Ant Design 组件的圆角、边框、悬浮态、表格斑马纹。所有页面共用同一套 token。

## 与原系统的对应关系

| 原系统菜单 | 对应页面路由 |
|-----------|------------|
| 基础信息 → 保费汇率配置 | `/base/premiumexchangerateallocation` |
| 基础信息 → 保费费率配置 | `/base/detailsoftheinsurancerateconfiguration` |
| 保单管理 → 投保申请表 | `/policyManage/insuranceapplication` |
| 报案理赔 → 报案理赔管理 | `/claimsManage/reportClaims` |
