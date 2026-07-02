# IMS 旧版页面内容完整清单（用于新版对照核对）

> 来源：`legacy/vite-antd` 分支，Vite + React 19 + Ant Design 6.5

---

## 一、投保申请列表页

**文件**：`src/pages/policy-manage/InsuranceApplication.tsx`

### 1.1 页面布局结构

```
Card(title="投保申请表")
├── extra: Segmented 版本切换（"当前有效" | "全部记录"）
├── 搜索字段行（Form inline，11个搜索字段，可通过"自定义查询"面板控制显隐）
├── 工具栏行
│   ├── 左侧：[搜索] [重置] [导出▼]
│   │        导出子菜单：列表导出 / 平安导出 / PICC进出口货运 / PICC国内运输
│   └── 右侧：[自定义查询] [列设置]
├── 自定义查询面板（蓝色边框弹出面板，可勾选搜索字段）
├── Table（33列 + 操作列，横向滚动）
│   └── 底部：分页（10条/页，显示总数）
└── Modal ×2：保单信息回填 / 批改信息回填
```

### 1.2 搜索字段（11个，默认5个可见）

| 字段 key | 标签 | 类型 | 宽度 | 默认可见 |
|----------|------|------|------|---------|
| applicationNo | 投保单号 | input | 150 | ✅ |
| businessRefNo | 业务参考号 | input | 150 | ✅ |
| applicationTime | 投保时间 | dateRange | 240 | ✅ |
| approvalStatus | 审批状态 | select | 130 | ❌ |
| insurancePolicyStatus | 保险公司保单状态 | select | 150 | ❌ |
| policyNo | 保单单号 | input | 150 | ❌ |
| applicantCompany | 投保人企业名称 | input | 180 | ❌ |
| insuredCompany | 被保人企业名称 | input | 180 | ✅ |
| goodsNameCN | 中文商品名称 | input | 180 | ❌ |
| insuranceCompany | 保险公司名称 | input | 150 | ❌ |
| dataSource | 数据来源 | select(fms/cos) | 100 | ❌ |

### 1.3 表格列（33列 + 操作列）

| 列 key | 标题 | 宽度 | 特殊渲染 |
|--------|------|------|---------|
| id | 序号 | 50 | 居中，固定左侧 |
| businessRefNo | 业务参考号 | 180 | **可点击链接**，跳转详情；非最新版显示灰色"历史版本"Tag |
| applicationType | 申请类型 | 100 | Tag：批改申请=orange，其余=blue |
| approvalStatus | 审核状态 | 90 | 彩色Tag（待发起=default，待审核=processing，审批通过=success，审批拒绝=error） |
| documentStatus | 文档状态 | 80 | 纯文本 |
| approvalRemark | 审批备注 | 150 | 文本省略(ellipsis) |
| insurancePolicyStatus | 保险公司保单状态 | 120 | 纯文本 |
| insuranceCorrectionStatus | 保险公司批改状态 | 120 | 纯文本 |
| applicationNo | 投保单号 | 150 | 纯文本 |
| applicationTime | 投保时间 | 160 | 纯文本 |
| applicantCompany | 投保人企业名称 | 200 | 文本省略 |
| goodsNameCN | 中文商品名称 | 200 | 文本省略 |
| currencyName | 币制中文名称 | 100 | 纯文本 |
| invoiceAmount | 发票金额 | 110 | **右对齐** + toLocaleString() |
| estimatedInsuranceAmount | 预计保险金额 | 120 | **右对齐** + toLocaleString() |
| markupRatio | 加成比例 | 140 | 纯文本 |
| estimatedPremium | 预计保费 | 100 | **右对齐** + toFixed(2) |
| actualPremium | 实际保费 | 100 | **右对齐** + toFixed(2) |
| applicantName | 投保申请人姓名 | 110 | 纯文本 |
| insuranceCompany | 保险公司名称 | 100 | 纯文本 |
| cosOrderStatus | COS订单状态 | 100 | 纯文本 |
| insuranceCategory | 投保类别 | 90 | 纯文本 |
| transitPort | 途径港 | 180 | 文本省略 |
| carriageType | 车厢类型 | 80 | 纯文本 |
| packageType | 包装种类 | 200 | 文本省略 |
| quantity | 件数 | 60 | **右对齐** |
| insuredCompany | 被保人企业名称 | 200 | 文本省略 |
| policyNo | 保单单号 | 200 | 纯文本 |
| customerName | 客户名称 | 200 | 文本省略 |
| effectiveStatus | 生效状态 | 80 | 纯文本 |
| isBackfill | 是否回填 | 90 | 纯文本 |
| dataSource | 数据来源 | 70 | 纯文本 |
| correctionActualPremium | 批改实际保费 | 110 | **右对齐** + toFixed(2)，空则不显示 |

