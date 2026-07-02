import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ==================== 投保申请表 ====================

export const insuranceApplications = sqliteTable('insurance_applications', {
  id: text('id').primaryKey(),
  // 基本信息 - 独立列（搜索/筛选用）
  businessRefNo: text('business_ref_no').notNull(),
  insuranceCategory: text('insurance_category'),
  applicantCompany: text('applicant_company'),
  customerName: text('customer_name'),
  insuredCompany: text('insured_company'),
  approvalStatus: text('approval_status').default('审批中'),
  applicationType: text('application_type'),
  // 版本管理
  version: integer('version').default(1),
  isLatest: integer('is_latest', { mode: 'boolean' }).default(true),
  previousId: text('previous_id'),
  // 列表用字段
  documentStatus: text('document_status'),
  approvalRemark: text('approval_remark'),
  applicationNo: text('application_no'),
  applicationTime: text('application_time'),
  applicantName: text('applicant_name'),
  cosOrderStatus: text('cos_order_status'),
  effectiveStatus: text('effective_status'),
  isBackfill: text('is_backfill'),
  dataSource: text('data_source'),
  // JSON 段落
  applicantInfo: text('applicant_info'),       // ApplicantInfo
  transportInfo: text('transport_info'),       // TransportInfo
  cargoInfo: text('cargo_info'),               // CargoInfo
  insuranceInfo: text('insurance_info'),       // InsurancePolicyInfo
  backfillInfo: text('backfill_info'),         // BackfillInfo
  correctionInfo: text('correction_info'),     // CorrectionInfo
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
  policyNo: text('policy_no'),
  insuranceCompany: text('insurance_company'),
  insuredCompany: text('insured_company'),
  claimResult: text('claim_result'),
  claimDetail: text('claim_detail'), // JSON: ClaimDetail
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// ==================== 保费汇率配置表 ====================

export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(),
  insuranceCompany: text('insurance_company').notNull(),
  exchangeRate: real('exchange_rate').notNull(),
  effectiveDate: text('effective_date'),
  expiryDate: text('expiry_date'),
  currency: text('currency'),
  creator: text('creator'),
  createTime: text('create_time'),
});

// ==================== 保费费率配置表 ====================

export const insuranceRates = sqliteTable('insurance_rates', {
  id: text('id').primaryKey(),
  insuranceCompany: text('insurance_company').notNull(),
  rate: real('rate').notNull(),
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
  data: text('data').notNull(), // JSON snapshot
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

// ==================== 用户配置表（替代 localStorage） ====================

export const columnConfigs = sqliteTable('column_configs', {
  id: text('id').primaryKey(),
  configKey: text('config_key').notNull(),
  configData: text('config_data').notNull(), // JSON
  updatedAt: text('updated_at'),
});
