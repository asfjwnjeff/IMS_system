/**
 * 数据库种子数据 — 启动时自动建表 + 插入示例数据
 */
import { getDb, getRawDb, saveDb } from './index';

export async function autoMigrate() {
  await getDb();
  const rawDb = getRawDb();

  // 建表 DDL
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS insurance_applications (
      id TEXT PRIMARY KEY, business_ref_no TEXT NOT NULL, insurance_category TEXT,
      applicant_company TEXT, customer_name TEXT, insured_company TEXT,
      approval_status TEXT DEFAULT '审批中', application_type TEXT,
      version INTEGER DEFAULT 1, is_latest INTEGER DEFAULT 1, previous_id TEXT,
      document_status TEXT, approval_remark TEXT, application_no TEXT,
      application_time TEXT, applicant_name TEXT, cos_order_status TEXT,
      effective_status TEXT, is_backfill TEXT, data_source TEXT,
      applicant_info TEXT, transport_info TEXT, cargo_info TEXT,
      insurance_info TEXT, backfill_info TEXT, correction_info TEXT,
      created_at TEXT, updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS claim_reports (
      id TEXT PRIMARY KEY, report_no TEXT NOT NULL, report_status TEXT DEFAULT '待审批',
      report_time TEXT, applicant_name TEXT, policy_no TEXT,
      insurance_company TEXT, insured_company TEXT, claim_result TEXT,
      claim_detail TEXT, created_at TEXT, updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS exchange_rates (
      id TEXT PRIMARY KEY, insurance_company TEXT NOT NULL, exchange_rate REAL NOT NULL,
      effective_date TEXT, expiry_date TEXT, currency TEXT, creator TEXT, create_time TEXT
    );

    CREATE TABLE IF NOT EXISTS insurance_rates (
      id TEXT PRIMARY KEY, insurance_company TEXT NOT NULL, rate REAL NOT NULL,
      effective_date TEXT, expiry_date TEXT, cargo_type TEXT, status TEXT DEFAULT '启用',
      cargo_value_rmb REAL, agreement_no TEXT, min_charge REAL, package_type TEXT,
      old_new_type TEXT, remark TEXT, creator TEXT, create_time TEXT
    );

    CREATE TABLE IF NOT EXISTS history_versions (
      id TEXT PRIMARY KEY, application_id TEXT NOT NULL, version INTEGER NOT NULL,
      timestamp TEXT NOT NULL, label TEXT NOT NULL, data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approval_history (
      id TEXT PRIMARY KEY, application_id TEXT NOT NULL, timestamp TEXT NOT NULL,
      approver TEXT NOT NULL, action TEXT NOT NULL, comment TEXT
    );

    CREATE TABLE IF NOT EXISTS change_logs (
      id TEXT PRIMARY KEY, application_id TEXT NOT NULL, timestamp TEXT NOT NULL,
      user TEXT NOT NULL, field_label TEXT NOT NULL, old_value TEXT, new_value TEXT
    );

    CREATE TABLE IF NOT EXISTS column_configs (
      id TEXT PRIMARY KEY, config_key TEXT NOT NULL,
      config_data TEXT NOT NULL, updated_at TEXT
    );
  `);

  const db = await getDb();

  // 种子数据 — 全部用 sql.js 原生 run() 保证兼容性
  seedExchangeRates(rawDb);
  seedInsuranceRates(rawDb);
  seedApplications(rawDb);
  seedClaims(rawDb);

  saveDb();
  console.log('[IMS DB] Schema migrated & seed data loaded');
}

function q(v: unknown): string { return `'${String(v).replace(/'/g, "''")}'`; }

function seedExchangeRates(db: { run: (s: string) => void }) {
  const rows = [
    ['exr-1','中国人保',7.2436,'2026-06-01','2026-12-31','美元','管理员','2026-06-01 09:00:00'],
    ['exr-2','中国人保',0.0521,'2026-06-01','2026-12-31','日元','管理员','2026-06-01 09:00:00'],
    ['exr-3','中国人保',0.9293,'2026-06-01','2026-12-31','欧元','管理员','2026-06-01 09:00:00'],
    ['exr-4','中国平安',7.2512,'2026-06-15','2026-12-31','美元','管理员','2026-06-15 10:00:00'],
    ['exr-5','中国平安',0.0515,'2026-06-15','2026-12-31','日元','管理员','2026-06-15 10:00:00'],
  ];
  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO exchange_rates VALUES (${r.map(q).join(',')})`);
  }
}

function seedInsuranceRates(db: { run: (s: string) => void }) {
  const rows = [
    ['insr-1','中国人保',0.0026,'2026-06-01','2026-12-31','电子产品','启用',1000000,'AGR-2026-001',50,'纸制或纤维板制盒/箱','新货','','管理员','2026-06-01 09:00:00'],
    ['insr-2','中国人保',0.0035,'2026-06-01','2026-12-31','机械设备','启用',500000,'AGR-2026-002',100,'天然木托','新货','','管理员','2026-06-01 09:00:00'],
    ['insr-3','中国平安',0.0024,'2026-07-01','2026-12-31','电子产品','启用',800000,'AGR-2026-003',40,'普通集装箱','新货','','管理员','2026-06-15 10:00:00'],
    ['insr-4','人保财险',0.0018,'2026-06-01','2026-12-31','电子元器件','禁用',200000,'AGR-2026-004',30,'纸制或纤维板制盒/箱','旧货','','管理员','2026-06-01 09:00:00'],
  ];
  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO insurance_rates VALUES (${r.map(q).join(',')})`);
  }
}