### 1.4 操作列按钮（条件显隐）

**历史版本记录行**：仅 [查看] 按钮

**当前有效记录行**：
| 按钮 | 显示条件 | 行为 |
|------|---------|------|
| 编辑 | approvalStatus=待发起/审批拒绝 | 跳转编辑页 |
| 删除 | approvalStatus=待发起 | Modal确认删除 |
| 更多▼ | 始终显示 | 下拉菜单 |

### 1.5 "更多"下拉菜单（按状态动态显隐）

| 菜单项 | 显示条件 | 行为 |
|--------|---------|------|
| 编辑 | 待发起/审批拒绝 | 跳转编辑页 |
| 删除 | 待发起 | Modal确认删除 |
| 保险费率选择 | 待发起 | toast "待开发" |
| 发起审批 | 待发起/审批拒绝 | toast "已发起审批" |
| 撤销审核 | 待审核 | toast "已撤销审核" |
| 保单信息回填 | 审批通过 + 非批改申请 | 打开回填Modal |
| 批改信息回填 | 审批通过 + 批改申请 | 打开批改Modal |
| 缴费账单 | 审批通过 | toast "待开发" |
| 发票 | 审批通过 | toast "待开发" |
| 发起批改 | 审批通过 + 非批改申请 | toast "待开发" |

### 1.6 保单信息回填弹窗

**字段**：保险公司名称(select, required)、保单单号(input)、实际保费(input)、保单附件(upload placeholder)

### 1.7 批改信息回填弹窗

**字段**：保险公司批改状态(select: 已批改/待批改)、保险公司批改编号(input)、批改后实际保费(input)、附件(upload placeholder)

### 1.8 功能清单

- [ ] 版本切换 Segmented（当前有效/全部记录）
- [ ] 搜索字段行（11个字段，默认5可见）
- [ ] 搜索字段可自由显隐（自定义查询面板）
- [ ] 列设置（勾选显隐+拖拽排序+恢复默认）
- [ ] 表格列可横向滚动（x: max-content）
- [ ] 分页（每页10条，可切换，显示总数）
- [ ] 业务参考号可点击跳详情
- [ ] 金额列右对齐 + 千分位 / 两位小数
- [ ] 审批状态彩色 Tag
- [ ] 申请类型彩色 Tag
- [ ] 操作按钮条件显隐
- [ ] 更多下拉菜单条件显隐
- [ ] 保单信息回填弹窗
- [ ] 批改信息回填弹窗
- [ ] 历史版本行样式（灰色半透明）
- [ ] 导出按钮带4个子选项

---

## 二、投保申请详情页

**文件**：`src/pages/policy-manage/InsuranceApplicationDetail.tsx`

### 2.1 页面布局

```
Card(title="投保单详情 — {businessRefNo}")
├── extra: [显示变更/隐藏变更(N)] [编辑(条件)] [返回]
├── 变更对比提示条（黄色，显示变更数量）
├── 7个段落（Card嵌套Row/Col 3列布局）
│   ├── SectionHead + Card(size=small, bg=#fafafa)
│   └── Col 3列网格（span=2时占24列即整行）
└── 历史记录面板（3 Tab）
```

### 2.2 7个段落（来自 fields.tsx 共享定义）

| 段落 | 字段数 |
|------|--------|
| 基本信息 | 2 |
| 投/被保险人信息 | 17 |
| 运输信息 | 23 |
| 货物信息 | 7 |
| 保险信息 | 13 |
| 保单回填信息 | 5 |
| 批改信息 | 4 |

