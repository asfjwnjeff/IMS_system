/**  barrel — 向后兼容。实际数据已拆分到各子文件 */

// 重新导出 mock 数据
export { mockExchangeRates } from './exchangeRates';
export { mockInsuranceRates } from './insuranceRates';
export { mockApplications } from './applications';
export { mockClaims } from './claims';

// 重新导出历史记录 mock
export { mockHistoryVersions, mockApprovalHistory, mockChangeLogs } from './applications';

// 重新导出下拉选项
export {
  insuranceCompanies,
  approvalStatuses,
  insurancePolicyStatuses,
  claimStatuses,
  currencies,
  countries,
  packageTypes,
  oldNewTypes,
} from './constants';

// 重新导出类型（保持兼容，新代码建议直接从 '../../types' 导入）
export type { HistoryVersion, ApprovalHistoryEntry, ChangeLogEntry } from '../types';
