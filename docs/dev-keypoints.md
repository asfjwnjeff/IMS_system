# IMS 保险管理系统 — 开发要点

> 面向 AI 助手和开发者的项目配置速查 + 反复错误记录
> 最后更新：2026-07-03

---

## 1. 项目配置速查

### 1.1 路径与端口

| 项 | 值 |
|----|-----|
| 项目根目录 | `d:\金融组文件\保险系统` |
| **端口（固定）** | **5002** |
| 启动命令 | `npx next dev --turbo -p 5002` |
| 数据库文件 | `data/ims.db`（运行时自动生成） |
| 原型文件目录 | `prototype/` |
| 文档目录 | `docs/` |
| E2E 测试目录 | `e2e/` |

> ⚠️ **绝对不要碰 `d:\金融组文件\CIM2.0` 目录**，那是另一个独立项目（CIM 客户管理系统）。

### 1.2 技术栈

| 层面 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router + Turbopack) | 16.1 |
| UI | shadcn/ui + Tailwind CSS + Radix UI | v4 |
| 状态管理 | React Context + useReducer | — |
| 数据库 | SQLite (sql.js WASM) + Drizzle ORM | 0.45 |
| 表单 | react-hook-form + zod | 7.70 / 4.3 |
| 图标 | Lucide React | 0.468 |
| 通知 | Sonner | 2.0 |
| 导出 | xlsx | 0.18 |

### 1.3 数据库

- **引擎**：sql.js (SQLite 编译为 WebAssembly)
- **ORM**：Drizzle ORM（仅类型定义，不负责迁移）
- **迁移方式**：`src/db/seed.ts` 中的 `autoMigrate()` 函数手动管理
  - `CREATE TABLE IF NOT EXISTS` 建表
  - `ALTER TABLE ADD COLUMN` 逐条 try-catch 执行（幂等）
  - 空表检测自动补种数据
- **自动保存**：每 5 秒 `saveDb()` 一次
- **重建方式**：删除 `data/ims.db`，重启服务即可

---

## 2. 关键架构决策

### 2.1 费率管理：从"保险公司维度"改为"产品维度"

**旧设计**：保费费率配置按 **保险公司**（中国人保 / 中国平安 / 人保财险）维度管理，每条记录绑定一个保险公司和固定费率。

**新设计**：费率配置按 **保险产品** 维度管理，不再区分保险公司。

| 旧字段 | 新字段 | 说明 |
|--------|--------|------|
| `insuranceCompany` | `productName` | 产品名称 |
| `rate` | `rateMin` | 最低费率 |
| — | `rateMax` | 最高费率（区间费率时使用） |
| — | `rateType` | 费率类型：`区间费率` / `固定费率` / `手工填写` |
| — | `isDefault` | 是否默认产品（0/1） |

**三种费率类型**：
- **区间费率**：`rateMin` 和 `rateMax` 均有值 → 保费显示区间
- **固定费率**：仅 `rateMin` → 保费显示单值
- **手工填写**：`rateMin` 为 0 → 业务人员自行填入

### 2.2 汇率管理：去掉保险公司维度

**旧设计**：汇率按 **保险公司 + 币种** 维度。  
**新设计**：汇率仅按 **币种** 统一管理。

SDK 类型中 `insuranceCompany` 字段设为空字符串兜底，DB schema 保留该列（兼容旧表结构）。

### 2.3 保费计算公式

```
预计保险金额 = 发票金额(invoiceAmount) × 加成系数(markupRatio)
预计保费 = 预计保险金额 × 汇率(exchangeRate) × 费率(rate)
```

- 人民币汇率恒为 1，不存表
- 汇率按投保单币种从 `exchange_rates` 表匹配
- 区间费率：同时计算最低和最高预计保费，显示为 `¥min – ¥max`

### 2.4 JSON 段落存储

投保申请表 6 个子结构（applicantInfo / transportInfo / cargoInfo / insuranceInfo / backfillInfo / correctionInfo）以 **JSON 字符串**形式存储在主表的 TEXT 列中。API 层负责序列化/反序列化。

---

## 3. 反复出现的错误与修复

### 3.1 `String(null)` → `'null'` 字符串

**现象**：种子数据中 `null` 值被 `q()` 函数转为字符串 `'null'`（而非 SQL NULL），导致前端读取后 `Number('null')` → NaN。