### 2.3 字段渲染规则

| 字段类型 | 渲染方式 |
|----------|---------|
| 状态字段（insurancePolicyStatus/insuranceCorrectionStatus/approvalStatus/documentStatus/effectiveStatus） | **彩色Tag** |
| 文件字段（insuranceFiles/policyFiles/correctionFiles） | 数组join(', ')，为空显示"暂无附件" |
| 金额字段（estimatedPremium/actualPremium/correctionActualPremium） | toFixed(2) |
| 其他数字 | toLocaleString() |
| 普通文本 | 直接显示，空显示"-" |

### 2.4 版本变更对比

- 按钮位置：Card extra 区域
- 对比对象：与历史版本列表中最后一个版本
- 变更字段：黄色背景 + 黄色边框 + 显示原值
- 变更数量：按钮上显示 (N)
- 提示条：黄色 alert 样式

### 2.5 历史记录面板

包含三个标签：

| 标签 | 内容 | 计数显示 |
|------|------|---------|
| 历史版本 | Timeline + 每个版本的字段数据表格（前10字段，超出的显示"共N个字段"） | ✅ Tag |
| 审批历史 | Timeline + 审批人/时间/备注 | ✅ Tag |
| 修改日志 | Table(时间/操作人/字段/变更(新旧值对比)) | ✅ Tag |

**默认激活Tab**：修改日志

### 2.6 功能清单

- [ ] 7段只读展示
- [ ] 3列网格布局（span=2 占整行）
- [ ] 状态字段彩色Tag
- [ ] 文件字段特殊显示
- [ ] 金额格式化
- [ ] 版本变更对比（黄色高亮+原值）
- [ ] 变更提示条
- [ ] 历史版本 Tab（Timeline）
- [ ] 审批历史 Tab（Timeline + Tag）
- [ ] 修改日志 Tab（Table + 红绿变更对比）
- [ ] 编辑按钮（条件显示）
- [ ] 返回按钮

---

## 三、投保申请编辑页

**文件**：`src/pages/policy-manage/InsuranceApplicationEdit.tsx`

### 3.1 页面布局

```
Card(title="编辑投保单 — {businessRefNo}")
├── extra: [显示变更/隐藏变更(N)] [返回]
├── 变更对比提示条
├── Form (Ant Design)
│   ├── 5个段落（排除"保单回填信息"和"批改信息"）
│   │   ├── SectionHead + Card(size=small, bg=#fafafa)
│   │   └── Row/Col 3列网格，Form.Item 嵌套
│   └── 底部：[保存(大)] [取消(大)]
└── 历史记录面板
```

### 3.2 编辑段落（5段，排除回填和批改）

基本信息 / 投被保险人信息 / 运输信息 / 货物信息 / 保险信息

### 3.3 select 下拉选项（硬编码在编辑页）

| 字段 | 选项 |
|------|------|
| insuranceCategory | 非保入库 / 保税返库 / 进境申报入库 / 实物出库 |
| insuredAddressCountryCode | 国内(Domestic) / 国际(International) |
| transportMode | 航空运输 / 水路运输 / 公路运输 |
| isContainer | 是 / 否 |
| carriageType | 普通集装箱 / 其他 |
| packageType | 木制或竹藤等植物性材料制盒/箱 / 纸制或纤维板制盒/箱 / 天然木托 / 球状罐类 / 普通集装箱 / 其他 |
| goodsNature | 新货 / 旧货 |
| currencyName | 人民币 / 美元 / 欧元 / 日元 / 港元 / 英镑 / 马来西亚林吉特 |
| markupRatio | 发票金额原值100% / 发票金额原值110% |

### 3.4 字段控件类型映射

| field.type | 控件 |
|-----------|------|
| text | Input |
| select | Select（带硬编码选项） |
| number | InputNumber (min=0) |
| date | DatePicker (width:100%) |
| textarea | TextArea (rows=2) |
| upload | Upload + Button "选择附件" |

### 3.5 差异高亮（DiffWrapper）

- 变更字段：**黄色边框2px + 黄色背景**，下方显示"📋 原值：xxx"
- 未变更字段：正常渲染

### 3.6 功能清单

