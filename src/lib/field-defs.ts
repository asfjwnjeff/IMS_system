// 投保单详情/编辑 共享字段定义，保证两页顺序一致
// 从旧 IMS fields.tsx 迁移 — 拆分为纯数据模块

export interface FieldDef {
  key: string;
  label: string;
  span?: number;    // 占几列，默认1
  type?: 'text' | 'select' | 'number' | 'date' | 'textarea' | 'upload' | 'tag';
  required?: boolean;
  options?: readonly string[];  // select 的下拉选项（静态常量）
  dictType?: string;            // select 的动态字典类型（从 /api/dict 加载）
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
}

export const sections: SectionDef[] = [
  {
    title: '基本信息',
    fields: [
      { key: 'businessRefNo', label: '业务参考号' },
      { key: 'insuranceCategory', label: '投保类别', type: 'select', dictType: 'insuranceCategories' },
    ],
  },
  {
    title: '投/被保险人信息',
    fields: [
      { key: 'applicantCompany', label: '投保人企业名称' },
      { key: 'applicantCreditCode', label: '投保人统一社会信用代码' },
      { key: 'applicantContactName', label: '投保人联系人姓名' },
      { key: 'applicantContactPhone', label: '投保人联系电话' },
      { key: 'applicantContactAddress', label: '投保人联系地址', span: 2 },
      { key: 'customerName', label: '客户名称' },
      { key: 'customerCreditCode', label: '客户统一社会信用代码' },
      { key: 'insuredCompany', label: '被保人企业名称' },
      { key: 'insuredCreditCode', label: '被保人统一社会信用代码' },
      { key: 'insuredContactName', label: '被保人联系人姓名' },
      { key: 'insuredContactPhone', label: '被保人联系电话' },
      { key: 'insuredAddressCountryCode', label: '被保人地址国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'insuredAddressCountry', label: '被保人地址国家', type: 'select', dictType: 'countries' },
      { key: 'insuredAddressProvince', label: '被保人地址省' },
      { key: 'insuredAddressCity', label: '被保人地址市' },
      { key: 'insuredAddressDistrict', label: '被保人地址区' },
      { key: 'insuredAddress', label: '被保人联系地址', span: 2 },
    ],
  },
  {
    title: '运输信息',
    fields: [
      { key: 'insuranceProductType', label: '承保产品类型', type: 'select', dictType: 'insuranceCategories' },
      { key: 'transportMode', label: '运输方式', type: 'select', dictType: 'transportModes' },
      { key: 'invoiceNo', label: '发票号' },
      { key: 'billNo', label: '提运单号' },
      { key: 'vesselName', label: '船名/车号/航班' },
      { key: 'transferPlateNo', label: '转运车牌号' },
      { key: 'isContainer', label: '是否集装箱', type: 'select', dictType: 'containerOptions' },
      { key: 'carriageType', label: '车厢类型', type: 'select', dictType: 'carriageTypes' },
      { key: 'specialTransportRequirement', label: '特殊运输要求类型' },
      { key: 'transitPort', label: '途径港' },
      { key: 'departureTime', label: '起运时间', type: 'date' },
      { key: 'originCountryCode', label: '起运国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'originCountry', label: '起运国家', type: 'select', dictType: 'countries' },
      { key: 'originProvince', label: '起运地地址省' },
      { key: 'originCity', label: '起运地地址市' },
      { key: 'originDistrict', label: '起运地地址区' },
      { key: 'originAddress', label: '起运地地址', span: 2 },
      { key: 'destCountryCode', label: '目的地国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'destCountry', label: '目的地国家', type: 'select', dictType: 'countries' },
      { key: 'destProvince', label: '目的地地址省' },
      { key: 'destCity', label: '目的地地址市' },
      { key: 'destDistrict', label: '目的地地址区' },
      { key: 'destAddress', label: '目的地地址', span: 2 },
    ],
  },
  {
    title: '货物信息',
    fields: [
      { key: 'packageType', label: '包装种类', type: 'select', dictType: 'packageTypes' },
      { key: 'goodsNameCN', label: '中文商品名称', type: 'textarea' },
      { key: 'goodsModel', label: '货物型号' },
      { key: 'goodsNature', label: '货物性质', type: 'select', dictType: 'goodsNatures' },
      { key: 'goodsQuantity', label: '货物数量', type: 'number' },
      { key: 'quantity', label: '件数', type: 'number' },
      { key: 'shippingMark', label: '唛头', span: 2 },
    ],
  },
  {
    title: '保险信息',
    fields: [
      { key: 'invoiceAmount', label: '发票金额', type: 'number' },
      { key: 'currencyName', label: '币制中文名称', type: 'select', dictType: 'currencies' },
      { key: 'markupRatio', label: '加成比例', type: 'select', dictType: 'markupRatios' },
      { key: 'estimatedInsuranceAmount', label: '预计保险金额', type: 'number' },
      { key: 'estimatedPremium', label: '预计保费(人民币)', type: 'number' },
      { key: 'compensationCountryCode', label: '赔偿偿付地址国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'compensationCountry', label: '赔偿偿付地址国家', type: 'select', dictType: 'countries' },
      { key: 'compensationProvince', label: '赔偿偿付地址省' },
      { key: 'compensationCity', label: '赔偿偿付地址市' },
      { key: 'compensationDistrict', label: '赔偿偿付地址区/县' },
      { key: 'compensationAddress', label: '赔偿偿付地点' },
      { key: 'remark', label: '备注', type: 'textarea', span: 2 },
      { key: 'insuranceFiles', label: '投保附件', type: 'upload', span: 2 },
    ],
  },
  {
    title: '保单回填信息',
    fields: [
      { key: 'insuranceCompany', label: '保险公司名称', type: 'select', dictType: 'insuranceCompanies' },
      { key: 'policyNo', label: '保单单号' },
      { key: 'insurancePolicyStatus', label: '保险公司保单状态', type: 'select', dictType: 'insurancePolicyStatuses' },
      { key: 'actualPremium', label: '实际保费', type: 'number' },
      { key: 'policyFiles', label: '保单附件', type: 'upload', span: 2 },
    ],
  },
  {
    title: '批改信息',
    fields: [
      { key: 'insuranceCorrectionStatus', label: '保险公司批改状态', type: 'select', dictType: 'insurancePolicyStatuses' },
      { key: 'correctionCompanyNo', label: '批改企业编号' },
      { key: 'correctionActualPremium', label: '批改实际保费', type: 'number' },
      { key: 'correctionFiles', label: '批改企业附件', type: 'upload' },
    ],
  },
];

// 字段到 JSON 段落的映射
export const SECTION_JSON_MAP: Record<string, string> = {
  // 基本信息是独立列
  businessRefNo: 'root',
  insuranceCategory: 'root',
  // 投/被保险人信息
  applicantCompany: 'applicantInfo',
  applicantCreditCode: 'applicantInfo',
  applicantContactName: 'applicantInfo',
  applicantContactPhone: 'applicantInfo',
  applicantContactAddress: 'applicantInfo',
  customerName: 'applicantInfo',
  customerCreditCode: 'applicantInfo',
  insuredCompany: 'applicantInfo',
  insuredCreditCode: 'applicantInfo',
  insuredContactName: 'applicantInfo',
  insuredContactPhone: 'applicantInfo',
  insuredAddressCountryCode: 'applicantInfo',
  insuredAddressCountry: 'applicantInfo',
  insuredAddressProvince: 'applicantInfo',
  insuredAddressCity: 'applicantInfo',
  insuredAddressDistrict: 'applicantInfo',
  insuredAddress: 'applicantInfo',
  // 运输信息
  insuranceProductType: 'transportInfo',
  transportMode: 'transportInfo',
  invoiceNo: 'transportInfo',
  billNo: 'transportInfo',
  vesselName: 'transportInfo',
  transferPlateNo: 'transportInfo',
  isContainer: 'transportInfo',
  carriageType: 'transportInfo',
  specialTransportRequirement: 'transportInfo',
  transitPort: 'transportInfo',
  departureTime: 'transportInfo',
  originCountryCode: 'transportInfo',
  originCountry: 'transportInfo',
  originProvince: 'transportInfo',
  originCity: 'transportInfo',
  originDistrict: 'transportInfo',
  originAddress: 'transportInfo',
  destCountryCode: 'transportInfo',
  destCountry: 'transportInfo',
  destProvince: 'transportInfo',
  destCity: 'transportInfo',
  destDistrict: 'transportInfo',
  destAddress: 'transportInfo',
  // 货物信息
  packageType: 'cargoInfo',
  goodsNameCN: 'cargoInfo',
  goodsModel: 'cargoInfo',
  goodsNature: 'cargoInfo',
  goodsQuantity: 'cargoInfo',
  quantity: 'cargoInfo',
  shippingMark: 'cargoInfo',
  // 保险信息
  invoiceAmount: 'insuranceInfo',
  currencyName: 'insuranceInfo',
  markupRatio: 'insuranceInfo',
  estimatedInsuranceAmount: 'insuranceInfo',
  estimatedPremium: 'insuranceInfo',
  compensationCountryCode: 'insuranceInfo',
  compensationCountry: 'insuranceInfo',
  compensationProvince: 'insuranceInfo',
  compensationCity: 'insuranceInfo',
  compensationDistrict: 'insuranceInfo',
  compensationAddress: 'insuranceInfo',
  remark: 'insuranceInfo',
  insuranceFiles: 'insuranceInfo',
  // 保单回填
  insuranceCompany: 'backfillInfo',
  policyNo: 'backfillInfo',
  insurancePolicyStatus: 'backfillInfo',
  actualPremium: 'backfillInfo',
  policyFiles: 'backfillInfo',
  // 批改信息
  insuranceCorrectionStatus: 'correctionInfo',
  correctionCompanyNo: 'correctionInfo',
  correctionActualPremium: 'correctionInfo',
  correctionFiles: 'correctionInfo',
};

// 获取字段值：根据 SECTION_JSON_MAP 从正确的位置读取
export function getFieldValue(app: Record<string, unknown>, key: string): unknown {
  const section = SECTION_JSON_MAP[key];
  if (!section || section === 'root') return app[key];
  const sectionData = app[section] as Record<string, unknown> | undefined;
  return sectionData?.[key];
}
