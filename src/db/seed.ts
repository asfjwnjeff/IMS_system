/**
 * 数据库种子数据 — 启动时自动建表 + 插入示例数据
 */
import { getDb, getRawDb, saveDb } from './index';
import { historyVersions, approvalHistory, changeLogs } from './schema';

export async function autoMigrate() {
  await getDb();
  const rawDb = getRawDb();

  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS insurance_applications (
      id TEXT PRIMARY KEY, jobidref TEXT NOT NULL, insurance_category TEXT,
      insurance_category_desc TEXT,
      policy_holder_name_desc TEXT, insured_company_desc TEXT, insured_company_name TEXT,
      workflow_status TEXT DEFAULT 'Draft', workflow_status_desc TEXT DEFAULT '草稿',
      submit_type_desc TEXT,
      version INTEGER DEFAULT 1, is_latest INTEGER DEFAULT 1, previous_id TEXT,
      document_status_desc TEXT, audit_reason TEXT, policy_no TEXT,
      application_time TEXT, applicant_name TEXT, cos_order_status TEXT,
      effective_status_desc TEXT, is_backfill TEXT, data_sources TEXT,
      insurance_company_name TEXT,
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
      id TEXT PRIMARY KEY, insurance_company TEXT DEFAULT '', currency TEXT NOT NULL, exchange_rate REAL NOT NULL,
      effective_date TEXT, expiry_date TEXT, creator TEXT, create_time TEXT
    );

    CREATE TABLE IF NOT EXISTS insurance_rates (
      id TEXT PRIMARY KEY, product_name TEXT NOT NULL, rate_min REAL NOT NULL, rate_max REAL,
      rate_type TEXT DEFAULT '区间费率', is_default INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY, application_id TEXT NOT NULL,
      bill_no TEXT NOT NULL, bill_amount REAL DEFAULT 0,
      bill_status TEXT DEFAULT '待缴费',
      payment_deadline TEXT, bill_files TEXT,
      payment_date TEXT, remark TEXT,
      created_at TEXT, updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY, application_id TEXT NOT NULL, policy_number TEXT,
      insurance_company_name TEXT,
      invoice_no TEXT NOT NULL, invoice_amount REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0, tax_amount REAL DEFAULT 0,
      policy_holder_name TEXT, insured_company_name TEXT,
      invoice_type TEXT DEFAULT '增值税普通发票', invoice_date TEXT,
      invoice_status TEXT DEFAULT '已开具', invoice_files TEXT,
      remark TEXT, created_at TEXT, updated_at TEXT
    );
  `);

  // ==== 迁移 insurance_rates：逐条安全执行，幂等 ====
  const migrateSqls = [
    'ALTER TABLE insurance_rates ADD COLUMN product_name TEXT',
    'ALTER TABLE insurance_rates ADD COLUMN rate_min REAL',
    'ALTER TABLE insurance_rates ADD COLUMN rate_max REAL',
    "ALTER TABLE insurance_rates ADD COLUMN rate_type TEXT DEFAULT '区间费率'",
    'ALTER TABLE insurance_rates ADD COLUMN is_default INTEGER DEFAULT 0',
    "UPDATE insurance_rates SET product_name = COALESCE(insurance_company, '未命名产品') WHERE (product_name IS NULL OR product_name = '') AND insurance_company IS NOT NULL AND insurance_company != ''",
    'UPDATE insurance_rates SET rate_min = COALESCE(rate, 0) WHERE rate_min IS NULL AND rate IS NOT NULL',
    "UPDATE insurance_rates SET rate_type = '固定费率' WHERE rate_type IS NULL AND rate IS NOT NULL",
    'UPDATE insurance_rates SET is_default = 0 WHERE is_default IS NULL',
  ];
  for (const sql of migrateSqls) {
    try { rawDb.run(sql); } catch (_) { /* 列已存在或无可迁移数据，静默跳过 */ }
  }

  const db = await getDb();

  // ==== 空表自动补种 ====
  const exrCount = (rawDb.exec('SELECT COUNT(*) as c FROM exchange_rates')[0]?.values?.[0]?.[0] as number) || 0;
  const insrCount = (rawDb.exec('SELECT COUNT(*) as c FROM insurance_rates')[0]?.values?.[0]?.[0] as number) || 0;

  seedExchangeRates(rawDb);
  seedInsuranceRates(rawDb);
  seedApplications(rawDb);
  seedHistory(db);
  seedClaims(rawDb);
  seedBills(rawDb);
  seedInvoices(rawDb);

  saveDb();
  console.log('[IMS DB] Schema migrated & seed data loaded');
}

function q(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function seedExchangeRates(db: { run: (s: string) => void }) {
  const rows = [
    ['exr-1','','美元',6.8109,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:27:01'],
    ['exr-2','','欧元',7.7671,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:28:33'],
    ['exr-3','','日本元',0.042045,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:28:01'],
    ['exr-4','','港币',0.86855,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:27:29'],
    ['exr-5','','韩国圆',0.0044,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:29:12'],
    ['exr-6','','澳门元',0.8432,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:24:52'],
    ['exr-7','','台币',0.2133,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:23:51'],
    ['exr-8','','新加坡元',5.2605,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:22:24'],
    ['exr-9','','英镑',9.0145,'2026-07-01','2026-07-31','陆晓峰','2026-07-01 09:21:41'],
  ];
  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO exchange_rates (id, insurance_company, currency, exchange_rate, effective_date, expiry_date, creator, create_time) VALUES (${r.map(q).join(',')})`);
  }
}