- [ ] 5段编辑表单（3列网格）
- [ ] 所有字段控件类型正确
- [ ] Select下拉选项完整
- [ ] 版本变更差异高亮
- [ ] 保存按钮（validateFields + toast）
- [ ] 取消按钮（返回）
- [ ] 历史记录面板

---

## 四、保费汇率配置页

**文件**：`src/pages/basic-info/ExchangeRateConfig.tsx`

### 4.1 页面布局

```
Card(title="保费汇率配置")
├── 搜索行（Form inline）
│   ├── 保险公司 Select（allowClear）
│   ├── 生效日期 RangePicker
│   ├── [搜索] [重置]
├── 工具栏：[新增]
├── Table（9列）
└── Modal（新增/编辑弹窗）
```

### 4.2 表格列（9列）

| 列 | 说明 |
|----|------|
| 序号 | 居中，60px |
| 保险公司 | 120px |
| 汇率 | 100px |
| 生效日期 | 110px |
| 失效日期 | 110px |
| 币制 | 130px |
| 创建人 | 100px |
| 创建时间 | 170px |
| 操作 | 固定右侧 80px，只有"编辑"按钮 |

### 4.3 新增/编辑弹窗字段

保险公司(select, required) / 生效日期(date, required) / 失效日期(date, required) / 币制(select, required) / 汇率(number, 6位小数, required) / 最低收费标准(number, 2位小数)

### 4.4 功能清单

- [ ] 搜索行（保险公司+日期范围）
- [ ] 新增按钮
- [ ] 编辑按钮
- [ ] 弹窗表单含验证
- [ ] 分页（10条/页）

---

## 五、保费费率配置页

**文件**：`src/pages/basic-info/RateConfig.tsx`

### 5.1 页面布局

```
Card(title="保费费率配置")
├── 搜索行
│   ├── 保险公司 Select
│   ├── 生效日期 RangePicker
│   ├── [搜索] [重置]
├── 工具栏（左侧）
│   ├── [新增]
│   ├── [批量启用]
│   └── [批量禁用]
├── Table（9列，无复选框）
└── Modal
```

### 5.2 表格列（9列）

| 列 | 说明 |
|----|------|
| 序号 | 60px |
| 保险公司 | 100px |
| 费率 | 100px，toFixed(6) |
| 生效日期 | 110px |
| 失效日期 | 110px |
| 货物类型 | 280px，ellipsis |
| 状态 | 80px，启用=绿色，禁用=红色 |
| 创建人 | 80px |
| 创建时间 | 170px |
| 操作 | 仅"编辑"按钮 |

**注**：旧版费率页面**没有复选框列**，但有"批量启用/禁用"按钮（功能未完全实现）。

### 5.3 弹窗字段

保险公司(select, required) / 生效日期(date) / 失效日期(date) / 货物类型(input) / 费率(number, 6位) / 货值RMB(number) / 协议号(input) / 最低收费(number) / 包装类型(select) / 新旧类型(select) / 备注(textarea)

### 5.4 功能清单

- [ ] 搜索行
- [ ] 新增按钮 + 弹窗
- [ ] 编辑按钮
- [ ] 批量启用/禁用按钮（无复选框的旧版设计）
- [ ] 状态列带颜色
- [ ] 费率 toFixed(6)

---

## 六、报案理赔列表页

**文件**：`src/pages/claims/ReportClaims.tsx`

### 6.1 页面布局

```
Card(title="报案理赔管理")
├── 搜索行
│   ├── 报案时间 RangePicker
│   ├── 报案编号 Input
│   ├── 报案状态 Select
│   ├── [搜索] [重置]
├── 工具栏：[新增]
├── Table（9列）
├── 分页（10条/页）
└── Modal（理赔确认）
```

### 6.2 表格列（9列）

| 列 | 说明 |
|----|------|
| 序号 | 60px，居中 |
| 报案编号 | 150px |
| 报案状态 | 100px，**带颜色文字**（非Tag） |
| 报案时间 | 170px |
| 投保申请人姓名 | 120px |
| 保单单号 | 220px |
| 保险公司名称 | 100px |
| 被保险人企业名称 | 220px，ellipsis |
| 保险公司理赔结果 | 130px |
| **操作** | 固定右侧，220px |

