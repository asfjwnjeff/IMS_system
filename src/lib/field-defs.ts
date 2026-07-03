// 投保单详情/编辑 共享字段定义，保证两页顺序一致
// 字段标识全部使用生产系统命名

export interface FieldDef {
  key: string;
  label: string;
  span?: number;
  type?: 'text' | 'select' | 'number' | 'date' | 'textarea' | 'upload' | 'tag' | 'multiselect' | 'computed';
  required?: boolean;
  options?: readonly string[];
  dictType?: string;
  /** 是否为只读计算字段 */
  readonly?: boolean;
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
}

export const sections: SectionDef[] = [
  {
    title: '基本信息',
    fields: [
      { key: 'jobidref', label: '业务参考号' },
      { key: 'insuranceCategoryDesc', label: '投保类别', type: 'select', dictType: 'insuranceCategories' },
    ],
  },
  {
    title: '投/被保险人信息',
    fields: [
      { key: 'policyHolderNameDesc', label: '投保人企业名称', type: 'select', options: ['上海泓明供应链有限公司', '上海泓明国际货运有限公司', '福建泓明供应链有限公司', '南京泓明供应链有限公司'] },
      { key: 'creditCode', label: '统一社会信用代码', type: 'text' },
      { key: 'applicantContactName', label: '投保人联系人姓名' },
      { key: 'applicantContactPhone', label: '投保人联系电话' },
      { key: 'applicantContactAddress', label: '投保人联系地址', span: 2 },
      { key: 'insuredCompanyDesc', label: '客户名称' },
      { key: 'customerCreditCode', label: '客户统一社会信用代码' },
      { key: 'insuredCompanyName', label: '被保人企业名称' },
      { key: 'insuredCreditCode', label: '被保人统一社会信用代码' },
      { key: 'insuredContactName', label: '被保人联系人姓名' },
      { key: 'insuredContactPhone', label: '被保人联系电话' },
      { key: 'insuredAddressCountryCode', label: '被保人地址国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'insuredAddressCountry', label: '被保人地址国家', type: 'select', dictType: 'countries' },
      { key: 'insuredAddressProvince', label: '被保人地址省', type: 'select', dictType: 'provinces' },
      { key: 'insuredAddressCity', label: '被保人地址市', type: 'select', dictType: 'cities' },
      { key: 'insuredAddressDistrict', label: '被保人地址区', type: 'select', dictType: 'districts' },
      { key: 'insuredAddress', label: '被保人联系地址', span: 2 },
    ],
  },
  {
    title: '运输信息',
    fields: [
      { key: 'insuranceProductType', label: '承保产品类型', type: 'select', dictType: 'insuranceProductTypes' },
      { key: 'transportMode', label: '运输方式', type: 'select', dictType: 'transportModes' },
      { key: 'invoiceNo', label: '发票号' },
      { key: 'billNo', label: '提运单号' },
      { key: 'vesselName', label: '船名/车号/航班' },
      { key: 'transferPlateNo', label: '转运车牌号' },
      { key: 'isContainer', label: '是否集装箱', type: 'select', dictType: 'containerOptions' },
      { key: 'containerTypeDesc', label: '车厢类型', type: 'select', dictType: 'containerTypes' },
      { key: 'specialTransportRequirement', label: '特殊运输要求类型', type: 'select', dictType: 'transportRequirements' },
      { key: 'transitPort', label: '途径港', type: 'multiselect', dictType: 'ports' },
      { key: 'departureTime', label: '起运时间', type: 'date' },
      { key: 'originCountryCode', label: '起运国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'originCountry', label: '起运国家', type: 'select', dictType: 'countries' },
      { key: 'originProvince', label: '起运地地址省', type: 'select', dictType: 'provinces' },
      { key: 'originCity', label: '起运地地址市', type: 'select', dictType: 'cities' },
      { key: 'originDistrict', label: '起运地地址区', type: 'select', dictType: 'districts' },
      { key: 'originAddress', label: '起运地地址', span: 2 },
      { key: 'destCountryCode', label: '目的地国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'destCountry', label: '目的地国家', type: 'select', dictType: 'countries' },
      { key: 'destProvince', label: '目的地地址省', type: 'select', dictType: 'provinces' },
      { key: 'destCity', label: '目的地地址市', type: 'select', dictType: 'cities' },
      { key: 'destDistrict', label: '目的地地址区', type: 'select', dictType: 'districts' },
      { key: 'destAddress', label: '目的地地址', span: 2 },
    ],
  },
  {
    title: '货物信息',
    fields: [
      { key: 'packageTypeDesc', label: '包装种类', type: 'select', dictType: 'packageTypes' },
      { key: 'productNameCn', label: '中文商品名称', type: 'textarea' },
      { key: 'goodsModel', label: '货物型号' },
      { key: 'goodsNature', label: '货物性质', type: 'select', dictType: 'goodsNatures' },
      { key: 'goodsQuantity', label: '货物数量', type: 'number' },
      { key: 'packageQuantity', label: '件数', type: 'number' },
      { key: 'shippingMark', label: '唛头', span: 2 },
    ],
  },
  {
    title: '保险信息',
    fields: [
      { key: 'invoiceAmount', label: '发票金额', type: 'number' },
      { key: 'currencyCodeIdDesc', label: '币制中文名称', type: 'select', dictType: 'currencies' },
      { key: 'markupPercentageDesc', label: '加成比例', type: 'select', dictType: 'markupRatios' },
      { key: 'estimatedInsuranceAmount', label: '预计保险金额', type: 'computed', readonly: true },
      { key: 'estimatedPremium', label: '预计保费(人民币)', type: 'computed', readonly: true },
      { key: 'compensationCountryCode', label: '赔偿偿付地址国家标识', type: 'select', dictType: 'countryCodes' },
      { key: 'compensationCountry', label: '赔偿偿付地址国家', type: 'select', dictType: 'countries' },
      { key: 'compensationProvince', label: '赔偿偿付地址省', type: 'select', dictType: 'provinces' },
      { key: 'compensationCity', label: '赔偿偿付地址市', type: 'select', dictType: 'cities' },
      { key: 'compensationDistrict', label: '赔偿偿付地址区/县', type: 'select', dictType: 'districts' },
      { key: 'compensationAddress', label: '赔偿偿付地点' },
      { key: 'remark', label: '备注', type: 'textarea', span: 2 },
      { key: 'insuranceFiles', label: '投保附件', type: 'upload', span: 2 },
    ],
  },
  {
    title: '保单回填信息',
    fields: [
      { key: 'insuranceCompanyCode', label: '保险公司名称', type: 'select', dictType: 'insuranceCompanies' },
      { key: 'policyNumber', label: '保单单号' },
      { key: 'insuranceCompanyPolicyStatus', label: '保险公司保单状态', type: 'select', dictType: 'insurancePolicyStatuses' },
      { key: 'insuranceCompanyPremium', label: '实际保费', type: 'number' },
      { key: 'policyFiles', label: '保单附件', type: 'upload', span: 2 },
    ],
  },
  {
    title: '批改信息',
    fields: [
      { key: 'insuranceCompanyCorrectionStatus', label: '保险公司批改状态', type: 'select', dictType: 'insurancePolicyStatuses' },
      { key: 'correctionEnterpriseNumber', label: '批改企业编号' },
      { key: 'correctionOfPremiums', label: '批改实际保费', type: 'number' },
      { key: 'correctionFiles', label: '批改企业附件', type: 'upload' },
    ],
  },
];

// 字段到 JSON 段落的映射
export const SECTION_JSON_MAP: Record<string, string> = {
  // 基本信息是独立列
  jobidref: 'root',
  insuranceCategory: 'root',
  insuranceCategoryDesc: 'root',
  // 投/被保险人信息
  policyHolderNameDesc: 'applicantInfo',
  creditCode: 'applicantInfo',
  applicantContactName: 'applicantInfo',
  applicantContactPhone: 'applicantInfo',
  applicantContactAddress: 'applicantInfo',
  insuredCompanyDesc: 'applicantInfo',
  customerCreditCode: 'applicantInfo',
  insuredCompanyName: 'applicantInfo',
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
  containerTypeDesc: 'transportInfo',
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
  packageTypeDesc: 'cargoInfo',
  productNameCn: 'cargoInfo',
  goodsModel: 'cargoInfo',
  goodsNature: 'cargoInfo',
  goodsQuantity: 'cargoInfo',
  packageQuantity: 'cargoInfo',
  shippingMark: 'cargoInfo',
  // 保险信息
  invoiceAmount: 'insuranceInfo',
  currencyCodeIdDesc: 'insuranceInfo',
  markupPercentageDesc: 'insuranceInfo',
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
  insuranceCompanyCode: 'backfillInfo',
  policyNumber: 'backfillInfo',
  insuranceCompanyPolicyStatus: 'backfillInfo',
  insuranceCompanyPremium: 'backfillInfo',
  policyFiles: 'backfillInfo',
  // 批改信息
  insuranceCompanyCorrectionStatus: 'correctionInfo',
  correctionEnterpriseNumber: 'correctionInfo',
  correctionOfPremiums: 'correctionInfo',
  correctionFiles: 'correctionInfo',
};

/** 获取字段值：根据 SECTION_JSON_MAP 从正确的位置读取 */
export function getFieldValue(app: Record<string, unknown>, key: string): unknown {
  const section = SECTION_JSON_MAP[key];
  if (!section || section === 'root') return app[key];
  const sectionData = app[section] as Record<string, unknown> | undefined;
  return sectionData?.[key];
}
