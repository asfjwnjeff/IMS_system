// 设计常量 — 所有页面引用这些常量确保一致性
// 后续新增页面直接 import 使用，不需要手写数值

/** 间距常量（基于 4px 网格） */
export const SPACE = {
  xs: 4,   // 紧凑元素间
  sm: 8,   // 表单字段间 / 按钮组
  md: 12,  // 工具栏 / 搜索行间距
  lg: 16,  // 内容区 margin
  xl: 24,  // 段落间距
} as const;

/** 字号常量（匹配 Ant Design 5级阶梯） */
export const FONT = {
  tag: 11,      // 标签/徽章
  label: 12,    // 字段标签 / 表头
  body: 13,     // 正文 / 表格数据 / 输入框
  section: 14,  // 段落标题
  title: 15,    // 卡片标题
  page: 16,     // 页面标题
} as const;

/** 圆角常量 */
export const RADIUS = {
  sm: 4,
  md: 6,   // 默认（匹配 Ant Design）
  lg: 8,   // 弹窗
} as const;

/** 内容区最大宽度 */
export const CONTENT_W = {
  narrow: 'max-w-2xl',     // 简单表单
  normal: 'max-w-4xl',     // 详情/编辑页
  wide: 'max-w-[1440px]',  // 列表页
} as const;

/** 表格列宽预设（px） */
export const COL_W = {
  checkbox: 40,
  index: 60,
  status: 90,
  amount: 110,
  date: 160,
  refNo: 180,
  company: 200,
  action: 80,
} as const;

/** 通用样式类名 */
export const CARD_STYLE = {
  /** 列表页主卡片 */
  main: 'rounded-[var(--radius)] border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-[var(--card-shadow)]',
  /** 详情/编辑页段落内嵌卡片 */
  nested: 'rounded-[var(--radius)] border border-[var(--border-light)] bg-[var(--bg-subtle)]',
} as const;

/** 表单布局常量 */
export const FORM_LAYOUT = {
  labelCol: 'text-[13px] font-medium text-[var(--text-secondary)] mb-1.5',
  errorCol: 'text-[11px] text-[var(--error)] mt-1',
  gridCols: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3',
} as const;