### 6.3 操作按钮

[编辑] [查看] [删除] [发起审批] [理赔确认(审批通过时显示)]

### 6.4 理赔确认弹窗

保险公司理赔结果(select: 赔付/拒赔/部分赔付, required) / 理赔金额(number, 2位小数) / 上传附件(upload)

### 6.5 功能清单

- [ ] 搜索行（时间范围+编号+状态）
- [ ] 新增按钮
- [ ] 编辑/查看/删除/发起审批 按钮
- [ ] 理赔确认按钮（审批通过时）
- [ ] 理赔确认弹窗
- [ ] 报案状态带颜色文字
- [ ] 分页

---

## 七、新增报案页

**文件**：`src/pages/claims/ClaimAdd.tsx`

### 7.1 页面布局

```
Card(title="新增报案")
├── extra: [返回]
├── Form
│   ├── 保单信息（5字段，3列网格）
│   ├── 客户信息（15字段，3列网格）
│   ├── 货物运输信息（12字段 + 出险描述 + 附件，3列网格）
│   └── 底部：[提交(大)] [取消(大)]
```

### 7.2 三段式表单字段

**保单信息**：业务参考号 / 投保申请人部门 / 保单单号 / 保险公司名称 / 提运单号

**客户信息**：被保人企业名称 / 起运地国家标识(select countries) / 起运地国家(select) / 起运地省 / 起运地市 / 起运地区县 / 起运地详细地址 / 收货方名称 / 目的地国家标识(select) / 目的地国家(select) / 目的地省 / 目的地市 / 目的地区县 / 目的地详细地址

**货物运输信息**：中文商品名称(required) / 货物数量(number) / 包装种类(select) / 预计货损金额(number) / 货损金额币种(select) / 具体出险时间(date+time, required) / 出险地国家标识(select) / 出险地国家(select) / 出险地省(select) / 出险地市(select) / 出险地区县(select) / 出险地详细地址 / 出险经过与原因(textarea, max=500, showCount) / 出险附件(upload)

### 7.3 功能清单

- [ ] 三段式表单（保单/客户/货物运输）
- [ ] 3列网格布局
- [ ] 中文商品名称必填
- [ ] 出险时间必填（日期+时间）
- [ ] 出险描述最多500字+计数
- [ ] 提交/取消按钮
- [ ] validateFields 后提交

---

## 八、报案详情页

**文件**：`src/pages/claims/ClaimDetail.tsx`

### 8.1 页面布局

```
Card(title="报案详情 — {reportNo}")
├── extra: [返回列表]
├── 基本信息 SectionHead
└── Descriptions（bordered, 3列响应式）
    ├── 报案编号
    ├── 报案状态（彩色Tag）
    ├── 报案时间
    ├── 投保申请人姓名
    ├── 保单单号
    ├── 保险公司名称
    ├── 被保险人企业名称（span=3 占整行）
    ├── 保险公司理赔结果
    └── 保险公司理赔金额（¥千分位，空显示"-"）
```

### 8.2 功能清单

- [ ] 基本信息段
- [ ] 带边框描述列表
- [ ] 状态列彩色Tag
- [ ] 金额千分位+¥符号
- [ ] 返回按钮

---

## 九、共享组件清单

### 9.1 SectionHead

- 蓝色左边框（3px宽，圆角，蓝色）
- 标题文字（14px，semibold）

### 9.2 ColumnSettings

- SettingsOutlined 图标按钮
- Popover 弹出面板
- 每行：拖拽手柄 + Checkbox + 标签
- 恢复默认按钮
- 支持 HTML5 拖拽排序

### 9.3 HistoryPanel（3 Tab）

- 历史版本Tab：Timeline+Descriptions（不超过10字段预览，超出提示"共N个"）
- 审批历史Tab：Timeline+Tag(审批通过=success/拒绝=error/其他=processing)
- 修改日志Tab：Table(时间/操作人/字段/变更) — 旧值红色删除线+新值绿色加粗
- 每个Tab标签旁有计数Tag
- 默认激活：修改日志

### 9.4 usePersistedConfig hook

