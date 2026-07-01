import type { ExchangeRate, InsuranceRate, InsuranceApplication, ClaimReport } from '../types';

export const mockExchangeRates: ExchangeRate[] = [
  { id: 1, insuranceCompany: '中国人保', exchangeRate: 0.2159, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '台币', creator: '陆晓峰', createTime: '2026-06-01 09:44:34' },
  { id: 2, insuranceCompany: '中国人保', exchangeRate: 1.7116, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '马来西亚林吉特', creator: '陆晓峰', createTime: '2026-06-01 09:44:01' },
  { id: 3, insuranceCompany: '中国人保', exchangeRate: 0.00453, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '韩国圆', creator: '陆晓峰', createTime: '2026-06-01 09:43:34' },
  { id: 4, insuranceCompany: '中国人保', exchangeRate: 0.8445, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '澳门元', creator: '陆晓峰', createTime: '2026-06-01 09:42:04' },
  { id: 5, insuranceCompany: '中国人保', exchangeRate: 4.8641, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '澳大利亚元', creator: '陆晓峰', createTime: '2026-06-01 09:41:33' },
  { id: 6, insuranceCompany: '中国人保', exchangeRate: 4.9257, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '加拿大元', creator: '陆晓峰', createTime: '2026-06-01 09:40:59' },
  { id: 7, insuranceCompany: '中国人保', exchangeRate: 8.6715, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '瑞士法郎', creator: '陆晓峰', createTime: '2026-06-01 09:40:11' },
  { id: 8, insuranceCompany: '中国人保', exchangeRate: 5.3271, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '新加坡元', creator: '陆晓峰', createTime: '2026-06-01 09:39:44' },
  { id: 9, insuranceCompany: '中国人保', exchangeRate: 9.1335, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '英镑', creator: '陆晓峰', createTime: '2026-06-01 09:39:10' },
  { id: 10, insuranceCompany: '中国人保', exchangeRate: 7.916, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '欧元', creator: '陆晓峰', createTime: '2026-06-01 09:38:40' },
  { id: 11, insuranceCompany: '中国人保', exchangeRate: 0.05093, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '日元', creator: '陆晓峰', createTime: '2026-06-01 09:38:05' },
  { id: 12, insuranceCompany: '中国人保', exchangeRate: 0.9297, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '港元', creator: '陆晓峰', createTime: '2026-06-01 09:37:29' },
  { id: 13, insuranceCompany: '中国人保', exchangeRate: 7.2481, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '美元', creator: '陆晓峰', createTime: '2026-06-01 09:37:00' },
  { id: 14, insuranceCompany: '中国人保', exchangeRate: 1.0, effectiveDate: '2026-06-01', expiryDate: '2026-06-30', currency: '人民币', creator: '陆晓峰', createTime: '2026-06-01 09:36:00' },
];