function seedApplications(db: { run: (s: string) => void }) {
  const ai = (o: object) => q(JSON.stringify(o));

  const rows = [
    ['app-1','PVG-AI26060171','非保入库','上海泓明国际货运有限公司','深圳精智达半导体技术有限公司','深圳精智达半导体技术有限公司','审批通过','批改申请',2,1,'app-4','','批改内容已核实，保费调整无误','TB202606250001','2026-06-25 09:40:31','谭泽宇','','生效','已经回填','fms',
      ai({applicantCreditCode:'91310115MA1H2B3C4D',applicantContactName:'谭泽宇',applicantContactPhone:'021-58345678',applicantContactAddress:'上海市浦东新区张江高科技园区碧波路690号',customerCreditCode:'91440300MA5D6E7F8G',insuredCreditCode:'91440300MA5D6E7F8G',insuredContactName:'王明辉',insuredContactPhone:'0755-86543210',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'广东省',insuredAddressCity:'深圳市',insuredAddressDistrict:'南山区',insuredAddress:'深圳市南山区粤海街道科苑路15号',applicantCompany:'上海泓明国际货运有限公司',customerName:'深圳精智达半导体技术有限公司',insuredCompany:'深圳精智达半导体技术有限公司'}),
      ai({transitPort:'广州白云国际机场（中国）',carriageType:'其他',insuranceProductType:'进口运输险',transportMode:'航空运输',invoiceNo:'INV-2026-0625-001',billNo:'99993756972',vesselName:'CA1234',transferPlateNo:'',isContainer:'否',specialTransportRequirement:'无',departureTime:'2026-06-26',originCountryCode:'国际(International)',originCountry:'美国',originProvince:'加利福尼亚州',originCity:'洛杉矶',originDistrict:'',originAddress:'LOS ANGELES, CA 90045',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场海关监管仓库'}),
      ai({packageType:'木制或竹藤等植物性材料制盒/箱',goodsNameCN:'升降搬运装置等(详见COMMERCIALINVOICE)',goodsModel:'HX-2000',goodsNature:'新货',goodsQuantity:100,quantity:1,shippingMark:'N/M'}),
      ai({invoiceAmount:56035,currencyName:'美元',markupRatio:'发票金额原值110%',estimatedInsuranceAmount:61638.5,estimatedPremium:168.09,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'广东省',compensationCity:'深圳市',compensationDistrict:'南山区',compensationAddress:'深圳市南山区粤海街道科苑路15号',remark:'',insuranceFiles:[]}),
      ai({insuranceCompany:'中国人保',policyNo:'PYII2026310100000023',insurancePolicyStatus:'已承保',actualPremium:168.12,policyFiles:[]}),
      ai({insuranceCorrectionStatus:'已批改',correctionCompanyNo:'EYII202631010000000599',correctionActualPremium:168.12,correctionFiles:[]}),
      '2026-06-20T10:15:00.000Z','2026-06-25T09:40:31.000Z'],
    ['app-4','PVG-AI26060171','非保入库','上海泓明国际货运有限公司','深圳精智达半导体技术有限公司','深圳精智达半导体技术有限公司','审批通过','新增投保单',1,0,'','','材料齐全，同意承保','TB202606200005','2026-06-20 10:15:00','谭泽宇','','生效','已经回填','fms',
      ai({applicantCreditCode:'91310115MA1H2B3C4D',applicantContactName:'谭泽宇',applicantContactPhone:'021-58345678',applicantContactAddress:'上海市浦东新区张江高科技园区碧波路690号',customerCreditCode:'91440300MA5D6E7F8G',insuredCreditCode:'91440300MA5D6E7F8G',insuredContactName:'王明辉',insuredContactPhone:'0755-86543210',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'广东省',insuredAddressCity:'深圳市',insuredAddressDistrict:'南山区',insuredAddress:'深圳市南山区粤海街道科苑路15号',applicantCompany:'上海泓明国际货运有限公司',customerName:'深圳精智达半导体技术有限公司',insuredCompany:'深圳精智达半导体技术有限公司'}),
      ai({transitPort:'上海浦东国际机场（中国）',carriageType:'普通集装箱',insuranceProductType:'进口运输险',transportMode:'航空运输',invoiceNo:'INV-2026-0620-001',billNo:'99993756970',vesselName:'CA1230',transferPlateNo:'',isContainer:'是',specialTransportRequirement:'无',departureTime:'2026-06-21',originCountryCode:'国际(International)',originCountry:'美国',originProvince:'加利福尼亚州',originCity:'洛杉矶',originDistrict:'',originAddress:'LOS ANGELES, CA 90045',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场海关监管仓库'}),
      ai({packageType:'纸制或纤维板制盒/箱',goodsNameCN:'升降搬运装置等',goodsModel:'HX-2000',goodsNature:'新货',goodsQuantity:100,quantity:2,shippingMark:'N/M'}),
      ai({invoiceAmount:56000,currencyName:'美元',markupRatio:'发票金额原值100%',estimatedInsuranceAmount:61600,estimatedPremium:154,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'广东省',compensationCity:'深圳市',compensationDistrict:'南山区',compensationAddress:'深圳市南山区粤海街道科苑路15号',remark:'',insuranceFiles:[]}),
      ai({insuranceCompany:'中国平安',policyNo:'PYII2026310100000018',insurancePolicyStatus:'待承保',actualPremium:154,policyFiles:[]}),
      ai({insuranceCorrectionStatus:'',correctionCompanyNo:'',correctionActualPremium:0,correctionFiles:[]}),
      '2026-06-20T10:15:00.000Z','2026-06-20T10:15:00.000Z'],
    ['app-2','PAC-INTEL26060002Y','非保入库','上海泓明供应链有限公司','英特尔贸易（上海）有限公司','英特尔贸易（上海）有限公司','审批通过','新增投保单',1,1,'','','','TB202606260003','2026-06-26 11:38:33','费斌','订单完成','生效','已经回填','cos',
      ai({applicantCreditCode:'91310115MA1H8D9E0F',applicantContactName:'费斌',applicantContactPhone:'021-50497890',applicantContactAddress:'上海市浦东新区外高桥保税区富特西一路289号',customerCreditCode:'91310000MA1G5H6I7J',insuredCreditCode:'91310000MA1G5H6I7J',insuredContactName:'李经理',insuredContactPhone:'021-50491234',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'上海市',insuredAddressCity:'上海市',insuredAddressDistrict:'浦东新区',insuredAddress:'上海市浦东新区金桥开发区',applicantCompany:'上海泓明供应链有限公司',customerName:'英特尔贸易（上海）有限公司',insuredCompany:'英特尔贸易（上海）有限公司'}),
      ai({transitPort:'',carriageType:'其他',insuranceProductType:'国内运输险',transportMode:'公路运输',invoiceNo:'INV-2026-0626-CPU',billNo:'BL20260626999',vesselName:'沪B·87654',transferPlateNo:'',isContainer:'否',specialTransportRequirement:'无',departureTime:'2026-06-27',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'辽宁省',originCity:'大连市',originDistrict:'金州区',originAddress:'大连市金州区经济技术开发区',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海市浦东新区外高桥保税区'}),
      ai({packageType:'天然木托',goodsNameCN:'中央处理器',goodsModel:'i9-14900K',goodsNature:'新货',goodsQuantity:3200,quantity:16,shippingMark:'INTEL-SH'}),
      ai({invoiceAmount:37073210,currencyName:'人民币',markupRatio:'发票金额原值100%',estimatedInsuranceAmount:37073210,estimatedPremium:9268.3,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'上海市',compensationCity:'上海市',compensationDistrict:'浦东新区',compensationAddress:'上海市浦东新区外高桥保税区富特西一路289号',remark:'英特尔CPU批量运输',insuranceFiles:[]}),
      ai({insuranceCompany:'中国人保',policyNo:'PYDL202631010000002682',insurancePolicyStatus:'已承保',actualPremium:9268.3,policyFiles:[]}),
      ai({insuranceCorrectionStatus:'',correctionCompanyNo:'',correctionActualPremium:0,correctionFiles:[]}),
      '2026-06-26T11:38:33.000Z','2026-06-26T11:38:33.000Z'],
    // 待发起 — 可编辑、可删除
    ['app-3','PVG-AI26070001','非保入库','上海泓明国际货运有限公司','北京亦盛精密半导体有限公司','北京亦盛精密半导体有限公司','待发起','新增投保单',1,1,'','','','TB202607010001','2026-07-01 14:30:00','谭泽宇','','未生效','未回填','fms',
      ai({applicantCreditCode:'91110108MA7D1E2F3G',applicantContactName:'张伟',applicantContactPhone:'010-62345678',applicantContactAddress:'北京市海淀区中关村南大街5号',customerCreditCode:'91110108MA7D1E2F3G',insuredCreditCode:'91110108MA7D1E2F3G',insuredContactName:'李强',insuredContactPhone:'010-82345678',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'北京市',insuredAddressCity:'北京市',insuredAddressDistrict:'海淀区',insuredAddress:'北京市海淀区学院路30号',applicantCompany:'上海泓明国际货运有限公司',customerName:'北京亦盛精密半导体有限公司',insuredCompany:'北京亦盛精密半导体有限公司'}),
      ai({transitPort:'',carriageType:'普通集装箱',insuranceProductType:'国内运输险',transportMode:'公路运输',invoiceNo:'INV-2026-0701-001',billNo:'BL20260701001',vesselName:'京A·12345',transferPlateNo:'',isContainer:'否',specialTransportRequirement:'无',departureTime:'2026-07-02',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'上海市',originCity:'上海市',originDistrict:'浦东新区',originAddress:'上海市浦东新区外高桥保税区',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'北京市',destCity:'北京市',destDistrict:'海淀区',destAddress:'北京市海淀区中关村'}),
      ai({packageType:'纸制或纤维板制盒/箱',goodsNameCN:'晶圆测试设备',goodsModel:'WT-3000',goodsNature:'新货',goodsQuantity:50,quantity:5,shippingMark:'BJYS-001'}),
      ai({invoiceAmount:850000,currencyName:'人民币',markupRatio:'发票金额原值110%',estimatedInsuranceAmount:935000,estimatedPremium:2340,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'北京市',compensationCity:'北京市',compensationDistrict:'海淀区',compensationAddress:'北京市海淀区学院路30号',remark:'精密设备运输，需防震',insuranceFiles:[]}),
      ai({insuranceCompany:'',policyNo:'',insurancePolicyStatus:'',actualPremium:0,policyFiles:[]}),
      ai({insuranceCorrectionStatus:'',correctionCompanyNo:'',correctionActualPremium:0,correctionFiles:[]}),
      '2026-07-01T14:30:00.000Z','2026-07-01T14:30:00.000Z'],
    // 审批拒绝 — 可重新编辑
    ['app-5','PVG-AI26070002','保税返库','上海泓明供应链有限公司','合肥精智达半导体技术有限公司','合肥精智达半导体技术有限公司','审批拒绝','新增投保单',1,1,'','','材料不全，缺少运输许可证明','TB202607010002','2026-07-01 10:00:00','费斌','订单处理中','未生效','未回填','cos',
      ai({applicantCreditCode:'91310115MA1H8D9E0F',applicantContactName:'费斌',applicantContactPhone:'021-50497890',applicantContactAddress:'上海市浦东新区外高桥保税区富特西一路289号',customerCreditCode:'91340100MA5K8L9M0N',insuredCreditCode:'91340100MA5K8L9M0N',insuredContactName:'陈伟',insuredContactPhone:'0551-62345678',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'安徽省',insuredAddressCity:'合肥市',insuredAddressDistrict:'蜀山区',insuredAddress:'合肥市蜀山区高新区望江西路800号',applicantCompany:'上海泓明供应链有限公司',customerName:'合肥精智达半导体技术有限公司',insuredCompany:'合肥精智达半导体技术有限公司'}),
      ai({transitPort:'上海浦东国际机场（中国）',carriageType:'其他',insuranceProductType:'进口运输险',transportMode:'航空运输',invoiceNo:'INV-2026-0701-002',billNo:'99993756980',vesselName:'MU5888',transferPlateNo:'',isContainer:'是',specialTransportRequirement:'无',departureTime:'2026-07-05',originCountryCode:'国际(International)',originCountry:'日本',originProvince:'东京都',originCity:'东京',originDistrict:'',originAddress:'TOKYO, JAPAN',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场'}),
      ai({packageType:'天然木托',goodsNameCN:'半导体测试探针卡',goodsModel:'PC-8000',goodsNature:'新货',goodsQuantity:200,quantity:2,shippingMark:'HFJZDA-JP'}),
      ai({invoiceAmount:4200000,currencyName:'日元',markupRatio:'发票金额原值110%',estimatedInsuranceAmount:4620000,estimatedPremium:138.6,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'安徽省',compensationCity:'合肥市',compensationDistrict:'蜀山区',compensationAddress:'合肥市蜀山区高新区望江西路800号',remark:'',insuranceFiles:[]}),
      ai({insuranceCompany:'',policyNo:'',insurancePolicyStatus:'',actualPremium:0,policyFiles:[]}),
      ai({insuranceCorrectionStatus:'',correctionCompanyNo:'',correctionActualPremium:0,correctionFiles:[]}),
      '2026-07-01T10:00:00.000Z','2026-07-01T10:00:00.000Z'],
    // 审批中 — 可撤销审核
    ['app-6','PVG-AI26070003','进境申报入库','上海泓明国际货运有限公司','长江存储科技有限责任公司','长江存储科技有限责任公司','审批中','新增投保单',1,1,'','','','TB202607010003','2026-07-01 16:00:00','谭泽宇','','','','fms',
      ai({applicantCreditCode:'91310115MA1H2B3C4D',applicantContactName:'谭泽宇',applicantContactPhone:'021-58345678',applicantContactAddress:'上海市浦东新区张江高科技园区碧波路690号',customerCreditCode:'91420100MA4K4T5U6V',insuredCreditCode:'91420100MA4K4T5U6V',insuredContactName:'赵刚',insuredContactPhone:'027-87654321',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'湖北省',insuredAddressCity:'武汉市',insuredAddressDistrict:'洪山区',insuredAddress:'武汉市洪山区光谷大道77号',applicantCompany:'上海泓明国际货运有限公司',customerName:'长江存储科技有限责任公司',insuredCompany:'长江存储科技有限责任公司'}),
      ai({transitPort:'',carriageType:'普通集装箱',insuranceProductType:'国内运输险',transportMode:'铁路运输',invoiceNo:'INV-2026-0701-003',billNo:'BL20260701003',vesselName:'',transferPlateNo:'',isContainer:'是',specialTransportRequirement:'温控运输(15-25°C)',departureTime:'2026-07-03',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'上海市',originCity:'上海市',originDistrict:'浦东新区',originAddress:'上海市浦东新区张江高科技园区',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'湖北省',destCity:'武汉市',destDistrict:'洪山区',destAddress:'武汉市洪山区光谷大道77号'}),
      ai({packageType:'普通集装箱',goodsNameCN:'NAND闪存芯片',goodsModel:'YMTC-232L',goodsNature:'新货',goodsQuantity:10000,quantity:20,shippingMark:'YMTC-WH'}),
      ai({invoiceAmount:5600000,currencyName:'人民币',markupRatio:'发票金额原值110%',estimatedInsuranceAmount:6160000,estimatedPremium:15400,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'湖北省',compensationCity:'武汉市',compensationDistrict:'洪山区',compensationAddress:'武汉市洪山区光谷大道77号',remark:'高价值芯片，全程温控',insuranceFiles:[]}),
      ai({insuranceCompany:'',policyNo:'',insurancePolicyStatus:'',actualPremium:0,policyFiles:[]}),
      ai({insuranceCorrectionStatus:'',correctionCompanyNo:'',correctionActualPremium:0,correctionFiles:[]}),
      '2026-07-01T16:00:00.000Z','2026-07-01T16:00:00.000Z'],
  ];

  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO insurance_applications VALUES (${r.map((v) => v === null ? 'NULL' : typeof v === 'number' ? String(v) : typeof v === 'string' && v.startsWith("'") ? v : q(v)).join(',')})`);
  }
}

function seedClaims(db: { run: (s: string) => void }) {
  const ai = (o: object) => q(JSON.stringify(o));

  const rows = [
    ['clm-1','RPT20260625001','审批通过','2026-06-25 14:30:00','谭泽宇','PYII2026310100000023','中国人保','深圳精智达半导体技术有限公司','理赔完成',ai({businessRefNo:'PVG-AI26060171',applicantDept:'物流部',billNo:'99993756972',originCountryCode:'国际(International)',originCountry:'美国',originProvince:'加利福尼亚州',originCity:'洛杉矶',originDistrict:'',originAddress:'LOS ANGELES, CA 90045',consigneeName:'深圳精智达半导体技术有限公司',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场海关监管仓库',goodsName:'升降搬运装置',cargoQuantity:3,packageType2:'木制或竹藤等植物性材料制盒/箱',estimatedLossAmount:5000,lossCurrency:'美元',accidentTime:'2026-06-26 18:00:00',accidentCountryCode:'国内(Domestic)',accidentCountry:'中国',accidentProvince:'上海市',accidentCity:'上海市',accidentDistrict:'浦东新区',accidentAddress:'上海浦东国际机场',accidentDescription:'货物在卸机过程中外包装受损，部分货物表面划伤',accidentFiles:[],claimResultDetail:'经勘查确认属于保险责任范围，赔付5000美元',claimAmount:5000,claimFiles:[]}),'2026-06-25T14:30:00.000Z','2026-06-26T16:00:00.000Z'],
    ['clm-2','RPT20260628001','待审批','2026-06-28 09:15:00','费斌','PYDL202631010000002682','中国人保','英特尔贸易（上海）有限公司','',ai({businessRefNo:'PAC-INTEL26060002Y',applicantDept:'供应链部',billNo:'BL20260626999',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'辽宁省',originCity:'大连市',originDistrict:'金州区',originAddress:'大连市金州区经济技术开发区',consigneeName:'英特尔贸易（上海）有限公司',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海市浦东新区外高桥保税区',goodsName:'中央处理器',cargoQuantity:50,packageType2:'天然木托',estimatedLossAmount:150000,lossCurrency:'人民币',accidentTime:'2026-06-27 22:30:00',accidentCountryCode:'国内(Domestic)',accidentCountry:'中国',accidentProvince:'江苏省',accidentCity:'苏州市',accidentDistrict:'昆山市',accidentAddress:'G2京沪高速昆山段',accidentDescription:'运输途中遭遇暴雨，部分货物受潮',accidentFiles:[],claimResultDetail:'',claimAmount:0,claimFiles:[]}),'2026-06-28T09:15:00.000Z','2026-06-28T09:15:00.000Z'],
  ];

  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO claim_reports VALUES (${r.map((v) => v === null ? 'NULL' : typeof v === 'number' ? String(v) : typeof v === 'string' && v.startsWith("'") ? v : q(v)).join(',')})`);
  }
}
