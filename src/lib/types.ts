// ==================== 辅助类型 ====================

export interface EnterpriseOption {
  label: string;
  value: string;
  creditCode: string;
  address: string;
}

export interface AddressCascade {
  provinces: string[];
  cities: Record<string, string[]>;       // 省 → 市列表
  districts: Record<string, string[]>;    // 市 → 区列表
}

// ==================== 历史与审计 ====================

export interface HistoryVersion {
  id: string;
  applicationId: string;
  version: number;
  timestamp: string;
  label: string;
  data: string;
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
  currency: string;
  exchangeRate: number;
  effectiveDate: string;
  expiryDate: string;
  creator: string;
  createTime: string;
}

export interface InsuranceRate {
  id: string;
  productName: string;
  rateMin: number;
  rateMax: number | null;
  rateType: string;
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
  isDefault: boolean;
}

// ==================== 投保申请 - JSON 段落类型 ====================

export interface ApplicantInfo {
  policyHolderNameDesc: string;          // 投保人企业名称
  creditCode: string;                     // 统一社会信用代码
  applicantContactName: string;           // 投保人联系人姓名
  applicantContactPhone: string;          // 投保人联系电话
  applicantContactAddress: string;        // 投保人联系地址
  insuredCompanyDesc: string;             // 客户名称
  customerCreditCode: string;            // 客户统一社会信用代码
  insuredCompanyName: string;            // 被保人企业名称
  insuredCreditCode: string;             // 被保人统一社会信用代码
  insuredContactName: string;            // 被保人联系人姓名
  insuredContactPhone: string;           // 被保人联系电话
  insuredAddressCountryCode: string;     // 被保人地址国家标识
  insuredAddressCountry: string;         // 被保人地址国家
  insuredAddressProvince: string;        // 被保人地址省
  insuredAddressCity: string;            // 被保人地址市
  insuredAddressDistrict: string;        // 被保人地址区
  insuredAddress: string;                // 被保人联系地址
}

export interface TransportInfo {
  insuranceProductType: string;          // 承保产品类型
  transportMode: string;                  // 运输方式
  invoiceNo: string;                      // 发票号
  billNo: string;                         // 提运单号
  vesselName: string;                     // 船名/车号/航班
  transferPlateNo: string;               // 转运车牌号
  isContainer: string;                    // 是否集装箱
  containerTypeDesc: string;             // 车厢类型
  specialTransportRequirement: string;   // 特殊运输要求类型
  transitPort: string;                    // 途径港
  departureTime: string;                  // 起运时间
  originCountryCode: string;             // 起运国家标识
  originCountry: string;                  // 起运国家
  originProvince: string;                // 起运地地址省
  originCity: string;                    // 起运地地址市
  originDistrict: string;               // 起运地地址区
  originAddress: string;                 // 起运地地址
  destCountryCode: string;               // 目的地国家标识
  destCountry: string;                    // 目的地国家
  destProvince: string;                  // 目的地地址省
  destCity: string;                      // 目的地地址市
  destDistrict: string;                 // 目的地地址区
  destAddress: string;                   // 目的地地址
}

export interface CargoInfo {
  packageTypeDesc: string;               // 包装种类
  productNameCn: string;                  // 中文商品名称
  goodsModel: string;                     // 货物型号
  goodsNature: string;                    // 货物性质
  goodsQuantity: number;                  // 货物数量
  packageQuantity: number;                // 件数
  shippingMark: string;                   // 唛头
}

export interface InsurancePolicyInfo {
  invoiceAmount: number;                  // 发票金额
  currencyCodeIdDesc: string;            // 币制中文名称
  markupPercentageDesc: string;          // 加成比例
  estimatedInsuranceAmount: number;      // 预计保险金额（自动计算）
  estimatedPremium: number;              // 预计保费(人民币)（费率回填或单独报价）
  compensationCountryCode: string;       // 赔偿偿付地址国家标识
  compensationCountry: string;           // 赔偿偿付地址国家
  compensationProvince: string;         // 赔偿偿付地址省
  compensationCity: string;             // 赔偿偿付地址市
  compensationDistrict: string;         // 赔偿偿付地址区/县
  compensationAddress: string;          // 赔偿偿付地点
  remark: string;                        // 备注
  insuranceFiles: string[];              // 投保附件
}

export interface BackfillInfo {
  insuranceCompanyCode: string;          // 保险公司名称
  policyNumber: string;                   // 保单单号
  insuranceCompanyPolicyStatus: string;  // 保险公司保单状态
  insuranceCompanyPremium: number;       // 实际保费
  policyFiles: string[];                  // 保单附件
}

export interface CorrectionInfo {
  insuranceCompanyCorrectionStatus: string; // 保险公司批改状态
  correctionEnterpriseNumber: string;      // 批改企业编号
  correctionOfPremiums: number;            // 批改实际保费
  correctionFiles: string[];               // 批改企业附件
}

// ==================== 投保申请（主表） ====================