function seedInsuranceRates(db: { run: (s: string) => void }) {
  const rows = [
    ['insr-1','保险产品-通用',0.0004,0.00045,'区间费率',1,'2026-01-19','2026-09-06','全新的电子产品、电子元器件、精密仪器、普通货物','启用',null,'','',null,'','','陆晓峰','2026-01-19 16:07:14'],
    ['insr-2','保险产品-英特尔专属',0.00025,null,'固定费率',0,'2026-06-09','2026-06-30','英特尔CPU','启用',null,'','',null,'','','陆晓峰','2026-06-09 10:25:23'],
    ['insr-3','保险产品-单独报价',0,null,'手工填写',0,'2026-07-01','2027-06-30','特殊货物、高价值/危险品、非常规运输','启用',null,'','',null,'','','陆晓峰','2026-07-01 10:00:00'],
    ['insr-4','精密仪器专用',0.00042,null,'固定费率',0,'2025-09-28','2026-09-27','精密仪器、普通货物','启用',null,'','',null,'','','陆晓峰','2025-11-12 17:01:51'],
  ];
  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO insurance_rates (id, product_name, rate_min, rate_max, rate_type, is_default, effective_date, expiry_date, cargo_type, status, cargo_value_rmb, agreement_no, min_charge, package_type, old_new_type, remark, creator, create_time) VALUES (${r.map(q).join(',')})`);
  }
}

function seedApplications(db: { run: (s: string) => void }) {
  const ai = (o: object) => q(JSON.stringify(o));

  const rows: Array<Array<string | number | null>> = [
    ['app-1','PVG-AI26060171','非保入库','非保入库','上海泓明国际货运有限公司','深圳精智达半导体技术有限公司','深圳精智达半导体技术有限公司','Approved','审批通过','批改申请',2,1,'app-4','','批改内容已核实，保费调整无误','TB202606250001','2026-06-25 09:40:31','谭泽宇','','生效','已经回填','fms','中国人保',
      ai({creditCode:'91310115MA1H2B3C4D',policyHolderNameDesc:'上海泓明国际货运有限公司',applicantContactName:'谭泽宇',applicantContactPhone:'021-58345678',applicantContactAddress:'上海市浦东新区张江高科技园区碧波路690号',insuredCompanyDesc:'深圳精智达半导体技术有限公司',customerCreditCode:'91440300MA5D6E7F8G',insuredCompanyName:'深圳精智达半导体技术有限公司',insuredCreditCode:'91440300MA5D6E7F8G',insuredContactName:'王明辉',insuredContactPhone:'0755-86543210',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'广东省',insuredAddressCity:'深圳市',insuredAddressDistrict:'南山区',insuredAddress:'深圳市南山区粤海街道科苑路15号'}),
      ai({transitPort:'广州白云国际机场（中国）',containerTypeDesc:'其他',insuranceProductType:'进口运输险',transportMode:'航空运输',invoiceNo:'INV-2026-0625-001',billNo:'99993756972',vesselName:'CA1234',transferPlateNo:'',isContainer:'否',specialTransportRequirement:'无',departureTime:'2026-06-26',originCountryCode:'国际(International)',originCountry:'美国',originProvince:'加利福尼亚州',originCity:'洛杉矶',originDistrict:'',originAddress:'LOS ANGELES, CA 90045',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场海关监管仓库'}),
      ai({packageTypeDesc:'木制或竹藤等植物性材料制盒/箱',productNameCn:'升降搬运装置等(详见COMMERCIALINVOICE)',goodsModel:'HX-2000',goodsNature:'新货',goodsQuantity:100,packageQuantity:1,shippingMark:'N/M'}),
      ai({invoiceAmount:56035,currencyCodeIdDesc:'美元',markupPercentageDesc:'发票金额原值110%',estimatedInsuranceAmount:61638.5,estimatedPremium:168.09,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'广东省',compensationCity:'深圳市',compensationDistrict:'南山区',compensationAddress:'深圳市南山区粤海街道科苑路15号',remark:'',insuranceFiles:[]}),
      ai({insuranceCompanyCode:'中国人保',policyNumber:'PYII2026310100000023',insuranceCompanyPolicyStatus:'已承保',insuranceCompanyPremium:168.12,policyFiles:[]}),
      ai({insuranceCompanyCorrectionStatus:'已批改',correctionEnterpriseNumber:'EYII202631010000000599',correctionOfPremiums:168.12,correctionFiles:[]}),
      '2026-06-20T10:15:00.000Z','2026-06-25T09:40:31.000Z'],
    ['app-4','PVG-AI26060171','非保入库','非保入库','上海泓明国际货运有限公司','深圳精智达半导体技术有限公司','深圳精智达半导体技术有限公司','Approved','审批通过','新增投保单',1,0,'','','材料齐全，同意承保','TB202606200005','2026-06-20 10:15:00','谭泽宇','','生效','已经回填','fms','中国平安',
      ai({creditCode:'91310115MA1H2B3C4D',policyHolderNameDesc:'上海泓明国际货运有限公司',applicantContactName:'谭泽宇',applicantContactPhone:'021-58345678',applicantContactAddress:'上海市浦东新区张江高科技园区碧波路690号',insuredCompanyDesc:'深圳精智达半导体技术有限公司',customerCreditCode:'91440300MA5D6E7F8G',insuredCompanyName:'深圳精智达半导体技术有限公司',insuredCreditCode:'91440300MA5D6E7F8G',insuredContactName:'王明辉',insuredContactPhone:'0755-86543210',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'广东省',insuredAddressCity:'深圳市',insuredAddressDistrict:'南山区',insuredAddress:'深圳市南山区粤海街道科苑路15号'}),
      ai({transitPort:'上海浦东国际机场（中国）',containerTypeDesc:'普通集装箱',insuranceProductType:'进口运输险',transportMode:'航空运输',invoiceNo:'INV-2026-0620-001',billNo:'99993756970',vesselName:'CA1230',transferPlateNo:'',isContainer:'是',specialTransportRequirement:'无',departureTime:'2026-06-21',originCountryCode:'国际(International)',originCountry:'美国',originProvince:'加利福尼亚州',originCity:'洛杉矶',originDistrict:'',originAddress:'LOS ANGELES, CA 90045',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场海关监管仓库'}),
      ai({packageTypeDesc:'纸制或纤维板制盒/箱',productNameCn:'升降搬运装置等',goodsModel:'HX-2000',goodsNature:'新货',goodsQuantity:100,packageQuantity:2,shippingMark:'N/M'}),
      ai({invoiceAmount:56000,currencyCodeIdDesc:'美元',markupPercentageDesc:'发票金额原值100%',estimatedInsuranceAmount:61600,estimatedPremium:154,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'广东省',compensationCity:'深圳市',compensationDistrict:'南山区',compensationAddress:'深圳市南山区粤海街道科苑路15号',remark:'',insuranceFiles:[]}),
      ai({insuranceCompanyCode:'中国平安',policyNumber:'PYII2026310100000018',insuranceCompanyPolicyStatus:'待承保',insuranceCompanyPremium:154,policyFiles:[]}),
      ai({insuranceCompanyCorrectionStatus:'',correctionEnterpriseNumber:'',correctionOfPremiums:0,correctionFiles:[]}),
      '2026-06-20T10:15:00.000Z','2026-06-20T10:15:00.000Z'],
    ['app-2','PAC-INTEL26060002Y','非保入库','非保入库','上海泓明供应链有限公司','英特尔贸易（上海）有限公司','英特尔贸易（上海）有限公司','Approved','审批通过','新增投保单',1,1,'','','','TB202606260003','2026-06-26 11:38:33','费斌','订单完成','生效','已经回填','cos','中国人保',
      ai({creditCode:'91310115MA1H8D9E0F',policyHolderNameDesc:'上海泓明供应链有限公司',applicantContactName:'费斌',applicantContactPhone:'021-50497890',applicantContactAddress:'上海市浦东新区外高桥保税区富特西一路289号',insuredCompanyDesc:'英特尔贸易（上海）有限公司',customerCreditCode:'91310000MA1G5H6I7J',insuredCompanyName:'英特尔贸易（上海）有限公司',insuredCreditCode:'91310000MA1G5H6I7J',insuredContactName:'李经理',insuredContactPhone:'021-50491234',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'上海市',insuredAddressCity:'上海市',insuredAddressDistrict:'浦东新区',insuredAddress:'上海市浦东新区金桥开发区'}),
      ai({transitPort:'',containerTypeDesc:'其他',insuranceProductType:'国内运输险',transportMode:'公路运输',invoiceNo:'INV-2026-0626-CPU',billNo:'BL20260626999',vesselName:'沪B·87654',transferPlateNo:'',isContainer:'否',specialTransportRequirement:'无',departureTime:'2026-06-27',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'辽宁省',originCity:'大连市',originDistrict:'金州区',originAddress:'大连市金州区经济技术开发区',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海市浦东新区外高桥保税区'}),
      ai({packageTypeDesc:'天然木托',productNameCn:'中央处理器',goodsModel:'i9-14900K',goodsNature:'新货',goodsQuantity:3200,packageQuantity:16,shippingMark:'INTEL-SH'}),
      ai({invoiceAmount:37073210,currencyCodeIdDesc:'人民币',markupPercentageDesc:'发票金额原值100%',estimatedInsuranceAmount:37073210,estimatedPremium:9268.3,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'上海市',compensationCity:'上海市',compensationDistrict:'浦东新区',compensationAddress:'上海市浦东新区外高桥保税区富特西一路289号',remark:'英特尔CPU批量运输',insuranceFiles:[]}),
      ai({insuranceCompanyCode:'中国人保',policyNumber:'PYDL202631010000002682',insuranceCompanyPolicyStatus:'已承保',insuranceCompanyPremium:9268.3,policyFiles:[]}),
      ai({insuranceCompanyCorrectionStatus:'',correctionEnterpriseNumber:'',correctionOfPremiums:0,correctionFiles:[]}),
      '2026-06-26T11:38:33.000Z','2026-06-26T11:38:33.000Z'],
    ['app-3','PVG-AI26070001','非保入库','非保入库','上海泓明国际货运有限公司','北京亦盛精密半导体有限公司','北京亦盛精密半导体有限公司','WaitStart','待发起','新增投保单',1,1,'','','','TB202607010001','2026-07-01 14:30:00','谭泽宇','','未生效','未回填','fms','',
      ai({creditCode:'91110108MA7D1E2F3G',policyHolderNameDesc:'上海泓明国际货运有限公司',applicantContactName:'张伟',applicantContactPhone:'010-62345678',applicantContactAddress:'北京市海淀区中关村南大街5号',insuredCompanyDesc:'北京亦盛精密半导体有限公司',customerCreditCode:'91110108MA7D1E2F3G',insuredCompanyName:'北京亦盛精密半导体有限公司',insuredCreditCode:'91110108MA7D1E2F3G',insuredContactName:'李强',insuredContactPhone:'010-82345678',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'北京市',insuredAddressCity:'北京市',insuredAddressDistrict:'海淀区',insuredAddress:'北京市海淀区学院路30号'}),
      ai({transitPort:'',containerTypeDesc:'普通集装箱',insuranceProductType:'国内运输险',transportMode:'公路运输',invoiceNo:'INV-2026-0701-001',billNo:'BL20260701001',vesselName:'京A·12345',transferPlateNo:'',isContainer:'否',specialTransportRequirement:'无',departureTime:'2026-07-02',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'上海市',originCity:'上海市',originDistrict:'浦东新区',originAddress:'上海市浦东新区外高桥保税区',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'北京市',destCity:'北京市',destDistrict:'海淀区',destAddress:'北京市海淀区中关村'}),
      ai({packageTypeDesc:'纸制或纤维板制盒/箱',productNameCn:'晶圆测试设备',goodsModel:'WT-3000',goodsNature:'新货',goodsQuantity:50,packageQuantity:5,shippingMark:'BJYS-001'}),
      ai({invoiceAmount:850000,currencyCodeIdDesc:'人民币',markupPercentageDesc:'发票金额原值110%',estimatedInsuranceAmount:935000,estimatedPremium:2340,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'北京市',compensationCity:'北京市',compensationDistrict:'海淀区',compensationAddress:'北京市海淀区学院路30号',remark:'精密设备运输，需防震',insuranceFiles:[]}),
      ai({insuranceCompanyCode:'',policyNumber:'',insuranceCompanyPolicyStatus:'',insuranceCompanyPremium:0,policyFiles:[]}),
      ai({insuranceCompanyCorrectionStatus:'',correctionEnterpriseNumber:'',correctionOfPremiums:0,correctionFiles:[]}),
      '2026-07-01T14:30:00.000Z','2026-07-01T14:30:00.000Z'],
    ['app-5','PVG-AI26070002','保税返库','保税返库','上海泓明供应链有限公司','合肥精智达半导体技术有限公司','合肥精智达半导体技术有限公司','Reject','审批拒绝','新增投保单',1,1,'','','材料不全，缺少运输许可证明','TB202607010002','2026-07-01 10:00:00','费斌','订单处理中','未生效','未回填','cos','',
      ai({creditCode:'91310115MA1H8D9E0F',policyHolderNameDesc:'上海泓明供应链有限公司',applicantContactName:'费斌',applicantContactPhone:'021-50497890',applicantContactAddress:'上海市浦东新区外高桥保税区富特西一路289号',insuredCompanyDesc:'合肥精智达半导体技术有限公司',customerCreditCode:'91340100MA5K8L9M0N',insuredCompanyName:'合肥精智达半导体技术有限公司',insuredCreditCode:'91340100MA5K8L9M0N',insuredContactName:'陈伟',insuredContactPhone:'0551-62345678',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'安徽省',insuredAddressCity:'合肥市',insuredAddressDistrict:'蜀山区',insuredAddress:'合肥市蜀山区高新区望江西路800号'}),
      ai({transitPort:'上海浦东国际机场（中国）',containerTypeDesc:'其他',insuranceProductType:'进口运输险',transportMode:'航空运输',invoiceNo:'INV-2026-0701-002',billNo:'99993756980',vesselName:'MU5888',transferPlateNo:'',isContainer:'是',specialTransportRequirement:'无',departureTime:'2026-07-05',originCountryCode:'国际(International)',originCountry:'日本',originProvince:'东京都',originCity:'东京',originDistrict:'',originAddress:'TOKYO, JAPAN',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场'}),
      ai({packageTypeDesc:'天然木托',productNameCn:'半导体测试探针卡',goodsModel:'PC-8000',goodsNature:'新货',goodsQuantity:200,packageQuantity:2,shippingMark:'HFJZDA-JP'}),
      ai({invoiceAmount:4200000,currencyCodeIdDesc:'日元',markupPercentageDesc:'发票金额原值110%',estimatedInsuranceAmount:4620000,estimatedPremium:138.6,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'安徽省',compensationCity:'合肥市',compensationDistrict:'蜀山区',compensationAddress:'合肥市蜀山区高新区望江西路800号',remark:'',insuranceFiles:[]}),
      ai({insuranceCompanyCode:'',policyNumber:'',insuranceCompanyPolicyStatus:'',insuranceCompanyPremium:0,policyFiles:[]}),
      ai({insuranceCompanyCorrectionStatus:'',correctionEnterpriseNumber:'',correctionOfPremiums:0,correctionFiles:[]}),
      '2026-07-01T10:00:00.000Z','2026-07-01T10:00:00.000Z'],
    ['app-6','PVG-AI26070003','进境申报入库','进境申报入库','上海泓明国际货运有限公司','长江存储科技有限责任公司','长江存储科技有限责任公司','Approving','待审批','新增投保单',1,1,'','','','TB202607010003','2026-07-01 16:00:00','谭泽宇','','','','fms','',
      ai({creditCode:'91310115MA1H2B3C4D',policyHolderNameDesc:'上海泓明国际货运有限公司',applicantContactName:'谭泽宇',applicantContactPhone:'021-58345678',applicantContactAddress:'上海市浦东新区张江高科技园区碧波路690号',insuredCompanyDesc:'长江存储科技有限责任公司',customerCreditCode:'91420100MA4K4T5U6V',insuredCompanyName:'长江存储科技有限责任公司',insuredCreditCode:'91420100MA4K4T5U6V',insuredContactName:'赵刚',insuredContactPhone:'027-87654321',insuredAddressCountryCode:'国内(Domestic)',insuredAddressCountry:'中国',insuredAddressProvince:'湖北省',insuredAddressCity:'武汉市',insuredAddressDistrict:'洪山区',insuredAddress:'武汉市洪山区光谷大道77号'}),
      ai({transitPort:'',containerTypeDesc:'普通集装箱',insuranceProductType:'国内运输险',transportMode:'公路运输',invoiceNo:'INV-2026-0701-003',billNo:'BL20260701003',vesselName:'',transferPlateNo:'',isContainer:'是',specialTransportRequirement:'温控',departureTime:'2026-07-03',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'上海市',originCity:'上海市',originDistrict:'浦东新区',originAddress:'上海市浦东新区张江高科技园区',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'湖北省',destCity:'武汉市',destDistrict:'洪山区',destAddress:'武汉市洪山区光谷大道77号'}),
      ai({packageTypeDesc:'普通集装箱',productNameCn:'NAND闪存芯片',goodsModel:'YMTC-232L',goodsNature:'新货',goodsQuantity:10000,packageQuantity:20,shippingMark:'YMTC-WH'}),
      ai({invoiceAmount:5600000,currencyCodeIdDesc:'人民币',markupPercentageDesc:'发票金额原值110%',estimatedInsuranceAmount:6160000,estimatedPremium:15400,compensationCountryCode:'国内(Domestic)',compensationCountry:'中国',compensationProvince:'湖北省',compensationCity:'武汉市',compensationDistrict:'洪山区',compensationAddress:'武汉市洪山区光谷大道77号',remark:'高价值芯片，全程温控',insuranceFiles:[]}),
      ai({insuranceCompanyCode:'',policyNumber:'',insuranceCompanyPolicyStatus:'',insuranceCompanyPremium:0,policyFiles:[]}),
      ai({insuranceCompanyCorrectionStatus:'',correctionEnterpriseNumber:'',correctionOfPremiums:0,correctionFiles:[]}),
      '2026-07-01T16:00:00.000Z','2026-07-01T16:00:00.000Z'],
    // ===== 生产系统详情页真实数据（从 https://ims.hmglog.com 详情页提取，12条） =====
    // 7: SI26070009A — QFDZ - 群福电子科技（上海）有限公司
    ['app-7','SI26070009A','实物出库','实物出库','上海泓明国际货运有限公司','QFDZ - 群福电子科技（上海）有限公司','群福电子科技（上海）有限公司','Approved','审批通过','新增投保单',1,1,'','','','TB202607010001','2026-07-01 16:08:24','刘畅','','生效','已经回填','fms','中国人保',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "刘畅", "applicantContactPhone": "18001950278", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "QFDZ - 群福电子科技（上海）有限公司", "customerCreditCode": "91310113MA1GMH0BX1", "insuredCompanyName": "群福电子科技（上海）有限公司", "insuredCreditCode": "91310113MA1GMH0BX1", "insuredContactName": "黄小丽", "insuredContactPhone": "17623598620", "insuredAddressCountryCode": "国内(Domestic)", "insuredAddressCountry": "", "insuredAddressProvince": "上海市", "insuredAddressCity": "上海市", "insuredAddressDistrict": "浦东新区", "insuredAddress": "中国（上海）自由贸易试验区芳春路400号1幢3层"}),
      ai({"transitPort": "", "containerTypeDesc": "普通集装箱", "insuranceProductType": "进口运输险", "transportMode": "水路运输", "invoiceNo": "QET-20260701-01", "billNo": "3", "vesselName": "JJ STAR/2627N", "transferPlateNo": "", "isContainer": "是", "specialTransportRequirement": "无", "departureTime": "2026-07-01", "originCountryCode": "国际(International)", "originCountry": "TWN - 中国台湾", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "83143台湾高雄市大寮區後庄里民成街96之1號", "destCountryCode": "国内(Domestic)", "destCountry": "", "destProvince": "上海市", "destCity": "上海市", "destDistrict": "浦东新区", "destAddress": "上海市浦东新区康桥路1059号H101室"}),
      ai({"packageTypeDesc": "纸制或纤维板制盒/箱", "productNameCn": "晶片固定环/研磨(多晶硅)设备配件", "goodsModel": "0040-88203，0041-62429，0040-97734，0041-75394", "goodsNature": "新货", "goodsQuantity": 205, "packageQuantity": 52, "shippingMark": ""}),
      ai({"invoiceAmount": 82000.0, "currencyCodeIdDesc": "502 - 美元", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 90200.0, "estimatedPremium": 245.74, "compensationCountryCode": "国内(Domestic)", "compensationCountry": "", "compensationProvince": "上海市", "compensationCity": "上海市", "compensationDistrict": "浦东新区", "compensationAddress": "上海市浦东新区康桥路1059号H101室", "remark": "", "insuranceFiles": ["群福-20260701-01-PL(G).pdf", "群福-20260701-01-IN(G).pdf"]}),
      ai({"insuranceCompanyCode": "中国人保", "policyNumber": "PYII202631010000002444", "insuranceCompanyPolicyStatus": "已承保", "insuranceCompanyPremium": 245.74, "policyFiles": ["人保财险保单PYII202631010000002444.pdf"]}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-07-01T16:08:24.000Z','2026-07-01T16:08:24.000Z'],
    // 8: PVG-AE26060126 — BJYS - 北京亦盛精密半导体有限公司
    ['app-8','PVG-AE26060126','实物出库','实物出库','上海泓明国际货运有限公司','BJYS - 北京亦盛精密半导体有限公司','北京亦盛精密半导体有限公司','Approved','审批通过','新增投保单',1,1,'','','','TB202606290001','2026-06-29 16:28:25','吴钰涛','','生效','已经回填','fms','中国人保',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "吴钰涛", "applicantContactPhone": "18659665523", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "BJYS - 北京亦盛精密半导体有限公司", "customerCreditCode": "911103023303533195", "insuredCompanyName": "北京亦盛精密半导体有限公司", "insuredCreditCode": "911103023303533195", "insuredContactName": "罗庚", "insuredContactPhone": "13370170227", "insuredAddressCountryCode": "国内(Domestic)", "insuredAddressCountry": "", "insuredAddressProvince": "北京市", "insuredAddressCity": "北京市", "insuredAddressDistrict": "大兴区", "insuredAddress": "北京市北京经济技术开发区荣昌东街甲5号3号楼1层101-3"}),
      ai({"transitPort": "KOR901 - 首尔（韩国）", "containerTypeDesc": "其他", "insuranceProductType": "出口运输险", "transportMode": "航空运输", "invoiceNo": "R-20260603-3", "billNo": "98814153451_HM0018167", "vesselName": "OZ332", "transferPlateNo": "", "isContainer": "否", "specialTransportRequirement": "无", "departureTime": "2026-06-28", "originCountryCode": "国内(Domestic)", "originCountry": "", "originProvince": "北京市", "originCity": "北京市", "originDistrict": "朝阳区", "originAddress": "北京首都机场", "destCountryCode": "国际(International)", "destCountry": "KOR - 韩国", "destProvince": "", "destCity": "", "destDistrict": "", "destAddress": "SEMIOPTIC.CO.LTD   \nAdd: 34, Mireuksan-gil, Jiksan-eup, Seobuk-gu, Cheonan-si, Chungcheongnam-do, Korea"}),
      ai({"packageTypeDesc": "其他材料制盒/箱", "productNameCn": "衬环", "goodsModel": "540-02229-527-P02", "goodsNature": "新货", "goodsQuantity": 1, "packageQuantity": 1, "shippingMark": ""}),
      ai({"invoiceAmount": 300000.0, "currencyCodeIdDesc": "142 - 人民币", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 330000.0, "estimatedPremium": 132.0, "compensationCountryCode": "国内(Domestic)", "compensationCountry": "", "compensationProvince": "北京市", "compensationCity": "北京市", "compensationDistrict": "通州区", "compensationAddress": "北京市通州区科芯巷2号院", "remark": "", "insuranceFiles": ["invoice + packing list.pdf"]}),
      ai({"insuranceCompanyCode": "中国人保", "policyNumber": "PYIE202631010000011221", "insuranceCompanyPolicyStatus": "已承保", "insuranceCompanyPremium": 132.0, "policyFiles": ["人保财险保单PYIE202631010000011221.pdf"]}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-06-29T16:28:25.000Z','2026-06-29T16:28:25.000Z'],
    // 9: PVG-AI26060171 — JZDBDT - 深圳精智达半导体技术有限公司 [批改申请]
    ['app-9','PVG-AI26060171','非保入库','非保入库','上海泓明国际货运有限公司','JZDBDT - 深圳精智达半导体技术有限公司','深圳精智达半导体技术有限公司','Approved','审批通过','批改申请',1,1,'','','批改内容已核实，保费调整无误','TB202606250001','2026-06-25 09:40:31','谭泽宇','','生效','已经回填','fms','中国人保',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "谭泽宇", "applicantContactPhone": "15000213435", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "JZDBDT - 深圳精智达半导体技术有限公司", "customerCreditCode": "91440300MAE94EPR00", "insuredCompanyName": "深圳精智达半导体技术有限公司", "insuredCreditCode": "91440300MAE94EPR00", "insuredContactName": "叶真真", "insuredContactPhone": "13926427648", "insuredAddressCountryCode": "国内(Domestic)", "insuredAddressCountry": "", "insuredAddressProvince": "广东省", "insuredAddressCity": "深圳市", "insuredAddressDistrict": "龙华区", "insuredAddress": "深圳市南山区粤海街道高新园区社区科技南十二路2号金蝶研发中心金蝶云大厦2601、3501"}),
      ai({"transitPort": "CHN793 - 广州白云国际机场（中国）", "containerTypeDesc": "其他", "insuranceProductType": "进口运输险", "transportMode": "航空运输", "invoiceNo": "918280-1", "billNo": "", "vesselName": "CZ2544", "transferPlateNo": "", "isContainer": "否", "specialTransportRequirement": "无", "departureTime": "2026-06-27", "originCountryCode": "国际(International)", "originCountry": "USA - 美国", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "NEW YORK", "destCountryCode": "国内(Domestic)", "destCountry": "", "destProvince": "广东省", "destCity": "深圳市", "destDistrict": "龙华区", "destAddress": "深圳市龙华区龙华街道清湖路一号富安娜工业园D栋深圳精智达仓库"}),
      ai({"packageTypeDesc": "木制或竹藤等植物性材料制盒/箱", "productNameCn": "升降搬运装置等(详见COMMERCIALINVOICE)", "goodsModel": "COABL250等 (洋见COMMERCIAL INVOICE)", "goodsNature": "新货", "goodsQuantity": 1, "packageQuantity": 1, "shippingMark": ""}),
      ai({"invoiceAmount": 56035.0, "currencyCodeIdDesc": "502 - 美元", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 61638.5, "estimatedPremium": 168.09, "compensationCountryCode": "国内(Domestic)", "compensationCountry": "", "compensationProvince": "广东省", "compensationCity": "深圳市", "compensationDistrict": "龙华区", "compensationAddress": "深圳市龙华区龙华街道清湖路一号富安娜工业园D栋深圳精智达", "remark": "", "insuranceFiles": []}),
      ai({"insuranceCompanyCode": "中国人保", "policyNumber": "PYII2026310100000023", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 168.12, "policyFiles": ["人保财险保单PYII202631010000002382.pdf"]}),
      ai({"insuranceCompanyCorrectionStatus": "已批改", "correctionEnterpriseNumber": "EYII202631010000000599", "correctionOfPremiums": 168.12, "correctionFiles": ["人保财险批单EYII202631010000000599.pdf"]}),
      '2026-06-25T09:40:31.000Z','2026-06-25T09:40:31.000Z'],
    // 10: PVG-AI26040199 — YJX - 南京云极芯半导体科技有限公司 [草稿]
    ['app-10','PVG-AI26040199','','','上海泓明国际货运有限公司','YJX - 南京云极芯半导体科技有限公司','南京云极芯半导体科技有限公司','Draft','草稿','新增投保单',1,1,'','','','TB202605290004','2026-05-29 16:29:54','庄伶清','','未生效','未回填','fms','',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "庄伶清", "applicantContactPhone": "", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "YJX - 南京云极芯半导体科技有限公司", "customerCreditCode": "", "insuredCompanyName": "南京云极芯半导体科技有限公司", "insuredCreditCode": "", "insuredContactName": "", "insuredContactPhone": "", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "", "insuredAddressProvince": "", "insuredAddressCity": "", "insuredAddressDistrict": "", "insuredAddress": ""}),
      ai({"transitPort": "", "containerTypeDesc": "", "insuranceProductType": "进口运输险", "transportMode": "航空运输", "invoiceNo": "", "billNo": "18044087481", "vesselName": "", "transferPlateNo": "", "isContainer": "", "specialTransportRequirement": "", "departureTime": "", "originCountryCode": "国际(International)", "originCountry": "", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "INCHEON", "destCountryCode": "国际(International)", "destCountry": "", "destProvince": "", "destCity": "", "destDistrict": "", "destAddress": ""}),
      ai({"packageTypeDesc": "", "productNameCn": "PAD抛光垫", "goodsModel": "", "goodsNature": "", "goodsQuantity": 0, "packageQuantity": 0, "shippingMark": ""}),
      ai({"invoiceAmount": 0.0, "currencyCodeIdDesc": "", "markupPercentageDesc": "", "estimatedInsuranceAmount": 0.0, "estimatedPremium": 0.0, "compensationCountryCode": "国际(International)", "compensationCountry": "", "compensationProvince": "", "compensationCity": "", "compensationDistrict": "", "compensationAddress": "", "remark": "", "insuranceFiles": []}),
      ai({"insuranceCompanyCode": "", "policyNumber": "", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 0, "policyFiles": []}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-05-29T16:29:54.000Z','2026-05-29T16:29:54.000Z'],
    // 11: SI26050011 — CWY - 辰源微（苏州）半导体科技有限公司 [草稿]
    ['app-11','SI26050011','','','上海泓明国际货运有限公司','CWY - 辰源微（苏州）半导体科技有限公司','辰源微（苏州）半导体科技有限公司','Draft','草稿','新增投保单',1,1,'','','','TB202605270002','2026-05-27 13:05:49','曾婷婷','','未生效','未回填','fms','',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "曾婷婷", "applicantContactPhone": "", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "CWY - 辰源微（苏州）半导体科技有限公司", "customerCreditCode": "", "insuredCompanyName": "辰源微（苏州）半导体科技有限公司", "insuredCreditCode": "", "insuredContactName": "", "insuredContactPhone": "", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "", "insuredAddressProvince": "", "insuredAddressCity": "", "insuredAddressDistrict": "", "insuredAddress": ""}),
      ai({"transitPort": "", "containerTypeDesc": "", "insuranceProductType": "进口运输险", "transportMode": "水路运输", "invoiceNo": "", "billNo": "DJSCINC260004244", "vesselName": "", "transferPlateNo": "", "isContainer": "是", "specialTransportRequirement": "", "departureTime": "", "originCountryCode": "国际(International)", "originCountry": "", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "BUSAN", "destCountryCode": "国际(International)", "destCountry": "", "destProvince": "", "destCity": "", "destDistrict": "", "destAddress": ""}),
      ai({"packageTypeDesc": "", "productNameCn": "电力控制板等", "goodsModel": "", "goodsNature": "", "goodsQuantity": 0, "packageQuantity": 5, "shippingMark": ""}),
      ai({"invoiceAmount": 0.0, "currencyCodeIdDesc": "", "markupPercentageDesc": "", "estimatedInsuranceAmount": 0.0, "estimatedPremium": 0.0, "compensationCountryCode": "国际(International)", "compensationCountry": "", "compensationProvince": "", "compensationCity": "", "compensationDistrict": "", "compensationAddress": "", "remark": "", "insuranceFiles": []}),
      ai({"insuranceCompanyCode": "", "policyNumber": "", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 0, "policyFiles": []}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-05-27T13:05:49.000Z','2026-05-27T13:05:49.000Z'],
    // 12: SE26040041 — ASKS [草稿]
    ['app-12','SE26040041','','','上海泓明国际货运有限公司','ASKS','','Draft','草稿','新增投保单',1,1,'','','','TB202604280002','2026-04-28 16:13:53','邵晓锋','','未生效','未回填','fms','',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "邵晓锋", "applicantContactPhone": "", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "ASKS", "customerCreditCode": "", "insuredCompanyName": "", "insuredCreditCode": "", "insuredContactName": "", "insuredContactPhone": "", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "", "insuredAddressProvince": "", "insuredAddressCity": "", "insuredAddressDistrict": "", "insuredAddress": ""}),
      ai({"transitPort": "", "containerTypeDesc": "", "insuranceProductType": "出口运输险", "transportMode": "水路运输", "invoiceNo": "", "billNo": "SITRSHLCT014146", "vesselName": "", "transferPlateNo": "", "isContainer": "是", "specialTransportRequirement": "", "departureTime": "", "originCountryCode": "国际(International)", "originCountry": "", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "SHANGHAI", "destCountryCode": "国际(International)", "destCountry": "", "destProvince": "", "destCity": "", "destDistrict": "", "destAddress": ""}),
      ai({"packageTypeDesc": "", "productNameCn": "感光抗蚀干膜", "goodsModel": "", "goodsNature": "", "goodsQuantity": 0, "packageQuantity": 0, "shippingMark": ""}),
      ai({"invoiceAmount": 0.0, "currencyCodeIdDesc": "", "markupPercentageDesc": "", "estimatedInsuranceAmount": 0.0, "estimatedPremium": 0.0, "compensationCountryCode": "国际(International)", "compensationCountry": "", "compensationProvince": "", "compensationCity": "", "compensationDistrict": "", "compensationAddress": "", "remark": "", "insuranceFiles": []}),
      ai({"insuranceCompanyCode": "", "policyNumber": "", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 0, "policyFiles": []}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-04-28T16:13:53.000Z','2026-04-28T16:13:53.000Z'],
    // 13: PVG-AE26050015 — BJYS - 北京亦盛精密半导体有限公司 [待审批]
    ['app-13','PVG-AE26050015','实物出库','实物出库','上海泓明国际货运有限公司','BJYS - 北京亦盛精密半导体有限公司','北京亦盛精密半导体有限公司','Approving','待审批','新增投保单',1,1,'','','','TB202605110001','2026-05-11 16:53:07','吴钰涛','','未生效','未回填','fms','',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "吴钰涛", "applicantContactPhone": "18659665523", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "BJYS - 北京亦盛精密半导体有限公司", "customerCreditCode": "911103023303533195", "insuredCompanyName": "北京亦盛精密半导体有限公司", "insuredCreditCode": "911103023303533195", "insuredContactName": "罗庚", "insuredContactPhone": "13370170227", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "", "insuredAddressProvince": "北京市", "insuredAddressCity": "北京市", "insuredAddressDistrict": "通州区", "insuredAddress": "北京市通州区科芯巷2号院"}),
      ai({"transitPort": "", "containerTypeDesc": "其他", "insuranceProductType": "出口运输险", "transportMode": "航空运输", "invoiceNo": "R-20260428", "billNo": "02302045606_HM0018063", "vesselName": "FX5924", "transferPlateNo": "", "isContainer": "否", "specialTransportRequirement": "无", "departureTime": "2026-05-11", "originCountryCode": "国际(International)", "originCountry": "", "originProvince": "北京市", "originCity": "北京市", "originDistrict": "通州区", "originAddress": "北京市通州区科芯巷2号院", "destCountryCode": "国际(International)", "destCountry": "KOR - 韩国", "destProvince": "", "destCity": "", "destDistrict": "", "destAddress": "SEMIOPTIC.CO.LTD 34, Mireuksan-gil, Jiksan-eup, Seobuk-gu, Cheonan-si, Chungcheongnam-do, Korea"}),
      ai({"packageTypeDesc": "", "productNameCn": "陶瓷盖板(旧)", "goodsModel": "719-003481-385-E，719-003481-385-K，719-003481-861-J", "goodsNature": "旧货", "goodsQuantity": 10, "packageQuantity": 5, "shippingMark": ""}),
      ai({"invoiceAmount": 592000.0, "currencyCodeIdDesc": "142 - 人民币", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 651200.0, "estimatedPremium": 0.0, "compensationCountryCode": "国际(International)", "compensationCountry": "", "compensationProvince": "北京市", "compensationCity": "北京市", "compensationDistrict": "通州区", "compensationAddress": "北京市通州区科芯巷2号院", "remark": "", "insuranceFiles": ["出口箱单发票-报关.pdf"]}),
      ai({"insuranceCompanyCode": "", "policyNumber": "", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 0, "policyFiles": []}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-05-11T16:53:07.000Z','2026-05-11T16:53:07.000Z'],
    // 14: ZHJ-LAMS26010026J — LAMS - 泛林半导体设备技术（上海）有限公司 [待审批]
    ['app-14','ZHJ-LAMS26010026J','进境申报入库','进境申报入库','上海泓明供应链有限公司','LAMS - 泛林半导体设备技术（上海）有限公司','泛林半导体设备技术（上海）有限公司','Approving','待审批','新增投保单',1,1,'','','','TB202601080004','2026-01-08 10:31:48','鲍晓','','未生效','未回填','cos','',
      ai({"creditCode": "91310000733363087X", "policyHolderNameDesc": "上海泓明供应链有限公司", "applicantContactName": "鲍晓", "applicantContactPhone": "15961880808", "applicantContactAddress": "上海市浦东新区金汇路1018号", "insuredCompanyDesc": "LAMS - 泛林半导体设备技术（上海）有限公司", "customerCreditCode": "91310000733363087A", "insuredCompanyName": "泛林半导体设备技术（上海）有限公司", "insuredCreditCode": "91310000733363087A", "insuredContactName": "方远", "insuredContactPhone": "15961880809", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "", "insuredAddressProvince": "上海市", "insuredAddressCity": "上海市", "insuredAddressDistrict": "浦东新区", "insuredAddress": "上海市浦东张江高科技园区碧波路177号华虹科技园B区一楼"}),
      ai({"transitPort": "ZNA000 - 北美洲其他国家(地区) JPN901 - 札幌（日本）", "containerTypeDesc": "其他", "insuranceProductType": "国内运输险", "transportMode": "航空运输", "invoiceNo": "invoice001", "billNo": "", "vesselName": "沪A12345", "transferPlateNo": "", "isContainer": "否", "specialTransportRequirement": "防震 防倾斜 防尘 温控", "departureTime": "2026-01-08", "originCountryCode": "国际(International)", "originCountry": "", "originProvince": "上海市", "originCity": "上海市", "originDistrict": "闵行区", "originAddress": "上海浦东", "destCountryCode": "国际(International)", "destCountry": "", "destProvince": "上海市", "destCity": "上海市", "destDistrict": "黄浦区", "destAddress": "上海浦东"}),
      ai({"packageTypeDesc": "天然木托", "productNameCn": "反应腔内衬等", "goodsModel": "无型号", "goodsNature": "新货", "goodsQuantity": 100, "packageQuantity": 1, "shippingMark": ""}),
      ai({"invoiceAmount": 100000.0, "currencyCodeIdDesc": "110 - 港币", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 110000.0, "estimatedPremium": 0.0, "compensationCountryCode": "国际(International)", "compensationCountry": "", "compensationProvince": "上海市", "compensationCity": "上海市", "compensationDistrict": "浦东新区", "compensationAddress": "上海市浦东张江高科技园区碧波路177号华虹科技园B区一楼", "remark": "", "insuranceFiles": ["保修期内维修免税申请表.pdf"]}),
      ai({"insuranceCompanyCode": "", "policyNumber": "", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 0, "policyFiles": []}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-01-08T10:31:48.000Z','2026-01-08T10:31:48.000Z'],
    // 15: PVG-AI25120200 — JZDNKG - 南京精智达技术有限公司 [待审批]
    ['app-15','PVG-AI25120200','实物出库','实物出库','上海泓明国际货运有限公司','JZDNKG - 南京精智达技术有限公司','南京精智达技术有限公司','Approving','待审批','新增投保单',1,1,'','','','TB202512240001','2025-12-24 09:20:33','谭泽宇','','未生效','未回填','fms','中国平安',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "谭泽宇", "applicantContactPhone": "15000213435", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "JZDNKG - 南京精智达技术有限公司", "customerCreditCode": "91320111MAE90C7166", "insuredCompanyName": "南京精智达技术有限公司", "insuredCreditCode": "91320111MAE90C7166", "insuredContactName": "叶真真", "insuredContactPhone": "13926427648", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "D", "insuredAddressProvince": "", "insuredAddressCity": "", "insuredAddressDistrict": "", "insuredAddress": "江苏省南京市浦口区桥林街道百合路161号紫峰研创中心C区 紫峰三期 03栋"}),
      ai({"transitPort": "BEL000 - 比利时", "containerTypeDesc": "其他", "insuranceProductType": "进口运输险", "transportMode": "航空运输", "invoiceNo": "RJ25002973", "billNo": "", "vesselName": "3V815", "transferPlateNo": "", "isContainer": "否", "specialTransportRequirement": "防震 防倾斜", "departureTime": "2025-12-19", "originCountryCode": "国际(International)", "originCountry": "ITA - 意大利", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "Via Torino 6 - 10088 Volpiano", "destCountryCode": "国际(International)", "destCountry": "CHN - 中国", "destProvince": "", "destCity": "", "destDistrict": "", "destAddress": "江苏省南京市浦口区桥林街道百合路161号紫峰研创中心C区 紫峰三期 03栋"}),
      ai({"packageTypeDesc": "球状罐类", "productNameCn": "飞针测试机", "goodsModel": "4060L", "goodsNature": "新货", "goodsQuantity": 1, "packageQuantity": 1, "shippingMark": ""}),
      ai({"invoiceAmount": 379000.0, "currencyCodeIdDesc": "", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 416900.0, "estimatedPremium": 1437.17, "compensationCountryCode": "国际(International)", "compensationCountry": "CHN - 中国", "compensationProvince": "", "compensationCity": "", "compensationDistrict": "", "compensationAddress": "中国", "remark": "下次赔偿偿付地点请填写被保险人具体地址", "insuranceFiles": []}),
      ai({"insuranceCompanyCode": "中国平安", "policyNumber": "", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 0, "policyFiles": []}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2025-12-24T09:20:33.000Z','2025-12-24T09:20:33.000Z'],
    // 16: NKG-LKD26040001C — LKD - 立快德国际物流（南京）有限公司 [待发起]
    ['app-16','NKG-LKD26040001C','非保入库','非保入库','南京泓明供应链有限公司','LKD - 立快德国际物流（南京）有限公司','立快德国际物流（南京）有限公司','WaitStart','待发起','新增投保单',1,1,'','','','TB202604300001','2026-04-30 10:42:05','方远','','生效','已经回填','cos','中国人保',
      ai({"creditCode": "91320111MA1N18RW0H", "policyHolderNameDesc": "南京泓明供应链有限公司", "applicantContactName": "方远", "applicantContactPhone": "13057669188", "applicantContactAddress": "上海市浦东新区金汇路10183号", "insuredCompanyDesc": "LKD - 立快德国际物流（南京）有限公司", "customerCreditCode": "91320192MA7DF8CX1G", "insuredCompanyName": "立快德国际物流（南京）有限公司", "insuredCreditCode": "91320192MA7DF8CX1G", "insuredContactName": "Johnny", "insuredContactPhone": "18768574965", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "", "insuredAddressProvince": "江苏省", "insuredAddressCity": "南京市", "insuredAddressDistrict": "栖霞区", "insuredAddress": "南京市栖霞区龙潭街道经济技术开发区综康路12号A103室"}),
      ai({"transitPort": "CHN331 - 上海（中国）", "containerTypeDesc": "普通集装箱", "insuranceProductType": "进口运输险", "transportMode": "水路运输", "invoiceNo": "PO #8A", "billNo": "", "vesselName": "XIN YING KOU 265 S", "transferPlateNo": "", "isContainer": "是", "specialTransportRequirement": "无", "departureTime": "2026-04-27", "originCountryCode": "国际(International)", "originCountry": "CAN - 加拿大", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "177 RUE MINER, COWANSVILLE, QC, CANADA J2K3Y5", "destCountryCode": "国际(International)", "destCountry": "", "destProvince": "上海市", "destCity": "上海市", "destDistrict": "浦东新区", "destAddress": "江苏省南京市栖霞区龙潭龙潭街道"}),
      ai({"packageTypeDesc": "其他包装", "productNameCn": "护肤品", "goodsModel": "无", "goodsNature": "新货", "goodsQuantity": 17068, "packageQuantity": 11, "shippingMark": ""}),
      ai({"invoiceAmount": 271679.55, "currencyCodeIdDesc": "502 - 美元", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 298847.51, "estimatedPremium": 827.14, "compensationCountryCode": "国际(International)", "compensationCountry": "", "compensationProvince": "江苏省", "compensationCity": "南京市", "compensationDistrict": "栖霞区", "compensationAddress": "南京市栖霞区龙潭街道经济技术开发区综康路12号A103室", "remark": "", "insuranceFiles": ["IDC PO8a_Packing List_Updated.xlsx", "PO8A_Commercial Invoice_sea shipment.pdf"]}),
      ai({"insuranceCompanyCode": "中国人保", "policyNumber": "PYII202631010000001474", "insuranceCompanyPolicyStatus": "已承保", "insuranceCompanyPremium": 827.15, "policyFiles": ["人保财险保单PYII202631010000001474.pdf"]}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 827.15, "correctionFiles": []}),
      '2026-04-30T10:42:05.000Z','2026-04-30T10:42:05.000Z'],
    // 17: PVG-AI26040139 — HHCD - 华虹集成电路（成都）有限公司 [待发起]
    ['app-17','PVG-AI26040139','非保入库','非保入库','上海泓明国际货运有限公司','HHCD - 华虹集成电路（成都）有限公司','华虹集成电路（成都）有限公司','WaitStart','待发起','新增投保单',1,1,'','','','TB202604270002','2026-04-27 15:24:19','陆晓峰','','生效','已经回填','fms','中国人保',
      ai({"creditCode": "91310000132248358N", "policyHolderNameDesc": "上海泓明国际货运有限公司", "applicantContactName": "陆晓峰", "applicantContactPhone": "15000907213", "applicantContactAddress": "上海市浦东新区金汇路10181号", "insuredCompanyDesc": "HHCD - 华虹集成电路（成都）有限公司", "customerCreditCode": "91510100MACQKCB55N", "insuredCompanyName": "华虹集成电路（成都）有限公司", "insuredCreditCode": "91510100MACQKCB55N", "insuredContactName": "李倩", "insuredContactPhone": "15928831728", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "", "insuredAddressProvince": "四川省", "insuredAddressCity": "成都市", "insuredAddressDistrict": "郫都区", "insuredAddress": "康胜路100号附1号"}),
      ai({"transitPort": "BEL018 - 列日（比利时）", "containerTypeDesc": "普通集装箱", "insuranceProductType": "进口运输险", "transportMode": "航空运输", "invoiceNo": "815873291", "billNo": "756-68992206", "vesselName": "3V826 国内提货车牌号：沪EQ7318，沪DP4697，闽DK0131，沪DE0979，沪ET7807", "transferPlateNo": "DS272HR + W2993GT / PH6466 + W6511GT / CJ 60 KDS + W 3674GT / DB22DDE + W3673GT", "isContainer": "否", "specialTransportRequirement": "防震 防倾斜", "departureTime": "2026-04-21", "originCountryCode": "国际(International)", "originCountry": "AUT - 奥地利", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "LAM Research AG(on behalf of LAM Research International SDN BHD) SEZ-Strasse 1 A-9500 Villach AUSTRIA", "destCountryCode": "国际(International)", "destCountry": "", "destProvince": "四川省", "destCity": "成都市", "destDistrict": "郫都区", "destAddress": "康胜路100号附1号"}),
      ai({"packageTypeDesc": "木制或竹藤等植物性材料制盒/箱", "productNameCn": "硅片清洗机", "goodsModel": "EOS_Front/EOS1_DS L/EOS2_DS L", "goodsNature": "新货", "goodsQuantity": 1, "packageQuantity": 34, "shippingMark": ""}),
      ai({"invoiceAmount": 8286262.8, "currencyCodeIdDesc": "502 - 美元", "markupPercentageDesc": "发票金额原值110%", "estimatedInsuranceAmount": 9114889.08, "estimatedPremium": 25227.83, "compensationCountryCode": "国际(International)", "compensationCountry": "", "compensationProvince": "四川省", "compensationCity": "成都市", "compensationDistrict": "郫都区", "compensationAddress": "康胜路100号附1号", "remark": "", "insuranceFiles": []}),
      ai({"insuranceCompanyCode": "中国人保", "policyNumber": "PYII202631010000001388", "insuranceCompanyPolicyStatus": "已承保", "insuranceCompanyPremium": 25227.86, "policyFiles": ["人保财险保单PYII202631010000001388.pdf"]}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 25227.86, "correctionFiles": []}),
      '2026-04-27T15:24:19.000Z','2026-04-27T15:24:19.000Z'],
    // 18: ZHJ-TRN26030008H — TRN - 系统演示 [待发起]
    ['app-18','ZHJ-TRN26030008H','非保入库','非保入库','上海泓明供应链有限公司','TRN - 系统演示','系统演示','WaitStart','待发起','新增投保单',1,1,'','','','TB202603220003','2026-03-22 03:30:01','王加','','未生效','未回填','cos','',
      ai({"creditCode": "91310000733363087X", "policyHolderNameDesc": "上海泓明供应链有限公司", "applicantContactName": "123", "applicantContactPhone": "123", "applicantContactAddress": "上海市浦东新区金汇路1018号", "insuredCompanyDesc": "TRN - 系统演示", "customerCreditCode": "123", "insuredCompanyName": "系统演示", "insuredCreditCode": "123", "insuredContactName": "123", "insuredContactPhone": "123", "insuredAddressCountryCode": "国际(International)", "insuredAddressCountry": "BHR - 巴林", "insuredAddressProvince": "", "insuredAddressCity": "", "insuredAddressDistrict": "", "insuredAddress": "测试地址"}),
      ai({"transitPort": "", "containerTypeDesc": "普通集装箱", "insuranceProductType": "进口运输险", "transportMode": "水路运输", "invoiceNo": "123", "billNo": "123", "vesselName": "123", "transferPlateNo": "", "isContainer": "否", "specialTransportRequirement": "防震 防倾斜", "departureTime": "2026-06-26", "originCountryCode": "国际(International)", "originCountry": "BHR - 巴林", "originProvince": "", "originCity": "", "originDistrict": "", "originAddress": "1231", "destCountryCode": "国际(International)", "destCountry": "MMR - 缅甸", "destProvince": "", "destCity": "", "destDistrict": "", "destAddress": "123"}),
      ai({"packageTypeDesc": "包/袋", "productNameCn": "测试", "goodsModel": "123", "goodsNature": "旧货", "goodsQuantity": 111, "packageQuantity": 111, "shippingMark": "111"}),
      ai({"invoiceAmount": 111.0, "currencyCodeIdDesc": "110 - 港币", "markupPercentageDesc": "发票金额原值100%", "estimatedInsuranceAmount": 111.0, "estimatedPremium": 0.0, "compensationCountryCode": "国际(International)", "compensationCountry": "CYP - 塞浦路斯", "compensationProvince": "", "compensationCity": "", "compensationDistrict": "", "compensationAddress": "测试地址", "remark": "", "insuranceFiles": ["未核销列表 (65).xlsx"]}),
      ai({"insuranceCompanyCode": "", "policyNumber": "", "insuranceCompanyPolicyStatus": "", "insuranceCompanyPremium": 0, "policyFiles": []}),
      ai({"insuranceCompanyCorrectionStatus": "", "correctionEnterpriseNumber": "", "correctionOfPremiums": 0, "correctionFiles": []}),
      '2026-03-22T03:30:01.000Z','2026-03-22T03:30:01.000Z'],
  ];

  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO insurance_applications VALUES (${r.map((v) => v === null ? 'NULL' : typeof v === 'number' ? String(v) : typeof v === 'string' && v.startsWith("'") ? v : q(v)).join(',')})`);
  }
}

