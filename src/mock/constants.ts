// ========== 下拉选项常量 ==========

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

// 兼容旧代码的别名
export const insuranceCompanies = INSURANCE_COMPANIES as unknown as string[];
export const approvalStatuses = APPROVAL_STATUSES as unknown as string[];
export const insurancePolicyStatuses = INSURANCE_POLICY_STATUSES as unknown as string[];
export const claimStatuses = CLAIM_STATUSES as unknown as string[];
export const currencies = CURRENCIES as unknown as string[];
export const countries = COUNTRIES as unknown as string[];
export const packageTypes = PACKAGE_TYPES as unknown as string[];
export const oldNewTypes = OLD_NEW_TYPES as unknown as string[];
