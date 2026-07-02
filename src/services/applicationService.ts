/**
 * 投保申请 Service 层
 * 当前基于 Mock 数据；后续替换 transport 即可对接真实 API
 */

import type { InsuranceApplication } from '../types';
import type { ApiResponse } from './api';
import { ok, fail, simulateDelay } from './api';
import { mockApplications } from '../mock/applications';

/** 获取投保单列表（支持分页 + 搜索 + 版本筛选） */
export async function fetchApplications(params: {
  page?: number;
  pageSize?: number;
  searchText?: string;
  filters?: Partial<Record<string, string>>;
  latestOnly?: boolean;
} = {}): Promise<ApiResponse<InsuranceApplication[]>> {
  await simulateDelay();

  const { page = 1, pageSize = 10, searchText, filters, latestOnly = true } = params;

  let data = latestOnly ? mockApplications.filter((r) => r.isLatest) : [...mockApplications];

  // 搜索（匹配业务参考号、投保单号、企业名称、保单单号）
  if (searchText) {
    const kw = searchText.toLowerCase();
    data = data.filter((r) =>
      r.businessRefNo.toLowerCase().includes(kw)
      || r.applicationNo.toLowerCase().includes(kw)
      || r.applicantCompany.toLowerCase().includes(kw)
      || r.policyNo.toLowerCase().includes(kw)
    );
  }

  // 精确字段筛选
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        data = data.filter((r) => String((r as unknown as Record<string, string>)[key] || '') === value);
      }
    }
  }

  const total = data.length;
  const start = (page - 1) * pageSize;
  const paged = data.slice(start, start + pageSize);

  return ok(paged, { total, page, pageSize });
}

/** 根据 ID 获取投保单详情 */
export async function fetchApplicationById(id: number): Promise<ApiResponse<InsuranceApplication | null>> {
  await simulateDelay();
  const record = mockApplications.find((a) => a.id === id);
  return record ? ok(record) : fail('投保单不存在');
}

/** 创建投保单 */
export async function createApplication(data: Partial<InsuranceApplication>): Promise<ApiResponse<InsuranceApplication>> {
  await simulateDelay();
  const newId = Math.max(...mockApplications.map((a) => a.id)) + 1;
  const record = { ...data, id: newId } as InsuranceApplication;
  mockApplications.unshift(record);
  return ok(record);
}

/** 更新投保单 */
export async function updateApplication(
  id: number,
  data: Partial<InsuranceApplication>,
): Promise<ApiResponse<InsuranceApplication>> {
  await simulateDelay();
  const idx = mockApplications.findIndex((a) => a.id === id);
  if (idx === -1) return fail('投保单不存在') as never;

  const updated = { ...mockApplications[idx], ...data };
  mockApplications[idx] = updated;
  return ok(updated);
}

/** 删除投保单（仅待发起状态可删除） */
export async function deleteApplication(id: number): Promise<ApiResponse<null>> {
  await simulateDelay();
  const idx = mockApplications.findIndex((a) => a.id === id);
  if (idx === -1) return fail('投保单不存在');

  const record = mockApplications[idx];
  if (record.approvalStatus !== '待发起') return fail('仅草稿状态的投保单可删除');

  mockApplications.splice(idx, 1);
  return ok(null);
}
