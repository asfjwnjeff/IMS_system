import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ==================== 投保申请表 ====================

export const insuranceApplications = sqliteTable('insurance_applications', {
  id: text('id').primaryKey(),
  // 基本信息 - 独立列（搜索/筛选用，使用生产系统命名）
  jobidref: text('jobidref').notNull(),
  insuranceCategory: text('insurance_category'),
  insuranceCategoryDesc: text('insurance_category_desc'),
  policyHolderNameDesc: text('policy_holder_name_desc'),
  insuredCompanyDesc: text('insured_company_desc'),
  insuredCompanyName: text('insured_company_name'),
  workflowStatus: text('workflow_status').default('Draft'),
  workflowStatusDesc: text('workflow_status_desc').default('草稿'),
  submitTypeDesc: text('submit_type_desc'),
  // 版本管理
  version: integer('version').default(1),
  isLatest: integer('is_latest', { mode: 'boolean' }).default(true),
  previousId: text('previous_id'),
  // 列表用字段
  documentStatusDesc: text('document_status_desc'),
  auditReason: text('audit_reason'),
  policyNo: text('policy_no'),
  applicationTime: text('application_time'),
  applicantName: text('applicant_name'),
  cosOrderStatus: text('cos_order_status'),
  effectiveStatusDesc: text('effective_status_desc'),
  isBackfill: text('is_backfill'),
  dataSources: text('data_sources'),
  insuranceCompanyName: text('insurance_company_name'),
  // JSON 段落
  applicantInfo: text('applicant_info'),
  transportInfo: text('transport_info'),
  cargoInfo: text('cargo_info'),
  insuranceInfo: text('insurance_info'),
  backfillInfo: text('backfill_info'),
  correctionInfo: text('correction_info'),
  // 时间戳
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// ==================== 报案理赔表 ====================

export const claimReports = sqliteTable('claim_reports', {
  id: text('id').primaryKey(),
  reportNo: text('report_no').notNull(),
  reportStatus: text('report_status').default('待审批'),
  reportTime: text('report_time'),
  applicantName: text('applicant_name'),
  policyNumber: text('policy_number'),
  insuranceCompanyName: text('insurance_company_name'),
  insuredCompanyName: text('insured_company_name'),
  claimResult: text('claim_result'),
  claimDetail: text('claim_detail'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// ==================== 保费汇率配置表 ====================

export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(),
  insuranceCompany: text('insurance_company').default(''),
  currency: text('currency').notNull(),
  exchangeRate: real('exchange_rate').notNull(),
  effectiveDate: text('effective_date'),
  expiryDate: text('expiry_date'),
  creator: text('creator'),
  createTime: text('create_time'),
});

// ==================== 保费费率配置表 ====================

export const insuranceRates = sqliteTable('insurance_rates', {
  id: text('id').primaryKey(),
  productName: text('product_name').notNull(),
  rateMin: real('rate_min').notNull(),
  rateMax: real('rate_max'),
  rateType: text('rate_type').default('区间费率'),
  isDefault: integer('is_default').default(0),
  effectiveDate: text('effective_date'),
  expiryDate: text('expiry_date'),
  cargoType: text('cargo_type'),
  status: text('status').default('启用'),
  cargoValueRMB: real('cargo_value_rmb'),
  agreementNo: text('agreement_no'),
  minCharge: real('min_charge'),
  packageType: text('package_type'),
  oldNewType: text('old_new_type'),
  remark: text('remark'),
  creator: text('creator'),
  createTime: text('create_time'),
});

// ==================== 历史与审计表 ====================

export const historyVersions = sqliteTable('history_versions', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').notNull(),
  version: integer('version').notNull(),
  timestamp: text('timestamp').notNull(),
  label: text('label').notNull(),
  data: text('data').notNull(),
});

export const approvalHistory = sqliteTable('approval_history', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').notNull(),
  timestamp: text('timestamp').notNull(),
  approver: text('approver').notNull(),
  action: text('action').notNull(),
  comment: text('comment'),
});

export const changeLogs = sqliteTable('change_logs', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').notNull(),
  timestamp: text('timestamp').notNull(),
  user: text('user').notNull(),
  fieldLabel: text('field_label').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
});

// ==================== 缴费账单表 ====================

export const bills = sqliteTable('bills', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').notNull(),
  billNo: text('bill_no').notNull(),
  billAmount: real('bill_amount').default(0),
  billStatus: text('bill_status').default('待缴费'),
  paymentDeadline: text('payment_deadline'),
  paymentDate: text('payment_date'),
  billFiles: text('bill_files'),
  remark: text('remark'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// ==================== 发票表 ====================

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').notNull(),
  policyNumber: text('policy_number'),
  insuranceCompanyName: text('insurance_company_name'),
  invoiceNo: text('invoice_no').notNull(),
  invoiceAmount: real('invoice_amount').default(0),
  taxRate: real('tax_rate').default(0),
  taxAmount: real('tax_amount').default(0),
  policyHolderName: text('policy_holder_name'),
  insuredCompanyName: text('insured_company_name'),
  invoiceType: text('invoice_type').default('增值税普通发票'),
  invoiceDate: text('invoice_date'),
  invoiceStatus: text('invoice_status').default('已开具'),
  invoiceFiles: text('invoice_files'),
  remark: text('remark'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// ==================== 用户配置表 ====================

export const columnConfigs = sqliteTable('column_configs', {
  id: text('id').primaryKey(),
  configKey: text('config_key').notNull(),
  configData: text('config_data').notNull(),
  updatedAt: text('updated_at'),
});