function seedHistory(
  _db: ReturnType<typeof getDb> extends Promise<infer T> ? T : never
) {
  const rawDb = getRawDb();
  const j = (o: unknown) => { const s = JSON.stringify(o); return `'${s.replace(/'/g, "''")}'`; };

  rawDb.run(`INSERT OR IGNORE INTO history_versions (id, application_id, version, timestamp, label, data) VALUES ('histv-1','app-1',1,'2026-06-20 10:15:00','原始投保',${j({jobidref:'PVG-AI26060171',transitPort:'上海浦东国际机场（中国）',containerTypeDesc:'普通集装箱',packageTypeDesc:'纸制或纤维板制盒/箱',productNameCn:'升降搬运装置等',packageQuantity:2,goodsNature:'新货',invoiceAmount:56000,estimatedInsuranceAmount:61600,markupPercentageDesc:'发票金额原值100%',estimatedPremium:154,insuranceCompanyPremium:154,insuranceCompanyCode:'中国平安',insuranceCompanyPolicyStatus:'待承保'})})`);

  rawDb.run("INSERT OR IGNORE INTO approval_history (id, application_id, timestamp, approver, action, comment) VALUES ('ah-1','app-1','2026-06-20 14:00:00','张经理','审批通过','材料齐全，风险可控，同意承保')");
  rawDb.run("INSERT OR IGNORE INTO approval_history (id, application_id, timestamp, approver, action, comment) VALUES ('ah-2','app-1','2026-06-25 11:00:00','李主管','审批通过','批改申请已核实，保费调整无误，同意批改')");
  rawDb.run("INSERT OR IGNORE INTO approval_history (id, application_id, timestamp, approver, action, comment) VALUES ('ah-3','app-2','2026-06-26 15:00:00','张经理','审批通过','英特尔CPU运输，保额较大但风险可控')");
  rawDb.run("INSERT OR IGNORE INTO approval_history (id, application_id, timestamp, approver, action, comment) VALUES ('ah-4','app-5','2026-07-01 12:00:00','王总监','审批拒绝','缺少运输许可证明，材料不全，请补全后重新提交')");
  rawDb.run("INSERT OR IGNORE INTO approval_history (id, application_id, timestamp, approver, action, comment) VALUES ('ah-5','app-6','2026-07-01 17:00:00','张经理','审批中','')");

  rawDb.run("INSERT OR IGNORE INTO change_logs (id, application_id, timestamp, user, field_label, old_value, new_value) VALUES ('cl-1','app-1','2026-06-25 09:35:00','谭泽宇','包装种类','纸制或纤维板制盒/箱','木制或竹藤等植物性材料制盒/箱')");
  rawDb.run("INSERT OR IGNORE INTO change_logs (id, application_id, timestamp, user, field_label, old_value, new_value) VALUES ('cl-2','app-1','2026-06-25 09:35:00','谭泽宇','保险公司名称','中国平安','中国人保')");
  rawDb.run("INSERT OR IGNORE INTO change_logs (id, application_id, timestamp, user, field_label, old_value, new_value) VALUES ('cl-3','app-1','2026-06-25 09:35:00','谭泽宇','保单单号','PYII2026310100000018','PYII2026310100000023')");
  rawDb.run("INSERT OR IGNORE INTO change_logs (id, application_id, timestamp, user, field_label, old_value, new_value) VALUES ('cl-4','app-1','2026-06-25 09:35:00','谭泽宇','预计保费','154.00','168.09')");
  rawDb.run("INSERT OR IGNORE INTO change_logs (id, application_id, timestamp, user, field_label, old_value, new_value) VALUES ('cl-5','app-1','2026-06-25 09:35:00','谭泽宇','实际保费','154.00','168.12')");
  rawDb.run("INSERT OR IGNORE INTO change_logs (id, application_id, timestamp, user, field_label, old_value, new_value) VALUES ('cl-6','app-1','2026-06-25 09:35:00','谭泽宇','加成比例','发票金额原值100%','发票金额原值110%')");
}