export const mockInsuranceRates: InsuranceRate[] = [
  { id: 1, insuranceCompany: '中国人保', rate: 0.00025, effectiveDate: '2026-06-09', expiryDate: '2026-06-30', cargoType: 'CPU', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2026-06-09 10:25:23' },
  { id: 2, insuranceCompany: '中国人保', rate: 0.0004, effectiveDate: '2025-09-07', expiryDate: '2026-09-06', cargoType: '裸装的半导体反应腔、激光发生器、升降机、冷却器、电路板', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2026-01-19 16:08:37' },
  { id: 3, insuranceCompany: '中国人保', rate: 0.0004, effectiveDate: '2025-09-07', expiryDate: '2026-09-06', cargoType: '全新的电子产品、电子元器件、精密仪器', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2026-01-19 16:07:14' },
  { id: 4, insuranceCompany: '中国平安', rate: 0.00042, effectiveDate: '2025-09-28', expiryDate: '2026-09-27', cargoType: '精密仪器、普通货物', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2025-11-12 17:01:51' },
];

// 「新增投保单」的完整字段填充（按记录差异化）
const fill_1 = {
  transitPort: '广州白云国际机场（中国）', carriageType: '其他', packageType: '木制或竹藤等植物性材料制盒/箱',
  goodsNameCN: '升降搬运装置等(详见COMMERCIALINVOICE)', quantity: 1, currencyName: '美元',
  invoiceAmount: 56035, estimatedInsuranceAmount: 61638.5, markupRatio: '发票金额原值110%',
  estimatedPremium: 168.09, actualPremium: 168.12, insuranceCompany: '中国人保',
  policyNo: 'PYII2026310100000023', insurancePolicyStatus: '已承保',
  insuranceCorrectionStatus: '已批改', correctionActualPremium: 168.12, correctionCompanyNo: 'EYII202631010000000599',
  applicantCreditCode: '91310115MA1H2B3C4D', applicantContactName: '谭泽宇', applicantContactPhone: '021-58345678', applicantContactAddress: '上海市浦东新区张江高科技园区碧波路690号',
  customerCreditCode: '91440300MA5D6E7F8G', insuredCreditCode: '91440300MA5D6E7F8G',
  insuredContactName: '王明辉', insuredContactPhone: '0755-86543210',
  insuredAddressCountryCode: '国内(Domestic)', insuredAddressCountry: '中国', insuredAddressProvince: '广东省', insuredAddressCity: '深圳市', insuredAddressDistrict: '南山区', insuredAddress: '深圳市南山区粤海街道科苑路15号',
  insuranceProductType: '进口运输险', transportMode: '航空运输', invoiceNo: 'INV-2026-0625-001', billNo: '99993756972', vesselName: 'CA1234', transferPlateNo: '', isContainer: '否',
  specialTransportRequirement: '无', departureTime: '2026-06-26', originCountryCode: '国际(International)', originCountry: '美国', originProvince: '加利福尼亚州', originCity: '洛杉矶', originDistrict: '', originAddress: 'LOS ANGELES, CA 90045',
  destCountryCode: '国内(Domestic)', destCountry: '中国', destProvince: '上海市', destCity: '上海市', destDistrict: '浦东新区', destAddress: '上海浦东国际机场海关监管仓库',
  goodsModel: 'HX-2000', goodsNature: '新货', goodsQuantity: 100, shippingMark: 'N/M',
  compensationCountryCode: '国内(Domestic)', compensationCountry: '中国', compensationProvince: '广东省', compensationCity: '深圳市', compensationDistrict: '南山区', compensationAddress: '深圳市南山区粤海街道科苑路15号',
  remark: '', insuranceFiles: [] as string[], policyFiles: [] as string[], correctionFiles: [] as string[],
};

const fill_2 = {
  transitPort: '', carriageType: '其他', packageType: '天然木托', goodsNameCN: '中央处理器', quantity: 16,
  currencyName: '人民币', invoiceAmount: 37073210, estimatedInsuranceAmount: 37073210, markupRatio: '发票金额原值100%',
  estimatedPremium: 9268.3, actualPremium: 9268.3, insuranceCompany: '中国人保',
  policyNo: 'PYDL202631010000002682', insurancePolicyStatus: '已承保',
  insuranceCorrectionStatus: '', correctionActualPremium: 0, correctionCompanyNo: '',
  applicantCreditCode: '91310115MA1H8D9E0F', applicantContactName: '费斌', applicantContactPhone: '021-50497890', applicantContactAddress: '上海市浦东新区外高桥保税区富特西一路289号',
  customerCreditCode: '91310000MA1G5H6I7J', insuredCreditCode: '91310000MA1G5H6I7J',
  insuredContactName: '李经理', insuredContactPhone: '021-50491234',
  insuredAddressCountryCode: '国内(Domestic)', insuredAddressCountry: '中国', insuredAddressProvince: '上海市', insuredAddressCity: '上海市', insuredAddressDistrict: '浦东新区', insuredAddress: '上海市浦东新区金桥开发区',
  insuranceProductType: '国内运输险', transportMode: '公路运输', invoiceNo: 'INV-2026-0626-CPU', billNo: 'BL20260626999', vesselName: '沪B·87654', transferPlateNo: '', isContainer: '否',
  specialTransportRequirement: '无', departureTime: '2026-06-27', originCountryCode: '国内(Domestic)', originCountry: '中国', originProvince: '辽宁省', originCity: '大连市', originDistrict: '金州区', originAddress: '大连市金州区经济技术开发区',
  destCountryCode: '国内(Domestic)', destCountry: '中国', destProvince: '上海市', destCity: '上海市', destDistrict: '浦东新区', destAddress: '上海市浦东新区外高桥保税区',
  goodsModel: 'i9-14900K', goodsNature: '新货', goodsQuantity: 3200, shippingMark: 'INTEL-SH',
  compensationCountryCode: '国内(Domestic)', compensationCountry: '中国', compensationProvince: '上海市', compensationCity: '上海市', compensationDistrict: '浦东新区', compensationAddress: '上海市浦东新区外高桥保税区富特西一路289号',
  remark: '英特尔CPU批量运输', insuranceFiles: [] as string[], policyFiles: [] as string[], correctionFiles: [] as string[],
};

const fill_3 = {
  transitPort: '上海浦东国际机场（中国）', carriageType: '其他', packageType: '木制或竹藤等植物性材料制盒/箱',
  goodsNameCN: '老化测试板', quantity: 3, currencyName: '美元', invoiceAmount: 1166200,
  estimatedInsuranceAmount: 1282820, markupRatio: '发票金额原值110%', estimatedPremium: 3498.3, actualPremium: 3498.32,
  insuranceCompany: '中国人保', policyNo: 'PYII202631010000002389', insurancePolicyStatus: '已承保',
  insuranceCorrectionStatus: '', correctionActualPremium: 0, correctionCompanyNo: '',
  applicantCreditCode: '91310115MA1H2B3C4D', applicantContactName: '谭泽宇', applicantContactPhone: '021-58345678', applicantContactAddress: '上海市浦东新区张江高科技园区碧波路690号',
  customerCreditCode: '91340100MA5K8L9M0N', insuredCreditCode: '91340100MA5K8L9M0N',
  insuredContactName: '陈伟', insuredContactPhone: '0551-62345678',
  insuredAddressCountryCode: '国内(Domestic)', insuredAddressCountry: '中国', insuredAddressProvince: '安徽省', insuredAddressCity: '合肥市', insuredAddressDistrict: '蜀山区', insuredAddress: '合肥市蜀山区高新技术产业开发区望江西路800号',
  insuranceProductType: '进口运输险', transportMode: '航空运输', invoiceNo: 'INV-2026-0626-002', billNo: '99993756973', vesselName: 'MU5678', transferPlateNo: '', isContainer: '否',
  specialTransportRequirement: '无', departureTime: '2026-06-28', originCountryCode: '国际(International)', originCountry: '美国', originProvince: '德克萨斯州', originCity: '达拉斯', originDistrict: '', originAddress: 'DALLAS, TX 75201',
  destCountryCode: '国内(Domestic)', destCountry: '中国', destProvince: '上海市', destCity: '上海市', destDistrict: '浦东新区', destAddress: '上海浦东国际机场',
  goodsModel: 'ATE-5000', goodsNature: '新货', goodsQuantity: 30, shippingMark: 'JZDA-SH',
  compensationCountryCode: '国内(Domestic)', compensationCountry: '中国', compensationProvince: '安徽省', compensationCity: '合肥市', compensationDistrict: '蜀山区', compensationAddress: '合肥市蜀山区高新技术产业开发区望江西路800号',
  remark: '', insuranceFiles: [] as string[], policyFiles: [] as string[], correctionFiles: [] as string[],
};

export const mockApplications: InsuranceApplication[] = [
  // V2 — 批改申请（最新版本，fill_1 已含全部正确数据）
  { id: 1, businessRefNo: 'PVG-AI26060171', insuranceCategory: '非保入库',
    applicantCompany: '上海泓明国际货运有限公司', customerName: '深圳精智达半导体技术有限公司',
    insuredCompany: '深圳精智达半导体技术有限公司',
    applicationType: '批改申请', approvalStatus: '审批通过', documentStatus: '', approvalRemark: '批改内容已核实，保费调整无误',
    applicationNo: 'TB202606250001', applicationTime: '2026-06-25 09:40:31',
    applicantName: '谭泽宇', cosOrderStatus: '', effectiveStatus: '生效', isBackfill: '已经回填', dataSource: 'fms',
    isLatest: true, version: 2, previousId: 4,
    ...fill_1,
  },
  // V1 — 原始投保申请（历史版本，手动写全数据）
  { id: 4, businessRefNo: 'PVG-AI26060171', insuranceCategory: '非保入库',
    applicantCompany: '上海泓明国际货运有限公司', customerName: '深圳精智达半导体技术有限公司',
    insuredCompany: '深圳精智达半导体技术有限公司',
    applicationType: '新增投保单', approvalStatus: '审批通过', documentStatus: '', approvalRemark: '材料齐全，同意承保',
    applicationNo: 'TB202606200005', applicationTime: '2026-06-20 10:15:00',
    applicantName: '谭泽宇', cosOrderStatus: '', effectiveStatus: '生效', isBackfill: '已经回填', dataSource: 'fms',
    isLatest: false, version: 1, previousId: null,
    transitPort: '上海浦东国际机场（中国）', carriageType: '普通集装箱', packageType: '纸制或纤维板制盒/箱',
    goodsNameCN: '升降搬运装置等', quantity: 2, currencyName: '美元', invoiceAmount: 56000,
    estimatedInsuranceAmount: 61600, markupRatio: '发票金额原值100%', estimatedPremium: 154, actualPremium: 154,
    insuranceCompany: '中国平安', policyNo: 'PYII2026310100000018', insurancePolicyStatus: '待承保',
    insuranceCorrectionStatus: '', correctionActualPremium: 0, correctionCompanyNo: '',
    applicantCreditCode: '91310115MA1H2B3C4D', applicantContactName: '谭泽宇', applicantContactPhone: '021-58345678', applicantContactAddress: '上海市浦东新区张江高科技园区碧波路690号',
    customerCreditCode: '91440300MA5D6E7F8G', insuredCreditCode: '91440300MA5D6E7F8G',
    insuredContactName: '王明辉', insuredContactPhone: '0755-86543210',
    insuredAddressCountryCode: '国内(Domestic)', insuredAddressCountry: '中国', insuredAddressProvince: '广东省', insuredAddressCity: '深圳市', insuredAddressDistrict: '南山区', insuredAddress: '深圳市南山区粤海街道科苑路15号',
    insuranceProductType: '进口运输险', transportMode: '航空运输', invoiceNo: 'INV-2026-0620-001', billNo: '99993756970', vesselName: 'CA1230', transferPlateNo: '', isContainer: '是',
    specialTransportRequirement: '无', departureTime: '2026-06-21', originCountryCode: '国际(International)', originCountry: '美国', originProvince: '加利福尼亚州', originCity: '洛杉矶', originDistrict: '', originAddress: 'LOS ANGELES, CA 90045',
    destCountryCode: '国内(Domestic)', destCountry: '中国', destProvince: '上海市', destCity: '上海市', destDistrict: '浦东新区', destAddress: '上海浦东国际机场海关监管仓库',
    goodsModel: 'HX-2000', goodsNature: '新货', goodsQuantity: 100, shippingMark: 'N/M',
    compensationCountryCode: '国内(Domestic)', compensationCountry: '中国', compensationProvince: '广东省', compensationCity: '深圳市', compensationDistrict: '南山区', compensationAddress: '深圳市南山区粤海街道科苑路15号',
    remark: '', insuranceFiles: [] as string[], policyFiles: [] as string[], correctionFiles: [] as string[],
  },
  // 新增投保单 — 审批通过（fill_2 覆盖全部字段）
  { id: 2, businessRefNo: 'PAC-INTEL26060002Y', insuranceCategory: '非保入库',
    applicantCompany: '上海泓明供应链有限公司', customerName: '英特尔贸易（上海）有限公司',
    insuredCompany: '英特尔贸易（上海）有限公司',
    applicationType: '新增投保单', approvalStatus: '审批通过', documentStatus: '', approvalRemark: '',
    applicationNo: 'TB202606260003', applicationTime: '2026-06-26 11:38:33',
    applicantName: '费斌', cosOrderStatus: '订单完成', effectiveStatus: '生效', isBackfill: '已经回填', dataSource: 'cos',
    isLatest: true, version: 1, previousId: null,
    ...fill_2,
  },
  // 新增投保单 — 审批通过（fill_3 覆盖全部字段）
  { id: 3, businessRefNo: 'PVG-AI26060181', insuranceCategory: '非保入库',
    applicantCompany: '上海泓明国际货运有限公司', customerName: '合肥精智达半导体技术有限公司',
    insuredCompany: '合肥精智达半导体技术有限公司',
    applicationType: '新增投保单', approvalStatus: '审批通过', documentStatus: '', approvalRemark: '',
    applicationNo: 'TB202606260002', applicationTime: '2026-06-26 10:39:58',
    applicantName: '谭泽宇', cosOrderStatus: '', effectiveStatus: '生效', isBackfill: '已经回填', dataSource: 'fms',
    isLatest: true, version: 1, previousId: null,
    ...fill_3,
  },
  // ——— 可编辑状态记录 ———
  // 待发起 — 草稿，可编辑/删除/选择费率/发起审批
  { id: 5, businessRefNo: 'PVG-AI26070001', insuranceCategory: '非保入库',
    applicantCompany: '上海泓明国际货运有限公司', customerName: '北京亦盛精密半导体有限公司',
    insuredCompany: '北京亦盛精密半导体有限公司', transitPort: '', carriageType: '普通集装箱',
    packageType: '天然木托', goodsNameCN: '晶圆检测设备', quantity: 5,
    currencyName: '美元', invoiceAmount: 285000, estimatedInsuranceAmount: 313500, markupRatio: '发票金额原值110%',
    estimatedPremium: 0, actualPremium: 0, insuranceCompany: '', policyNo: '', insurancePolicyStatus: '',
    insuranceCorrectionStatus: '', correctionActualPremium: 0, correctionCompanyNo: '',
    applicationType: '新增投保单', approvalStatus: '待发起', documentStatus: '草稿', approvalRemark: '',
    applicationNo: 'TB202607010001', applicationTime: '2026-07-01 08:30:00',
    applicantName: '谭泽宇', cosOrderStatus: '', effectiveStatus: '', isBackfill: '', dataSource: 'fms',
    isLatest: true, version: 1, previousId: null,
    applicantCreditCode: '91310115MA1H2B3C4D', applicantContactName: '谭泽宇', applicantContactPhone: '021-58345678', applicantContactAddress: '上海市浦东新区张江高科技园区碧波路690号',
    customerCreditCode: '91110108MA7N8O9P0Q', insuredCreditCode: '91110108MA7N8O9P0Q',
    insuredContactName: '张总', insuredContactPhone: '010-87654321',
    insuredAddressCountryCode: '国内(Domestic)', insuredAddressCountry: '中国', insuredAddressProvince: '北京市', insuredAddressCity: '北京市', insuredAddressDistrict: '海淀区', insuredAddress: '北京市海淀区中关村软件园',
    insuranceProductType: '进口运输险', transportMode: '水路运输', invoiceNo: 'INV-2026-0701-005', billNo: 'COS20260701001', vesselName: 'EVER FORTUNE', transferPlateNo: '', isContainer: '是',
    specialTransportRequirement: '无', departureTime: '2026-07-03', originCountryCode: '国际(International)', originCountry: '日本', originProvince: '东京都', originCity: '东京', originDistrict: '港区', originAddress: 'TOKYO, JAPAN',
    destCountryCode: '国内(Domestic)', destCountry: '中国', destProvince: '上海市', destCity: '上海市', destDistrict: '浦东新区', destAddress: '上海洋山深水港',
    goodsModel: 'WAT-3000', goodsNature: '新货', goodsQuantity: 25, shippingMark: 'BJE',
    compensationCountryCode: '国内(Domestic)', compensationCountry: '中国', compensationProvince: '北京市', compensationCity: '北京市', compensationDistrict: '海淀区', compensationAddress: '北京市海淀区中关村软件园',
    remark: '精密检测设备，防震防潮', insuranceFiles: [] as string[], policyFiles: [] as string[], correctionFiles: [] as string[],
  },
  // 审批拒绝 — 可编辑后重新发起审批
  { id: 6, businessRefNo: 'PVG-AI26070002', insuranceCategory: '保税返库',
    applicantCompany: '上海泓明供应链有限公司', customerName: '群福电子科技（上海）有限公司',
    insuredCompany: '群福电子科技（上海）有限公司', transitPort: '深圳宝安国际机场（中国）', carriageType: '其他',
    packageType: '纸制或纤维板制盒/箱', goodsNameCN: 'PCB线路板', quantity: 80,
    currencyName: '美元', invoiceAmount: 128000, estimatedInsuranceAmount: 140800, markupRatio: '发票金额原值110%',
    estimatedPremium: 384, actualPremium: 0, insuranceCompany: '', policyNo: '', insurancePolicyStatus: '',
    insuranceCorrectionStatus: '', correctionActualPremium: 0, correctionCompanyNo: '',
    applicationType: '新增投保单', approvalStatus: '审批拒绝', documentStatus: '', approvalRemark: '发票金额与报关单不一致，请核实后重新提交',
    applicationNo: 'TB202607010002', applicationTime: '2026-07-01 09:15:00',
    applicantName: '费斌', cosOrderStatus: '订单完成', effectiveStatus: '', isBackfill: '', dataSource: 'cos',
    isLatest: true, version: 1, previousId: null,
    applicantCreditCode: '91310115MA1H8D9E0F', applicantContactName: '费斌', applicantContactPhone: '021-50497890', applicantContactAddress: '上海市浦东新区外高桥保税区富特西一路289号',
    customerCreditCode: '91310115MA1K2L3M4N', insuredCreditCode: '91310115MA1K2L3M4N',
    insuredContactName: '刘畅', insuredContactPhone: '021-50495555',
    insuredAddressCountryCode: '国内(Domestic)', insuredAddressCountry: '中国', insuredAddressProvince: '上海市', insuredAddressCity: '上海市', insuredAddressDistrict: '松江区', insuredAddress: '上海市松江区车墩镇',
    insuranceProductType: '国内运输险', transportMode: '航空运输', invoiceNo: 'INV-2026-0701-006', billNo: '99993756980', vesselName: 'FM9101', transferPlateNo: '', isContainer: '否',
    specialTransportRequirement: '无', departureTime: '2026-07-04', originCountryCode: '国内(Domestic)', originCountry: '中国', originProvince: '广东省', originCity: '深圳市', originDistrict: '宝安区', originAddress: '深圳市宝安区福永街道',
    destCountryCode: '国内(Domestic)', destCountry: '中国', destProvince: '上海市', destCity: '上海市', destDistrict: '松江区', destAddress: '上海市松江区车墩镇',
    goodsModel: 'PCB-8Layer', goodsNature: '新货', goodsQuantity: 8000, shippingMark: 'QF-SH',
    compensationCountryCode: '国内(Domestic)', compensationCountry: '中国', compensationProvince: '上海市', compensationCity: '上海市', compensationDistrict: '松江区', compensationAddress: '上海市松江区车墩镇',
    remark: '审批被驳回，需修改发票金额', insuranceFiles: [] as string[], policyFiles: [] as string[], correctionFiles: [] as string[],
  },
  // 待审核 — 正在审批中，可撤销审核
  { id: 7, businessRefNo: 'PVG-AI26070003', insuranceCategory: '进境申报入库',
    applicantCompany: '上海泓明国际货运有限公司', customerName: '大昌洋行（上海）有限公司',
    insuredCompany: '大昌洋行（上海）有限公司', transitPort: '广州白云国际机场（中国）', carriageType: '其他',
    packageType: '普通集装箱', goodsNameCN: '精密仪器零部件', quantity: 12,
    currencyName: '欧元', invoiceAmount: 75000, estimatedInsuranceAmount: 82500, markupRatio: '发票金额原值110%',
    estimatedPremium: 0, actualPremium: 0, insuranceCompany: '', policyNo: '', insurancePolicyStatus: '',
    insuranceCorrectionStatus: '', correctionActualPremium: 0, correctionCompanyNo: '',
    applicationType: '新增投保单', approvalStatus: '待审核', documentStatus: '', approvalRemark: '',
    applicationNo: 'TB202607010003', applicationTime: '2026-07-01 10:00:00',
    applicantName: '谭泽宇', cosOrderStatus: '', effectiveStatus: '', isBackfill: '', dataSource: 'fms',
    isLatest: true, version: 1, previousId: null,
    applicantCreditCode: '91310115MA1H2B3C4D', applicantContactName: '谭泽宇', applicantContactPhone: '021-58345678', applicantContactAddress: '上海市浦东新区张江高科技园区碧波路690号',
    customerCreditCode: '91310000MA1P5Q6R7S', insuredCreditCode: '91310000MA1P5Q6R7S',
    insuredContactName: '唐明元', insuredContactPhone: '021-33669900',
    insuredAddressCountryCode: '国内(Domestic)', insuredAddressCountry: '中国', insuredAddressProvince: '上海市', insuredAddressCity: '上海市', insuredAddressDistrict: '黄浦区', insuredAddress: '上海市黄浦区淮海中路300号',
    insuranceProductType: '进口运输险', transportMode: '航空运输', invoiceNo: 'INV-2026-0701-007', billNo: '99993756985', vesselName: 'LH7890', transferPlateNo: '', isContainer: '否',
    specialTransportRequirement: '无', departureTime: '2026-07-05', originCountryCode: '国际(International)', originCountry: '德国', originProvince: '黑森州', originCity: '法兰克福', originDistrict: '', originAddress: 'FRANKFURT, GERMANY',
    destCountryCode: '国内(Domestic)', destCountry: '中国', destProvince: '广东省', destCity: '广州市', destDistrict: '白云区', destAddress: '广州白云国际机场',
    goodsModel: 'PRT-9000', goodsNature: '新货', goodsQuantity: 200, shippingMark: 'DC-GZ',
    compensationCountryCode: '国内(Domestic)', compensationCountry: '中国', compensationProvince: '上海市', compensationCity: '上海市', compensationDistrict: '黄浦区', compensationAddress: '上海市黄浦区淮海中路300号',
    remark: '', insuranceFiles: [] as string[], policyFiles: [] as string[], correctionFiles: [] as string[],
  },
];

export const mockClaims: ClaimReport[] = [
  { id: 1, reportNo: 'BA202605270001', reportStatus: '审批拒绝', reportTime: '2026-05-27 13:52:50', applicantName: '曾婷婷', policyNo: 'PYII202631010000001565', insuranceCompany: '人保财险', insuredCompany: '辰源微（苏州）半导体科技有限公司', claimResult: '-' },
  { id: 2, reportNo: 'BA202606050001', reportStatus: '审批通过', reportTime: '2026-06-05 13:58:52', applicantName: '曾婷婷', policyNo: 'PYII202631010000002054', insuranceCompany: '人保财险', insuredCompany: '大昌洋行（上海）有限公司', claimResult: '1' },
  { id: 3, reportNo: 'BA202606170001', reportStatus: '审批通过', reportTime: '2026-06-17 14:43:09', applicantName: '唐明元', policyNo: 'PYII202631010000002242', insuranceCompany: '人保财险', insuredCompany: '萍乡德博科技股份有限公司', claimResult: '-' },
  { id: 4, reportNo: 'BA202606250001', reportStatus: '已确认', reportTime: '2026-06-25 16:47:20', applicantName: '刘畅', policyNo: 'PYII202631010000002321', insuranceCompany: '中国人保', insuredCompany: '群福电子科技（上海）有限公司', claimResult: '拒赔' },
];

// 下拉选项数据
export const insuranceCompanies = ['中国人保', '中国平安', '人保财险', '太平洋保险'];
export const approvalStatuses = ['审批通过', '审批拒绝', '审批中', '已确认'];
export const insurancePolicyStatuses = ['已承保', '已批改', '待承保'];
export const claimStatuses = ['审批通过', '审批拒绝', '已确认', '待审批'];
export const currencies = ['人民币', '美元', '欧元', '英镑', '日元', '港元', '台币', '韩元', '新加坡元', '加拿大元', '澳大利亚元', '瑞士法郎', '澳门元', '马来西亚林吉特'];
export const countries = ['中国', '美国', '日本', '韩国', '德国', '英国', '新加坡', '马来西亚', '澳大利亚', '加拿大'];
export const packageTypes = ['木制或竹藤等植物性材料制盒/箱', '纸制或纤维板制盒/箱', '天然木托', '球状罐类', '普通集装箱', '其他'];
export const oldNewTypes = ['新货', '旧货'];

// ========== 历史版本 / 审批历史 / 修改日志 ==========

/** 历史版本快照（审批通过时自动保存） */
export interface HistoryVersion {
  version: number;
  timestamp: string;
  label: string;
  data: Partial<InsuranceApplication>;
}

/** 审批历史记录 */
export interface ApprovalHistoryEntry {
  id: number;
  timestamp: string;
  approver: string;
  action: string;
  comment: string;
}

/** 修改日志 */
export interface ChangeLogEntry {
  id: number;
  timestamp: string;
  user: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

/** 按投保单 ID 存储的历史版本（模拟审批通过后快照） */
export const mockHistoryVersions: Record<number, HistoryVersion[]> = {
  1: [
    {
      version: 2,
      timestamp: '2026-06-25 14:30:00',
      label: '审批通过 — 批改后',
      data: {
        businessRefNo: 'PVG-AI26060171',
        insuranceCategory: '非保入库',
        applicantCompany: '上海泓明国际货运有限公司',
        customerName: '深圳精智达半导体技术有限公司',
        insuredCompany: '深圳精智达半导体技术有限公司',
        transitPort: '广州白云国际机场（中国）',
        carriageType: '其他',
        packageType: '木制或竹藤等植物性材料制盒/箱',
        goodsNameCN: '升降搬运装置等(详见COMMERCIALINVOICE)',
        quantity: 1,
        currencyName: '美元',
        invoiceAmount: 56035,
        estimatedInsuranceAmount: 61638.5,
        markupRatio: '发票金额原值110%',
        estimatedPremium: 168.09,
        actualPremium: 168.12,
        insuranceCompany: '中国人保',
        policyNo: 'PYII2026310100000023',
        insurancePolicyStatus: '已承保',
        insuranceCorrectionStatus: '已批改',
        correctionActualPremium: 168.12,
      },
    },
    {
      version: 1,
      timestamp: '2026-06-20 10:15:00',
      label: '审批通过 — 初次投保',
      data: {
        businessRefNo: 'PVG-AI26060171',
        insuranceCategory: '非保入库',
        applicantCompany: '上海泓明国际货运有限公司',
        customerName: '深圳精智达半导体技术有限公司',
        insuredCompany: '深圳精智达半导体技术有限公司',
        transitPort: '上海浦东国际机场（中国）',
        carriageType: '普通集装箱',
        packageType: '纸制或纤维板制盒/箱',
        goodsNameCN: '升降搬运装置等',
        quantity: 2,
        currencyName: '美元',
        invoiceAmount: 56000,
        estimatedInsuranceAmount: 61600,
        markupRatio: '发票金额原值100%',
        estimatedPremium: 154,
        actualPremium: 154,
        insuranceCompany: '中国平安',
        policyNo: 'PYII2026310100000018',
        insurancePolicyStatus: '待承保',
        insuranceCorrectionStatus: '',
        correctionActualPremium: 0,
      },
    },
  ],
};

/** 按投保单 ID 存储的审批历史 */
export const mockApprovalHistory: Record<number, ApprovalHistoryEntry[]> = {
  1: [
    { id: 1, timestamp: '2026-06-25 14:28:00', approver: '张经理', action: '审批通过', comment: '批改内容已核实，保费调整无误，同意。' },
    { id: 2, timestamp: '2026-06-24 09:30:00', approver: '李主管', action: '转审', comment: '批改涉及保费变更，转张经理终审。' },
    { id: 3, timestamp: '2026-06-20 10:12:00', approver: '王主管', action: '审批通过', comment: '材料齐全，费率适用正确，同意承保。' },
    { id: 4, timestamp: '2026-06-19 16:45:00', approver: '赵专员', action: '提交审批', comment: '投保资料已核实，发起审批流程。' },
  ],
};

/** 按投保单 ID 存储的修改日志 */
export const mockChangeLogs: Record<number, ChangeLogEntry[]> = {
  1: [
    { id: 1, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '保险公司名称', oldValue: '中国平安', newValue: '中国人保' },
    { id: 2, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '保单单号', oldValue: 'PYII2026310100000018', newValue: 'PYII2026310100000023' },
    { id: 3, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '实际保费', oldValue: '154', newValue: '168.12' },
    { id: 4, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '保险公司保单状态', oldValue: '待承保', newValue: '已承保' },
    { id: 5, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '发票金额', oldValue: '56000', newValue: '56035' },
    { id: 6, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '预计保险金额', oldValue: '61600', newValue: '61638.5' },
    { id: 7, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '加成比例', oldValue: '发票金额原值100%', newValue: '发票金额原值110%' },
    { id: 8, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '途径港', oldValue: '上海浦东国际机场（中国）', newValue: '广州白云国际机场（中国）' },
    { id: 9, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '车厢类型', oldValue: '普通集装箱', newValue: '其他' },
    { id: 10, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '包装种类', oldValue: '纸制或纤维板制盒/箱', newValue: '木制或竹藤等植物性材料制盒/箱' },
    { id: 11, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '预计保费(人民币)', oldValue: '154', newValue: '168.09' },
    { id: 12, timestamp: '2026-06-25 14:25:00', user: '谭泽宇', fieldLabel: '件数', oldValue: '2', newValue: '1' },
  ],
};
