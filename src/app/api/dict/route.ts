import { NextRequest, NextResponse } from 'next/server';
import {
  INSURANCE_COMPANIES,
  CURRENCIES,
  COUNTRIES,
  PACKAGE_TYPES,
  OLD_NEW_TYPES,
  APPROVAL_STATUSES,
  INSURANCE_POLICY_STATUSES,
  CLAIM_STATUSES,
} from '@/lib/types';

const DICT_MAP: Record<string, readonly string[]> = {
  insuranceCompanies: INSURANCE_COMPANIES,
  currencies: CURRENCIES,
  countries: COUNTRIES,
  packageTypes: PACKAGE_TYPES,
  oldNewTypes: OLD_NEW_TYPES,
  approvalStatuses: APPROVAL_STATUSES,
  insurancePolicyStatuses: INSURANCE_POLICY_STATUSES,
  claimStatuses: CLAIM_STATUSES,
  insuranceCategories: ['非保入库', '保入库'],
  applicationTypes: ['新增投保单', '批改申请'],
  transportModes: ['航空运输', '公路运输', '铁路运输', '水路运输'],
  carriageTypes: ['普通集装箱', '罐式集装箱', '平板集装箱', '其他'],
  markupRatios: ['发票金额原值100%', '发票金额原值110%', '发票金额原值120%'],
  goodsNatures: ['新货', '旧货'],
  containerOptions: ['是', '否'],
  countryCodes: ['国际(International)', '国内(Domestic)'],
};

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  if (!type || !DICT_MAP[type]) {
    return NextResponse.json({
      success: true,
      data: Object.keys(DICT_MAP),
    });
  }
  return NextResponse.json({
    success: true,
    data: DICT_MAP[type],
  });
}
