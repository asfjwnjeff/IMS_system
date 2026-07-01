// ========== 基础信息 ==========

/** 保费汇率配置 */
export interface ExchangeRate {
  id: number;
  insuranceCompany: string;
  exchangeRate: number;
  effectiveDate: string;
  expiryDate: string;
  currency: string;
  creator: string;
  createTime: string;
}

/** 保费费率配置 */
export interface InsuranceRate {
  id: number;
  insuranceCompany: string;
  rate: number;
  effectiveDate: string;
  expiryDate: string;
  cargoType: string;
  status: '启用' | '禁用';
  cargoValueRMB: number;
  agreementNo: string;
  minCharge: number;
  packageType: string;
  oldNewType: string;
  remark: string;
  creator: string;
  createTime: string;
}

// ========== 保单管理 ==========

/** 投保申请表 */
export interface InsuranceApplication {
  id: number;
  // 基本信息
  businessRefNo: string;
  insuranceCategory: string; // 投保类别
  // 投/被保险人信息
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
  // 运输信息
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
  // 货物信息
  packageType: string;
  goodsNameCN: string;
  goodsModel: string;
  goodsNature: string;
  goodsQuantity: number;
  quantity: number;
  shippingMark: string;
  // 保险信息
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
  // 保单回填信息
  insuranceCompany: string;
  policyNo: string;
  insurancePolicyStatus: string;
  actualPremium: number;
  policyFiles: string[];
  // 批改信息
  insuranceCorrectionStatus: string;
  correctionCompanyNo: string;
  correctionActualPremium: number;
  correctionFiles: string[];
  // 版本管理
  isLatest: boolean;
  version: number;
  previousId: number | null;
  // 列表用
  applicationType: string;
  approvalStatus: string;
  documentStatus: string;
  approvalRemark: string;
  applicationNo: string;
  applicationTime: string;
  applicantName: string;
  cosOrderStatus: string;
  effectiveStatus: string;
  isBackfill: string;
  dataSource: string;
}

// ========== 报案理赔 ==========

/** 报案理赔 */
export interface ClaimReport {
  id: number;
  reportNo: string;
  reportStatus: string;
  reportTime: string;
  applicantName: string;
  policyNo: string;
  insuranceCompany: string;
  insuredCompany: string;
  claimResult: string;
  // Detail fields
  businessRefNo?: string;
  applicantDept?: string;
  billNo?: string;
  // Customer info
  originCountryCode?: string;
  originCountry?: string;
  originProvince?: string;
  originCity?: string;
  originDistrict?: string;
  originAddress?: string;
  consigneeName?: string;
  destCountryCode?: string;
  destCountry?: string;
  destProvince?: string;
  destCity?: string;
  destDistrict?: string;
  destAddress?: string;
  // Cargo info
  goodsName?: string;
  cargoQuantity?: number;
  packageType2?: string;
  estimatedLossAmount?: number;
  lossCurrency?: string;
  accidentTime?: string;
  accidentCountryCode?: string;
  accidentCountry?: string;
  accidentProvince?: string;
  accidentCity?: string;
  accidentDistrict?: string;
  accidentAddress?: string;
  accidentDescription?: string;
  accidentFiles?: string[];
  // Claim confirm
  claimResultDetail?: string;
  claimAmount?: number;
  claimFiles?: string[];
}
