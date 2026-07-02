import type { ClaimReport } from '../types';

export const mockClaims: ClaimReport[] = [
  { id: 1, reportNo: 'BA202605270001', reportStatus: '审批拒绝', reportTime: '2026-05-27 13:52:50', applicantName: '曾婷婷', policyNo: 'PYII202631010000001565', insuranceCompany: '人保财险', insuredCompany: '辰源微（苏州）半导体科技有限公司', claimResult: '-' },
  { id: 2, reportNo: 'BA202606050001', reportStatus: '审批通过', reportTime: '2026-06-05 13:58:52', applicantName: '曾婷婷', policyNo: 'PYII202631010000002054', insuranceCompany: '人保财险', insuredCompany: '大昌洋行（上海）有限公司', claimResult: '1' },
  { id: 3, reportNo: 'BA202606170001', reportStatus: '审批通过', reportTime: '2026-06-17 14:43:09', applicantName: '唐明元', policyNo: 'PYII202631010000002242', insuranceCompany: '人保财险', insuredCompany: '萍乡德博科技股份有限公司', claimResult: '-' },
  { id: 4, reportNo: 'BA202606250001', reportStatus: '已确认', reportTime: '2026-06-25 16:47:20', applicantName: '刘畅', policyNo: 'PYII202631010000002321', insuranceCompany: '中国人保', insuredCompany: '群福电子科技（上海）有限公司', claimResult: '拒赔' },
];