- 两个实例：`ims_search_fields` / `ims_table_columns`
- API：`visibleFields`、`fields`、`toggle(key)`、`reorder(from, to)`、`reset()`
- 基于 localStorage

---

## 十、全局样式/布局

### 10.1 MainLayout

- 深色侧栏（#001529），顶部Logo "IMS保险系统"
- 菜单项：基础信息(汇率/费率) / 保单管理(投保申请) / 报案理赔(报案管理) / **系统管理(占位)** / **系统监控(占位)**
- 顶栏：面包屑 + 用户信息
- 内容区：padding

### 10.2 全局 CSS 类

- `.app-layout` — 全屏布局
- `.app-header` — 顶部栏
- `.app-content` — 内容区域
- `.section-head` — 段落标题行
- `.section-head-line` — 蓝色左边框
- `.section-head-title` — 标题文字
- `.search-form` — 搜索表单（flex wrap, gap 8）
- `.table-toolbar` — 表格工具栏（flex space-between）
- `.history-row` — 历史版本行（opacity降低）

### 10.3 Clean Blue 设计令牌

| Token | 值 |
|-------|-----|
| --blue | #1677ff |
| --blue-light | #e6f4ff |
| --sidebar-bg | #001529 |
| --bg-page | #f5f5f5 |
| --radius | 6px(组件) / 8px(弹窗) |
| --shadow | 0 1px 2px rgba(0,0,0,0.04) |
| --transition | 0.2s ease |

---

## 十一、新版遗漏项汇总

对比新版代码，以下功能/字段需要补充：

### 投保申请列表页
- [ ] **33列表格** → 新版只有约9列，缺24列
- [ ] **"自定义查询"面板** → 新版未实现
- [ ] **搜索字段默认可见性** → 新版全显示
- [ ] **导出按钮子菜单（4种导出）** → 新版仅列表导出
- [ ] **更详细的状态Tag颜色映射**
- [ ] **更多操作下拉菜单** → 新版仅3项（查看/编辑/删除）
- [ ] **保单信息回填弹窗**
- [ ] **批改信息回填弹窗**
- [ ] **条件显示逻辑**（审批状态+申请类型联动）

### 投保详情页
- [ ] **7段全部展示** → 新版基本信息+6段（缺少单独的"基本信息"段落）
- [ ] **3列响应式网格**（原版3列，新版2列）
- [ ] **文件字段显示逻辑**
- [ ] **版本变更对比** → 新版有基础实现但未完整
- [ ] **变更提示条**
- [ ] **历史版本Tab内显示字段数据**（原版有Descriptions预览）
- [ ] **修改日志Tab红绿新旧值对比**

### 投保编辑页
- [ ] **仅5段（排除回填和批改）** → 新版显示全部7段
- [ ] **Select下拉选项** → 新版多数select缺具体选项
- [ ] **控件类型映射**（InputNumber vs Input）
- [ ] **差异高亮DiffWrapper**
- [ ] **Form.Item validateFields提交**
- [ ] **底部保存取消按钮居中**

### 汇率配置页
- [ ] **日期RangePicker搜索** → 新版仅Select+Input
- [ ] **弹窗字段** → 新版缺少"最低收费标准"
- [ ] **汇率精度6位小数** → 新版仅step=0.0001

### 费率配置页
- [ ] **费率列toFixed(6)** → 新版无格式化
- [ ] **状态列颜色** → 新版用Badge（OK）
- [ ] **弹窗字段完整性** → 新版缺部分字段
- [ ] **批量启用/禁用** → 新版有复选框+批量操作

### 报案列表页
- [ ] **报案状态颜色文字**（原版是非Tag颜色文字）→ 新版用Badge
- [ ] **操作按钮完整性**（编辑/删除/发起审批）→ 新版仅查看+理赔确认

### 新增报案页
- [ ] **三段式（保单/客户/货物运输）** → 新版仅2段
- [ ] **字段完整性** → 缺15字段（客户信息段几乎全缺）

### 报案详情页
- [ ] **Descriptions 3列响应式** → 新版2列
- [ ] **金额¥+千分位** → 新版无格式化
- [ ] **span=3占整行**
