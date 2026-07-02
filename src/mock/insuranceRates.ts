import type { InsuranceRate } from '../types';

export const mockInsuranceRates: InsuranceRate[] = [
  { id: 1, insuranceCompany: '中国人保', rate: 0.00025, effectiveDate: '2026-06-09', expiryDate: '2026-06-30', cargoType: 'CPU', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2026-06-09 10:25:23' },
  { id: 2, insuranceCompany: '中国人保', rate: 0.0004, effectiveDate: '2025-09-07', expiryDate: '2026-09-06', cargoType: '裸装的半导体反应腔、激光发生器、升降机、冷却器、电路板', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2026-01-19 16:08:37' },
  { id: 3, insuranceCompany: '中国人保', rate: 0.0004, effectiveDate: '2025-09-07', expiryDate: '2026-09-06', cargoType: '全新的电子产品、电子元器件、精密仪器', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2026-01-19 16:07:14' },
  { id: 4, insuranceCompany: '中国平安', rate: 0.00042, effectiveDate: '2025-09-28', expiryDate: '2026-09-27', cargoType: '精密仪器、普通货物', status: '启用', cargoValueRMB: 0, agreementNo: '', minCharge: 0, packageType: '', oldNewType: '', remark: '', creator: '陆晓峰', createTime: '2025-11-12 17:01:51' },
];