export interface InsuranceApplication {
  id: string;
  // 基本信息独立列
  jobidref: string;                        // 业务参考号
  insuranceCategory: string;               // 投保类别（内部值）
  insuranceCategoryDesc: string;           // 投保类别（显示值）
  policyHolderNameDesc: string;           // 投保人企业名称
  insuredCompanyDesc: string;             // 客户名称
  insuredCompanyName: string;             // 被保人企业名称
  workflowStatus: string;                  // 审批状态（内部值）
  workflowStatusDesc: string;             // 审批状态（显示值）
  submitTypeDesc: string;                 // 申请类型
  // 版本管理
  version: number;
  isLatest: boolean;
  previousId: string | null;
  // 列表用独立列
  documentStatusDesc: string;             // 文档状态
  auditReason: string;                     // 审批备注
  policyNo: string;                        // 投保单号
  applicationTime: string;                 // 投保时间
  applicantName: string;                   // 投保申请人姓名
  cosOrderStatus: string;                  // COS订单状态
  effectiveStatusDesc: string;            // 生效状态
  isBackfill: string;                      // 是否回填
  dataSources: string;                     // 数据来源
  insuranceCompanyName: string;           // 保险公司名称
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
  jobidref: string;
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
  productNameCn: string;
  cargoQuantity: number;
  packageTypeDesc: string;
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
  policyNumber: string;
  insuranceCompanyName: string;
  insuredCompanyName: string;
  claimResult: string;
  claimDetail: ClaimDetail;
  createdAt: string;
  updatedAt: string;
}

// ==================== 缴费账单 ====================

