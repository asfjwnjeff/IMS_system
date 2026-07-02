/**
 * API 响应信封（统一格式）
 * 后续对接真实后端时只需改 transport 层，页面代码无需变动
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

/** 模拟网络延迟 (200-600ms)，让交互更真实 */
export function simulateDelay(): Promise<void> {
  const ms = 200 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 包装数据为成功响应 */
export function ok<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return { success: true, data, meta };
}

/** 包装错误为失败响应 */
export function fail(error: string): ApiResponse<null> {
  return { success: false, data: null, error };
}
