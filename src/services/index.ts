/** Service 层统一导出 */

export { ok, fail, simulateDelay } from './api';
export type { ApiResponse } from './api';

export {
  fetchApplications,
  fetchApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} from './applicationService';