**修复**（`src/db/seed.ts`）：
```typescript
function q(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';  // SQL NULL 关键字
  return `'${String(v).replace(/'/g, "''")}'`;
}
```

### 3.2 ALTER TABLE 重复执行报错

**现象**：`ALTER TABLE ADD COLUMN` 写在 `rawDb.exec()` 大块 SQL 中，第二次启动时列已存在 → SQL 报错 → 后面所有 SQL 不执行 → 种子数据无法写入。

**修复**：将迁移 SQL 从 `exec()` 中拆出，逐条 `try-catch` 执行：
```typescript
const migrateSqls = [
  'ALTER TABLE insurance_rates ADD COLUMN product_name TEXT',
  'ALTER TABLE insurance_rates ADD COLUMN rate_min REAL',
  // ...
];
for (const sql of migrateSqls) {
  try { rawDb.run(sql); } catch (_) { /* 列已存在，跳过 */ }
}
```

### 3.3 模板字符串内的 `+` 拼接不生效

**现象**：模板字符串（反引号）内使用 `+r.id+` 拼接变量 → 输出字面量 `moreMenu_+r.id+` → 点击无反应。

**根因**：模板字符串只认 `${}` 表达式，不认 `+` 拼接。

**修复**：`onclick="toggleDropdown('moreMenu_${r.id}')"`

### 3.4 `typeof NaN === 'number'` 导致 "NaN" 显示

**现象**：数值字段（预计保费、汇率等）显示 "NaN" 而非 "-"。

**根因**：`isNaN()` 检查缺失，`Number(undefined)` → `NaN`，`NaN.toFixed(2)` → `"NaN"`。

**修复**：所有数值渲染点加 `isNaN(v) ? '-' : v.toFixed(2)` 兜底。

涉及文件：
- `src/components/InsuranceRateSelector.tsx` — `formatRateDisplay`、`calcPremium`、JSX
- `src/app/basic-info/insurance-rates/page.tsx` — `formatRateDisplay`
- `src/app/policy-manage/applications/[id]/page.tsx` — `formatVal`、详情渲染
- `src/lib/field-registry.tsx` — number 类型渲染

### 3.5 `useState(() => ...)` 非响应式

**现象**：弹窗打开时默认产品未选中。

**根因**：`useState(() => products.find(p => p.isDefault))` 只在初始渲染执行一次，产品数据异步加载后不会重新计算。

**修复**：改用 `useEffect` 监听 `open` 和 `products` 变化：
```typescript
useEffect(() => {
  if (open) {
    const def = products.find((p) => !!p.isDefault);
    setSelectedId(def ? def.id : (products[0]?.id || null));
  }
}, [open, products]);
```

### 3.6 端口混淆

**现象**：AI 助手多次用 `localhost:3000` 启动服务，而实际端口是 5002。

**根因**：Next.js 默认 3000，但 `package.json` 配置了 `-p 5002`。

**约定**：**永远使用端口 5002**，启动命令为 `npx next dev --turbo -p 5002`。

### 3.7 seed INSERT 列名/顺序不匹配

**现象**：`INSERT INTO exchange_rates VALUES (...)` 在旧表结构和新表结构之间列顺序不一致 → 数据写入到错误的列。

**修复**：始终使用**显式列名** INSERT：
```sql
INSERT OR IGNORE INTO exchange_rates (id, insurance_company, currency, exchange_rate, ...) VALUES (...)
```

---

## 4. 代码模式约定

### 4.1 数值安全

```typescript
// ✅ 正确：Number() + isNaN() 兜底
const amount = Number(rawValue) || 0;
const display = isNaN(amount) ? '—' : amount.toLocaleString();

// ❌ 错误：直接调用 toFixed
const display = rawValue.toFixed(2);  // NaN 时输出 "NaN"
```

### 4.2 数据库操作

- 迁移 SQL 逐条 try-catch 执行
- INSERT 始终使用显式列名
- `seed.ts` 是唯一管理 schema 迁移的文件
- 不要手动改 `data/ims.db`，删掉后重启即可重建

### 4.3 组件模式

- 业务组件放 `src/components/`，UI 基础组件放 `src/components/ui/`
- Dialog 内表单使用受控组件 + 本地 state
- 数据查询用 `useApp()` hook 从全局 store 获取
- Toast 通知用 `sonner` 的 `toast.success/error/info`

### 4.4 模板字符串

- 模板字符串内**只用 `${}` 做变量求值**
- 普通字符串拼接用 `+`

### 4.5 类型转换

- DB 的 `isDefault` 是 INTEGER (0/1)，前端判断用 `!!r.isDefault`
- `rateMax` 可为 `null`（固定费率和手工填写时）
- 单独报价时 `rateMin` 为 0

---

## 5. 文件导航速查

| 要改什么 | 去哪个文件 |
|----------|-----------|
| 费率/汇率类型定义 | `src/lib/types.ts` |
| DB Schema | `src/db/schema.ts` |
| 迁移 + 种子数据 | `src/db/seed.ts` |
| 全局状态 | `src/lib/store.tsx` |
| 费率选择弹窗 | `src/components/InsuranceRateSelector.tsx` |
| 汇率配置页面 | `src/app/basic-info/exchange-rates/page.tsx` |
| 费率配置页面 | `src/app/basic-info/insurance-rates/page.tsx` |
| 投保申请表 | `src/app/policy-manage/applications/page.tsx` |
| 投保单详情 | `src/app/policy-manage/applications/[id]/page.tsx` |
| 编辑投保单 | `src/app/policy-manage/applications/[id]/edit/page.tsx` |
| 报案理赔 | `src/app/claims/reports/page.tsx` |
| 字段定义 | `src/lib/field-defs.ts` |
| API 路由 | `src/app/api/*/route.ts` |
| HTML 原型 | `prototype/insurance-rate-selection-v2.html` |
