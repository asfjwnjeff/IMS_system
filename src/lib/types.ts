// ==================== 辅助类型 ====================

export interface HistoryVersion {
  id: string;
  applicationId: string;
  version: number;
  timestamp: string;
  label: string;
  data: string; // JSON snapshot
}

export interface ApprovalHistoryEntry {
  id: string;
  applicationId: string;
  timestamp: string;
  approver: string;
  action: string;
  comment: string;
}

export interface ChangeLogEntry {
  id: string;
  applicationId: string;
  timestamp: string;
  user: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

// ==================== 基础信息 ====================

export interface ExchangeRate {
  id: string;
  insuranceCompany: string;
  exchangeRate: number;
  effectiveDate: string;
  expiryDate: string;
  currency: string;
  creator: string;
  createTime: string;
}

export interface InsuranceRate {
  id: string;
  insuranceCompany: string;
  rate: number;
  effectiveDate: string;
  expiryDate: string;
  cargoType: string;
  status: string;
  cargoValueRMB: number;
  agreementNo: string;
  minCharge: number;
  packageType: string;
  oldNewType: string;
  remark: string;
  creator: string;
  createTime: string;
}

// ==================== 投保申请 - JSON 段落类型 ====================

export interface ApplicantInfo {
  applicantCompany: string;
  applicantCreditCode: string;
  applicantContactName: string;
  applicantContactPhone: string;
  applicantContactAddress: string;
  customerName: string;
  customerCreditCode: string;
  insuredCompany: string;
  insuredCreditCode: string;
  insuredContactName: string;
  insuredContactPhone: string;
  insuredAddressCountryCode: string;
  insuredAddressCountry: string;
  insuredAddressProvince: string;
  insuredAddressCity: string;
  insuredAddressDistrict: string;
  insuredAddress: string;
}

export interface TransportInfo {
  insuranceProductType: string;
  transportMode: string;
  invoiceNo: string;
  billNo: string;
  vesselName: string;
  transferPlateNo: string;
  isContainer: string;
  carriageType: string;
  specialTransportRequirement: string;
  transitPort: string;
  departureTime: string;
  originCountryCode: string;
  originCountry: string;
  originProvince: string;
  originCity: string;
  originDistrict: string;
  originAddress: string;
  destCountryCode: string;
  destCountry: string;
  destProvince: string;
  destCity: string;
  destDistrict: string;
  destAddress: string;
}

export interface CargoInfo {
  packageType: string;
  goodsNameCN: string;
  goodsModel: string;
  goodsNature: string;
  goodsQuantity: number;
  quantity: number;
  shippingMark: string;
}

export interface InsurancePolicyInfo {
  invoiceAmount: number;
  currencyName: string;
  markupRatio: string;
  estimatedInsuranceAmount: number;
  estimatedPremium: number;
  compensationCountryCode: string;
  compensationCountry: string;
  compensationProvince: string;
  compensationCity: string;
  compensationDistrict: string;
  compensationAddress: string;
  remark: string;
  insuranceFiles: string[];
}

export interface BackfillInfo {
  insuranceCompany: string;
  policyNo: string;
  insurancePolicyStatus: string;
  actualPremium: number;
  policyFiles: string[];
}

export interface CorrectionInfo {
  insuranceCorrectionStatus: string;
  correctionCompanyNo: string;
  correctionActualPremium: number;
  correctionFiles: string[];
}

// ==================== 投保申请 ====================

export interface InsuranceApplication {
  id: string;
  // 基本信息 - 独立列（用于搜索/筛选）
  businessRefNo: string;
  insuranceCategory: string;
  applicantCompany: string;
  customerName: string;
  insuredCompany: string;
  approvalStatus: string;
  applicationType: string;
  // 版本管理 - 独立列
  version: number;
  isLatest: boolean;
  previousId: string | null;
  // 列表用字段 - 独立列
  documentStatus: string;
  approvalRemark: string;
  applicationNo: string;
  applicationTime: string;
  applicantName: string;
  cosOrderStatus: string;
  effectiveStatus: string;
  isBackfill: string;
  dataSource: string;
  // JSON 段落
  applicantInfo: ApplicantInfo;
  transportInfo: TransportInfo;
  cargoInfo: CargoInfo;
  insuranceInfo: InsurancePolicyInfo;
  backfillInfo: BackfillInfo;
  correctionInfo: CorrectionInfo;
  // 时间戳
  createdAt: string;
  updatedAt: string;
}

// ==================== 报案理赔 ====================

export interface ClaimDetail {
  applicantDept: string;
  billNo: string;
  businessRefNo: string;
  // 客户信息
  originCountryCode: string;
  originCountry: string;
  originProvince: string;
  originCity: string;
  originDistrict: string;
  originAddress: string;
  consigneeName: string;
  destCountryCode: string;
  destCountry: string;
  destProvince: string;
  destCity: string;
  destDistrict: string;
  destAddress: string;
  // 货物信息
  goodsName: string;
  cargoQuantity: number;
  packageType2: string;
  estimatedLossAmount: number;
  lossCurrency: string;
  // 事故信息
  accidentTime: string;
  accidentCountryCode: string;
  accidentCountry: string;
  accidentProvince: string;
  accidentCity: string;
  accidentDistrict: string;
  accidentAddress: string;
  accidentDescription: string;
  accidentFiles: string[];
  // 理赔确认
  claimResultDetail: string;
  claimAmount: number;
  claimFiles: string[];
}

export interface ClaimReport {
  id: string;
  reportNo: string;
  reportStatus: string;
  reportTime: string;
  applicantName: string;
  policyNo: string;
  insuranceCompany: string;
  insuredCompany: string;
  claimResult: string;
  claimDetail: ClaimDetail;
  createdAt: string;
  updatedAt: string;
}

// ==================== 用户列配置 ====================

export interface ColumnConfig {
  id: string;
  configKey: string;
  configData: string; // JSON
  updatedAt: string;
}

// ==================== 下拉选项常量 ====================

export const INSURANCE_COMPANIES = ['中国人保', '中国平安', '人保财险', '太平洋保险'] as const;
export const APPROVAL_STATUSES = ['审批通过', '审批拒绝', '审批中', '已确认'] as const;
export const INSURANCE_POLICY_STATUSES = ['已承保', '已批改', '待承保'] as const;
export const CLAIM_STATUSES = ['审批通过', '审批拒绝', '已确认', '待审批'] as const;
export const CURRENCIES = [
  '人民币', '美元', '欧元', '英镑', '日元', '港元',
  '台币', '韩元', '新加坡元', '加拿大元', '澳大利亚元',
  '瑞士法郎', '澳门元', '马来西亚林吉特',
] as const;
export const COUNTRIES = [
  '中国', '美国', '日本', '韩国', '德国', '英国',
  '新加坡', '马来西亚', '澳大利亚', '加拿大',
] as const;
export const PACKAGE_TYPES = [
  '木制或竹藤等植物性材料制盒/箱', '纸制或纤维板制盒/箱',
  '天然木托', '球状罐类', '普通集装箱', '其他',
] as const;
export const OLD_NEW_TYPES = ['新货', '旧货'] as const;