export interface PaymentBill {
  id: string;
  applicationId: string;
  billNo: string;
  billAmount: number;
  billStatus: string;
  paymentDeadline: string;   // 保费付款期限
  paymentDate: string;
  billFiles: string[];        // 缴费账单附件
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 发票 ====================

export interface Invoice {
  id: string;
  applicationId: string;
  policyNumber: string;       // 保单单号（只读）
  insuranceCompanyName: string; // 保险公司名称（只读）
  invoiceNo: string;
  invoiceAmount: number;
  taxRate: number;            // 税率
  taxAmount: number;          // 税额
  policyHolderName: string;   // 投保人企业名称
  insuredCompanyName: string; // 被保人企业名称
  invoiceType: string;        // 增值税普通发票 / 增值税专用发票
  invoiceDate: string;
  invoiceStatus: string;      // 已开具 / 已作废
  invoiceFiles: string[];     // 发票附件
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 用户列配置 ====================

export interface ColumnConfig {
  id: string;
  configKey: string;
  configData: string;
  updatedAt: string;
}

// ==================== 下拉选项常量 ====================

/** 投保人企业选项（含信用代码和地址联动） */
export const ENTERPRISE_OPTIONS: EnterpriseOption[] = [
  { label: '上海泓明供应链有限公司', value: '0', creditCode: '91310000733363087X', address: '上海市浦东新区金汇路1018号' },
  { label: '上海泓明国际货运有限公司', value: '1', creditCode: '91310000132248358N', address: '上海市浦东新区金汇路10181号' },
  { label: '福建泓明供应链有限公司', value: '2', creditCode: '91350200MA2XN0HK88', address: '上海市浦东新区金汇路10182号' },
  { label: '南京泓明供应链有限公司', value: '3', creditCode: '91320111MA1N18RW0H', address: '上海市浦东新区金汇路10183号' },
];

export const INSURANCE_COMPANIES = ['中国人保', '中国平安', '人保财险', '太平洋保险'] as const;

/** 审批状态（内部值 → 显示值） */
export const WORKFLOW_STATUS_MAP: Record<string, string> = {
  'Draft': '草稿',
  'WaitStart': '待发起',
  'Approving': '待审批',
  'Approved': '审批通过',
  'Reject': '审批拒绝',
};
export const WORKFLOW_STATUSES = Object.keys(WORKFLOW_STATUS_MAP);

/** 保单状态 */
export const INSURANCE_POLICY_STATUSES = ['已承保', '已批改', '待承保'] as const;

/** 承保产品类型 */
export const INSURANCE_PRODUCT_TYPES = ['国内运输险', '进口运输险', '出口运输险'] as const;

/** 运输方式 */
export const TRANSPORT_MODES = ['公路运输', '水路运输', '航空运输'] as const;

/** 车厢类型（6种） */
export const CONTAINER_TYPES = ['普通集装箱', '开顶集装箱', '框架集装箱', '冷藏集装箱', '平板卡车', '其他'] as const;

/** 特殊运输要求（5种） */
export const TRANSPORT_REQUIREMENTS = ['防震', '防倾斜', '防尘', '温控', '无'] as const;

/** 包装种类（14种） */
export const PACKAGE_TYPES = [
  '散装', '裸装', '球状罐类', '包/袋',
  '纸制或纤维板制盒/箱', '木制或竹藤等植物性材料制盒/箱',
  '其他材料制盒/箱', '纸制或纤维板制桶', '木制或竹藤等植物性材料制桶',
  '其他材料制桶', '再生木托', '天然木托', '植物性辅垫材料', '其他包装',
] as const;

/** 货物性质（3种） */
export const GOODS_NATURES = ['新货', '旧货', '危险货物'] as const;

/** 投保类别 */
export const INSURANCE_CATEGORIES = ['保税返库', '非保入库', '保税流转入库', '进境申报入库', '实物出库'] as const;
export const INSURANCE_CATEGORY_MAP: Record<string, string> = {
  '0': '保税返库', '1': '非保入库', '2': '保税流转入库', '3': '进境申报入库', '4': '实物出库',
};

/** 加成比例 */
export const MARKUP_RATIOS = ['发票金额原值100%', '发票金额原值110%'] as const;
export const MARKUP_RATIO_MAP: Record<string, number> = {
  '发票金额原值100%': 1.0,
  '发票金额原值110%': 1.1,
};

/** 币制 */
export const CURRENCIES = [
  '人民币', '美元', '欧元', '英镑', '日元', '港元',
  '台币', '韩元', '新加坡元', '加拿大元', '澳大利亚元',
  '瑞士法郎', '澳门元', '马来西亚林吉特',
] as const;

/** 国家 */
export const COUNTRIES = [
  '中国', '美国', '日本', '韩国', '德国', '英国',
  '新加坡', '马来西亚', '澳大利亚', '加拿大',
] as const;

/** 国家标识 */
export const COUNTRY_CODES = ['国内(Domestic)', '国际(International)'] as const;
export const COUNTRY_CODE_MAP: Record<string, string> = {
  '0': '国内(Domestic)', '1': '国际(International)',
};

/** 生效状态 */
export const EFFECTIVE_STATUSES = ['未生效', '生效', '失效'] as const;
export const EFFECTIVE_STATUS_MAP: Record<string, string> = {
  '0': '未生效', '1': '生效', '2': '失效',
};

/** 是否 */
export const YES_NO_OPTIONS = ['是', '否'] as const;

/** 申请类型 */
export const APPLICATION_TYPES = ['新增投保单', '批改申请'] as const;

/** 数据来源 */
export const DATA_SOURCES = ['fms', 'cos'] as const;

/** 发票类型 */
export const INVOICE_TYPES = ['增值税普通发票', '增值税专用发票'] as const;

/** 发票状态 */
export const INVOICE_STATUSES = ['已开具', '已作废'] as const;

/** 账单状态 */
export const BILL_STATUSES = ['待缴费', '已缴费', '已开票'] as const;

/** 理赔状态 */
export const CLAIM_STATUSES = ['待审批', '审批通过', '审批拒绝', '已确认'] as const;

/** 理赔结果 */
export const CLAIM_RESULTS = ['赔付', '拒赔', '部分赔付'] as const;

/** 省市区三级联动数据（硬编码） */
export const ADDRESS_CASCADE: AddressCascade = {
  provinces: ['上海市', '广东省', '辽宁省', '安徽省', '北京市', '江苏省', '浙江省', '湖北省', '福建省', '加利福尼亚州', '德克萨斯州', '东京都'],
  cities: {
    '上海市': ['上海市'],
    '广东省': ['深圳市', '广州市', '东莞市'],
    '辽宁省': ['大连市', '沈阳市'],
    '安徽省': ['合肥市', '芜湖市'],
    '北京市': ['北京市'],
    '江苏省': ['南京市', '苏州市', '昆山市'],
    '浙江省': ['杭州市', '宁波市'],
    '湖北省': ['武汉市'],
    '福建省': ['厦门市', '福州市'],
    '加利福尼亚州': ['洛杉矶', '旧金山'],
    '德克萨斯州': ['休斯顿', '达拉斯'],
    '东京都': ['东京'],
  },
  districts: {
    '上海市': ['浦东新区', '黄浦区', '徐汇区'],
    '深圳市': ['南山区', '福田区', '宝安区'],
    '广州市': ['天河区', '白云区'],
    '东莞市': ['长安镇'],
    '大连市': ['金州区', '甘井子区'],
    '沈阳市': ['铁西区'],
    '合肥市': ['蜀山区', '包河区'],
    '芜湖市': ['镜湖区'],
    '北京市': ['海淀区', '朝阳区'],
    '南京市': ['江宁区'],
    '苏州市': ['工业园区', '昆山市'],
    '昆山市': ['玉山镇'],
    '杭州市': ['滨江区'],
    '宁波市': ['北仑区'],
    '武汉市': ['洪山区', '光谷区'],
    '厦门市': ['思明区'],
    '福州市': ['鼓楼区'],
    '洛杉矶': ['Los Angeles Downtown'],
    '旧金山': ['San Francisco'],
    '休斯顿': ['Houston'],
    '达拉斯': ['Dallas'],
    '东京': ['千代田区', '港区'],
  },
};

/** 港口选项（途径港） */
export const PORT_OPTIONS = [
  '广州白云国际机场（中国）',
  '上海浦东国际机场（中国）',
  '深圳宝安国际机场（中国）',
  '连云港（中国）',
  '首尔（韩国）',
  '天津新港（中国）',
  '宁波舟山港（中国）',
  '青岛港（中国）',
];
