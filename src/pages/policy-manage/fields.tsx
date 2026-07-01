// 投保单详情/编辑 共享字段定义，保证两页顺序一致

export interface FieldDef {
  key: string;
  label: string;
  span?: number;    // 占几列，默认1
  type?: 'text' | 'select' | 'number' | 'date' | 'textarea' | 'upload' | 'tag';
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
      { key: 'insuranceCategory', label: '投保类别', type: 'select' },
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
      { key: 'insuredAddressCountryCode', label: '被保人地址国家标识', type: 'select' },
      { key: 'insuredAddressCountry', label: '被保人地址国家', type: 'select' },
      { key: 'insuredAddressProvince', label: '被保人地址省', type: 'select' },
      { key: 'insuredAddressCity', label: '被保人地址市', type: 'select' },
      { key: 'insuredAddressDistrict', label: '被保人地址区', type: 'select' },
      { key: 'insuredAddress', label: '被保人联系地址', span: 2 },
    ],
  },
  {
    title: '运输信息',
    fields: [
      { key: 'insuranceProductType', label: '承保产品类型', type: 'select' },
      { key: 'transportMode', label: '运输方式', type: 'select' },
      { key: 'invoiceNo', label: '发票号' },
      { key: 'billNo', label: '提运单号' },
      { key: 'vesselName', label: '船名/车号/航班' },
      { key: 'transferPlateNo', label: '转运车牌号' },
      { key: 'isContainer', label: '是否集装箱', type: 'select' },
      { key: 'carriageType', label: '车厢类型', type: 'select' },
      { key: 'specialTransportRequirement', label: '特殊运输要求类型', type: 'select' },
      { key: 'transitPort', label: '途径港', type: 'select' },
      { key: 'departureTime', label: '起运时间', type: 'date' },
      { key: 'originCountryCode', label: '起运国家标识', type: 'select' },
      { key: 'originCountry', label: '起运国家', type: 'select' },
      { key: 'originProvince', label: '起运地地址省', type: 'select' },
      { key: 'originCity', label: '起运地地址市', type: 'select' },
      { key: 'originDistrict', label: '起运地地址区', type: 'select' },
      { key: 'originAddress', label: '起运地地址', span: 2 },
      { key: 'destCountryCode', label: '目的地国家标识', type: 'select' },
      { key: 'destCountry', label: '目的地国家', type: 'select' },
      { key: 'destProvince', label: '目的地地址省', type: 'select' },
      { key: 'destCity', label: '目的地地址市', type: 'select' },
      { key: 'destDistrict', label: '目的地地址区', type: 'select' },
      { key: 'destAddress', label: '目的地地址', span: 2 },
    ],
  },
  {
    title: '货物信息',
    fields: [
      { key: 'packageType', label: '包装种类', type: 'select' },
      { key: 'goodsNameCN', label: '中文商品名称', type: 'textarea' },
      { key: 'goodsModel', label: '货物型号' },
      { key: 'goodsNature', label: '货物性质', type: 'select' },
      { key: 'goodsQuantity', label: '货物数量', type: 'number' },
      { key: 'quantity', label: '件数', type: 'number' },
      { key: 'shippingMark', label: '唛头', span: 2 },
    ],
  },
  {
    title: '保险信息',
    fields: [
      { key: 'invoiceAmount', label: '发票金额', type: 'number' },
      { key: 'currencyName', label: '币制中文名称', type: 'select' },
      { key: 'markupRatio', label: '加成比例', type: 'select' },
      { key: 'estimatedInsuranceAmount', label: '预计保险金额', type: 'number' },
      { key: 'estimatedPremium', label: '预计保费(人民币)', type: 'number' },
      { key: 'compensationCountryCode', label: '赔偿偿付地址国家标识', type: 'select' },
      { key: 'compensationCountry', label: '赔偿偿付地址国家', type: 'select' },
      { key: 'compensationProvince', label: '赔偿偿付地址省', type: 'select' },
      { key: 'compensationCity', label: '赔偿偿付地址市', type: 'select' },
      { key: 'compensationDistrict', label: '赔偿偿付地址区/县', type: 'select' },
      { key: 'compensationAddress', label: '赔偿偿付地点' },
      { key: 'remark', label: '备注', type: 'textarea', span: 2 },
      { key: 'insuranceFiles', label: '投保附件', type: 'upload', span: 2 },
    ],
  },
  {
    title: '保单回填信息',
    fields: [
      { key: 'insuranceCompany', label: '保险公司名称', type: 'select' },
      { key: 'policyNo', label: '保单单号' },
      { key: 'insurancePolicyStatus', label: '保险公司保单状态', type: 'select' },
      { key: 'actualPremium', label: '实际保费', type: 'number' },
      { key: 'policyFiles', label: '保单附件', type: 'upload', span: 2 },
    ],
  },
  {
    title: '批改信息',
    fields: [
      { key: 'insuranceCorrectionStatus', label: '保险公司批改状态', type: 'select' },
      { key: 'correctionCompanyNo', label: '批改企业编号' },
      { key: 'correctionActualPremium', label: '批改实际保费', type: 'number' },
      { key: 'correctionFiles', label: '批改企业附件', type: 'upload' },
    ],
  },
];