function seedBills(db: { run: (s: string) => void }) {
  const rows = [
    ['bill-1','app-1','BL20260625001',168.12,'已缴费','2026-07-15','[]','2026-06-25','保费账单已缴清','2026-06-25 09:40:00','2026-06-25 09:40:00'],
    ['bill-2','app-1','BL20260625002',168.12,'已开票','2026-07-20','[]','2026-06-25','批改保费差额已缴并开票','2026-06-25 10:00:00','2026-06-25 10:00:00'],
    ['bill-3','app-2','BL20260626001',9268.30,'已缴费','','[]','2026-06-26','英特尔CPU运输保费','2026-06-26 11:40:00','2026-06-26 11:40:00'],
    ['bill-4','app-6','BL20260701001',15400,'待缴费','','[]','','高价值芯片运输，待审批后缴费','2026-07-01 16:00:00','2026-07-01 16:00:00'],
  ];
  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO bills VALUES (${r.map(q).join(',')})`);
  }
}

function seedInvoices(db: { run: (s: string) => void }) {
  const rows = [
    ['inv-1','app-1','','','INV20260625001',168.12,6,10.09,'上海泓明国际货运有限公司','中国人保','增值税普通发票','2026-06-25','已开具','[]','保费发票','2026-06-25 10:00:00','2026-06-25 10:00:00'],
    ['inv-2','app-2','','','INV20260626001',9268.30,13,1204.88,'上海泓明供应链有限公司','中国人保','增值税专用发票','2026-06-26','已开具','[]','英特尔CPU运输保费发票','2026-06-26 11:45:00','2026-06-26 11:45:00'],
    ['inv-3','app-2','','','INV20260626002',9268.30,0,0,'','','增值税普通发票','2026-06-26','已作废','[]','开票信息有误，已作废重开','2026-06-26 12:00:00','2026-06-26 12:00:00'],
  ];
  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO invoices VALUES (${r.map(q).join(',')})`);
  }
}

