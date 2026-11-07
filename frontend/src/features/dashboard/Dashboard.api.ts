import { apiRequest } from '../../api/api';
import type { RenderJob } from '../jobs/types';

export interface DashboardStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  recent_jobs: RenderJob[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/dashboard/summary');
}