function seedClaims(db: { run: (s: string) => void }) {
  const ai = (o: object) => q(JSON.stringify(o));

  const rows = [
    ['clm-1','RPT20260625001','审批通过','2026-06-25 14:30:00','谭泽宇','PYII2026310100000023','中国人保','深圳精智达半导体技术有限公司','理赔完成',ai({jobidref:'PVG-AI26060171',applicantDept:'物流部',billNo:'99993756972',originCountryCode:'国际(International)',originCountry:'美国',originProvince:'加利福尼亚州',originCity:'洛杉矶',originDistrict:'',originAddress:'LOS ANGELES, CA 90045',consigneeName:'深圳精智达半导体技术有限公司',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海浦东国际机场海关监管仓库',productNameCn:'升降搬运装置',cargoQuantity:3,packageTypeDesc:'木制或竹藤等植物性材料制盒/箱',estimatedLossAmount:5000,lossCurrency:'美元',accidentTime:'2026-06-26 18:00:00',accidentCountryCode:'国内(Domestic)',accidentCountry:'中国',accidentProvince:'上海市',accidentCity:'上海市',accidentDistrict:'浦东新区',accidentAddress:'上海浦东国际机场',accidentDescription:'货物在卸机过程中外包装受损，部分货物表面划伤',accidentFiles:[],claimResultDetail:'经勘查确认属于保险责任范围，赔付5000美元',claimAmount:5000,claimFiles:[]}),'2026-06-25T14:30:00.000Z','2026-06-26T16:00:00.000Z'],
    ['clm-2','RPT20260628001','待审批','2026-06-28 09:15:00','费斌','PYDL202631010000002682','中国人保','英特尔贸易（上海）有限公司','',ai({jobidref:'PAC-INTEL26060002Y',applicantDept:'供应链部',billNo:'BL20260626999',originCountryCode:'国内(Domestic)',originCountry:'中国',originProvince:'辽宁省',originCity:'大连市',originDistrict:'金州区',originAddress:'大连市金州区经济技术开发区',consigneeName:'英特尔贸易（上海）有限公司',destCountryCode:'国内(Domestic)',destCountry:'中国',destProvince:'上海市',destCity:'上海市',destDistrict:'浦东新区',destAddress:'上海市浦东新区外高桥保税区',productNameCn:'中央处理器',cargoQuantity:50,packageTypeDesc:'天然木托',estimatedLossAmount:150000,lossCurrency:'人民币',accidentTime:'2026-06-27 22:30:00',accidentCountryCode:'国内(Domestic)',accidentCountry:'中国',accidentProvince:'江苏省',accidentCity:'苏州市',accidentDistrict:'昆山市',accidentAddress:'G2京沪高速昆山段',accidentDescription:'运输途中遭遇暴雨，部分货物受潮',accidentFiles:[],claimResultDetail:'',claimAmount:0,claimFiles:[]}),'2026-06-28T09:15:00.000Z','2026-06-28T09:15:00.000Z'],
  ];

  for (const r of rows) {
    db.run(`INSERT OR IGNORE INTO claim_reports VALUES (${r.map((v) => v === null ? 'NULL' : typeof v === 'number' ? String(v) : typeof v === 'string' && v.startsWith("'") ? v : q(v)).join(',')})`);
  }
}
